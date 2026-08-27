/**
 * Google SSO & Role-Based Access Control (RBAC) Service for LogShare
 * Manages authenticated specialist session and validates @logshare.com.br corporate accounts
 */

const AUTH_STORAGE_KEY = "LOGSHARE_AUTH_USER_V1";

export const LOGSHARE_AUTHORIZED_SPECIALISTS = [
  {
    id: "user-1",
    name: "Carlos Eduardo Silveira",
    email: "carlos.silveira@logshare.com.br",
    role: "Especialista em Homologação & Risco",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    domain: "logshare.com.br"
  },
  {
    id: "user-2",
    name: "Marina Vasconcelos",
    email: "marina.vasconcelos@logshare.com.br",
    role: "Gerente de Compliance & Transportes",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
    domain: "logshare.com.br"
  },
  {
    id: "user-3",
    name: "Paulo Ferreira",
    email: "paulo.ferreira@logshare.com.br",
    role: "Auditor Líder de Frota & Risco",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    domain: "logshare.com.br"
  }
];

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
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
 * Authenticates user via Google Workspace SSO
 * Validates domain @logshare.com.br
 */
export async function loginWithGoogleSSO(customEmail = null) {
  // Simulate Google OAuth popup latency (0.6s)
  await new Promise(resolve => setTimeout(resolve, 600));

  const emailToUse = (customEmail || "carlos.silveira@logshare.com.br").toLowerCase().trim();

  // Validate corporate domain
  const isLogshareDomain = emailToUse.endsWith("@logshare.com.br");

  if (!isLogshareDomain) {
    return {
      success: false,
      message: `Acesso negado. O e-mail (${emailToUse}) não pertence ao domínio corporativo @logshare.com.br.`
    };
  }

  const existingProfile = LOGSHARE_AUTHORIZED_SPECIALISTS.find(s => s.email.toLowerCase() === emailToUse);

  const user = existingProfile || {
    id: `user-${Date.now()}`,
    name: emailToUse.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    email: emailToUse,
    role: "Especialista em Homologação LogShare",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(emailToUse)}&background=0056D2&color=fff`,
    domain: "logshare.com.br"
  };

  saveUserSession(user);

  return {
    success: true,
    user,
    message: `Autenticado com sucesso via Google Workspace como ${user.name}`
  };
}
