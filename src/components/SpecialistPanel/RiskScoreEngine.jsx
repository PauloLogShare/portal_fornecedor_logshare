import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Award, TrendingUp, FileCheck, DollarSign, Truck } from 'lucide-react';
import { RISK_LEVELS } from '../../services/riskEngineService';

export default function RiskScoreEngine({ scoreTotal, breakdown }) {
  let riskObj = RISK_LEVELS.ALTO;
  if (scoreTotal >= 800) riskObj = RISK_LEVELS.BAIXO;
  else if (scoreTotal >= 600) riskObj = RISK_LEVELS.MEDIO;

  const b = breakdown || {
    documental: 0,
    financeiro: 0,
    gerenciamentoRisco: 0,
    operacional: 0
  };

  return (
    <div className="card" style={{ borderTop: `4px solid ${riskObj.color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-900)' }}>
            Matriz de Score & Avaliação de Risco
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Cálculo algorítmico multicritério (0 a 1000 pontos)
          </span>
        </div>
        <span className={`badge ${riskObj.badge}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
          {riskObj.label} (Classe {riskObj.class})
        </span>
      </div>

      {/* Main Score Hero Box */}
      <div className="score-gauge-box" style={{ marginBottom: '1.5rem', background: `linear-gradient(135deg, #0A192F 0%, ${scoreTotal >= 800 ? '#064E3B' : scoreTotal >= 600 ? '#78350F' : '#7F1D1D'} 100%)` }}>
        <div>
          <div className="score-number" style={{ color: riskObj.color }}>
            {scoreTotal}
            <span className="score-max"> / 1000</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Índice de Qualificação LogShare
          </span>
        </div>

        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '1.5rem', flex: 1 }}>
          <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.4 }}>
            {scoreTotal >= 800 && (
              <span><strong>Excelente conformidade:</strong> Parceiro qualificado para operações prioritárias com risco reduzido.</span>
            )}
            {scoreTotal >= 600 && scoreTotal < 800 && (
              <span><strong>Risco Moderado:</strong> Requer aplicação de travas operacionais, limitação de LMG ou escolta.</span>
            )}
            {scoreTotal < 600 && (
              <span><strong>Alto Risco:</strong> Pontuação insuficiente para aprovação. Pendências críticas impeditivas.</span>
            )}
          </div>
        </div>
      </div>

      {/* 4-Dimension Breakdown Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Dimensão 1: Regularidade Documental */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.3rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <FileCheck size={15} color="var(--primary-600)" />
              1. Regularidade Documental (ANTT / CND / CNPJ)
            </span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {b.documental} / 300 pts
            </span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${(b.documental / 300) * 100}%`, height: '100%', background: 'var(--primary-600)', borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Dimensão 2: Saúde Financeira & Tempo */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.3rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <DollarSign size={15} color="#10B981" />
              2. Saúde Financeira, Fiscal & Tempo de Mercado
            </span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {b.financeiro} / 250 pts
            </span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${(b.financeiro / 250) * 100}%`, height: '100%', background: '#10B981', borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Dimensão 3: Gerenciamento de Risco e Seguros */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.3rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <ShieldCheck size={15} color="#F59E0B" />
              3. Gerenciamento de Risco, PGR & Coberturas (LMG)
            </span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {b.gerenciamentoRisco} / 250 pts
            </span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${(b.gerenciamentoRisco / 250) * 100}%`, height: '100%', background: '#F59E0B', borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {/* Dimensão 4: Capacidade Operacional & Frota */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.3rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <Truck size={15} color="#8B5CF6" />
              4. Capacidade Operacional, Frota & Telemetria
            </span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {b.operacional} / 200 pts
            </span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${(b.operacional / 200) * 100}%`, height: '100%', background: '#8B5CF6', borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
