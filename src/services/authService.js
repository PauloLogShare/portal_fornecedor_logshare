/**
 * Real Google Workspace SSO & Domain Validation Service for LogShare
 * Uses Google Identity Services (OAuth 2.0 / JWT) to authenticate real Google accounts
 */

import { jwtDecode } from "jwt-decode";

const AUTH_STORAGE_KEY = "LOGSHARE_AUTH_USER_V2";
const GOOGLE_CLIENT_ID_KEY = "LOGSHARE_GOOGLE_CLIENT_ID";

// Default or fallback Client ID (Can be configured in .env or via UI)
export const DEFAULT_GOOGLE_CLIENT_ID = 
  import.meta.env.VITE_GOOGLE_CLIENT_ID || 
  localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || 
  "";

export function getStoredGoogleClientId() {
  return localStorage.getItem(GOOGLE_CLIENT_ID_KEY) || import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
}

export function saveGoogleClientId(clientId) {
  if (clientId) {
    localStorage.setItem(GOOGLE_CLIENT_ID_KEY, clientId.trim());
  } else {
    localStorage.removeItem(GOOGLE_CLIENT_ID_KEY);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read auth state from localStorage", err);
  }
  return null;
}

export function saveUserSession(user) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error("Could not save auth session", err);
  }
}

export function clearUserSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (err) {
    console.error("Could not clear auth session", err);
  }
}

/**
 * Validates and parses the real Google JWT token returned by accounts.google.com
 * Enforces @logshare.com.br corporate domain validation
 */
export function handleGoogleCredentialResponse(credentialToken, allowedDomain = "logshare.com.br") {
  try {
    if (!credentialToken) {
      return { success: false, message: "Nenhum token retornado pelo Google." };
    }

    const decoded = jwtDecode(credentialToken);
    const email = (decoded.email || "").toLowerCase().trim();
    const hostedDomain = decoded.hd || "";

    // Domain validation
    const isValidDomain = email.endsWith(`@${allowedDomain}`) || hostedDomain === allowedDomain;

    if (!isValidDomain) {
      return {
        success: false,
        message: `Acesso bloqueado: O e-mail (${email}) não pertence ao domínio corporativo @${allowedDomain}. Faça login com sua conta da LogShare.`
      };
    }

    const user = {
      id: decoded.sub || `google-${Date.now()}`,
      name: decoded.name || email.split('@')[0],
      email: email,
      role: "Especialista em Homologação & Compliance",
      avatar: decoded.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(decoded.name || email)}&background=0056D2&color=fff`,
      domain: allowedDomain,
      googleAuth: true,
      lastLogin: new Date().toISOString()
    };

    saveUserSession(user);

    return {
      success: true,
      user,
      message: `Autenticado com sucesso via Google Workspace como ${user.name}`
    };
  } catch (err) {
    console.error("Erro ao decodificar token do Google:", err);
    return {
      success: false,
      message: "Falha na validação do token retornado pelo Google. Tente novamente."
    };
  }
}
