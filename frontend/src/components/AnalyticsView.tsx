/**
 * AnalyticsView.tsx — Selective-visibility analytics dashboard (Track 4)
 *
 * Shows private metrics for the authenticated party plus anonymized
 * ecosystem benchmarks. Includes a natural-language AI query interface.
 */

import { useState } from 'react';
import type { Contract, VaultPayload, LPSharePayload, ProposalPayload } from '../services/devnet';

interface AnalyticsViewProps {
  vaults:    Contract<VaultPayload>[];
  lpShares:  Contract<LPSharePayload>[];
  proposals: Contract<ProposalPayload>[];
  partyId:   string | null;
}

// Simulated anonymized ecosystem benchmarks (in production: fetched from Modo API)
const BENCHMARKS = {
  avgVaultUtilization:   0.64,
  avgExpectedYield:      0.0418,
  avgRiskScore:          0.38,
  networkTxPerHour:      142,
  activeVaultCount:      23,
};

export const AnalyticsView = ({ vaults, lpShares, proposals, partyId }: AnalyticsViewProps) => {
  const [query,    setQuery]    = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);

  // Private metrics for this party
  const myVaults   = vaults.filter(v => v.payload.manager === partyId);
  const myShares   = lpShares.filter(s => s.payload.lp === partyId);
  const myProposals= proposals.filter(p => p.payload.manager === partyId);
  const myTVL      = myVaults.reduce((s, v) => s + parseFloat(v.payload.targetTVL), 0);
  const myExposure = myShares.reduce((s, sh) => s + parseFloat(sh.payload.amount), 0);
  const avgRisk    = myProposals.length > 0
    ? myProposals.reduce((s, p) => s + parseFloat(p.payload.riskScore), 0) / myProposals.length
    : 0;

  // Simulated AI query handler (in production: sends to LLM with on-chain context)
  const handleQuery = async () => {
    if (!query.trim()) return;
    setThinking(true);
    setAiAnswer(null);

    // Simulate network latency
    await new Promise(r => setTimeout(r, 1400));

    // Simple rule-based answers keyed to common queries
    const q = query.toLowerCase();
    let answer = '';
    if (q.includes('yield') || q.includes('return')) {
      answer = `Your portfolio's weighted average expected yield across ${myProposals.length} AI proposals is ${(myProposals.reduce((s,p)=>s+parseFloat(p.payload.expectedYield),0)/Math.max(1,myProposals.length)*100).toFixed(2)}%. The DevNet average is ${(BENCHMARKS.avgExpectedYield*100).toFixed(2)}%.`;
    } else if (q.includes('risk')) {
      answer = `Your average AI risk score is ${(avgRisk * 100).toFixed(0)}/100. The DevNet average is ${(BENCHMARKS.avgRiskScore * 100).toFixed(0)}/100. ${avgRisk < BENCHMARKS.avgRiskScore ? 'Your portfolio is below the network average — good capital discipline.' : 'Consider reviewing high-risk proposals before approval.'}`;
    } else if (q.includes('collateral') || q.includes('utilization')) {
      answer = `Collateral utilization: your pledged exposure is $${myExposure.toLocaleString()} against a target TVL of $${myTVL.toLocaleString()}. Network-wide average utilization is ${(BENCHMARKS.avgVaultUtilization * 100).toFixed(0)}%.`;
    } else {
      answer = `Analyzing your portfolio: ${myVaults.length} vault(s) managed, ${myShares.length} LP position(s), ${myProposals.length} AI proposal(s). Total managed TVL: $${myTVL.toLocaleString()}. Network has ${BENCHMARKS.activeVaultCount} active vaults with ${BENCHMARKS.networkTxPerHour} tx/hour. Your privacy is fully preserved — benchmarks are anonymized aggregates only.`;
    }

    setAiAnswer(answer);
    setThinking(false);
  };

  const MetricRow = ({ label, mine, benchmark, format = 'number' }: {
    label: string;
    mine: number;
    benchmark: number;
    format?: 'number' | 'percent' | 'usd';
  }) => {
    const fmt = (v: number) =>
      format === 'percent' ? `${(v * 100).toFixed(2)}%`
      : format === 'usd' ? `$${v.toLocaleString()}`
      : v.toFixed(2);
    const better = mine <= benchmark;
    return (
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px',
        padding: '14px 16px', borderBottom: '1px solid var(--border-glass)', alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{fmt(mine)}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-mono text-muted" style={{ fontSize: '0.85rem' }}>{fmt(benchmark)}</span>
          <span style={{ fontSize: '0.75rem', color: better ? 'var(--accent-primary)' : 'var(--accent-amber)' }}>
            {better ? '↓ better' : '↑ above avg'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '32px 28px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <h2>Analytics</h2>
          <span className="badge badge-blue">Track 4</span>
          <span className="badge badge-teal">Privacy-First</span>
        </div>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
          Your private metrics vs. anonymized DevNet benchmarks. All comparisons use aggregate data — no individual positions are exposed.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>

        {/* Private metrics */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>
            🔒 Your Private Metrics
            <span className="badge badge-teal" style={{ marginLeft: '10px', fontSize: '0.7rem' }}>Visible only to you</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="stat-box">
              <span className="stat-value text-amber">${myTVL.toLocaleString()}</span>
              <span className="stat-label">Total Target TVL Managed</span>
            </div>
            <div className="stat-box">
              <span className="stat-value text-teal">${myExposure.toLocaleString()}</span>
              <span className="stat-label">LP Exposure (Pledged)</span>
            </div>
            <div className="stat-box">
              <span className="stat-value" style={{ color: avgRisk < 0.5 ? 'var(--accent-primary)' : 'var(--accent-amber)' }}>
                {(avgRisk * 100).toFixed(0)} / 100
              </span>
              <span className="stat-label">Avg AI Risk Score</span>
            </div>
            <div className="stat-box">
              <span className="stat-value text-purple">{myProposals.length}</span>
              <span className="stat-label">AI Proposals Generated</span>
            </div>
          </div>
        </div>

        {/* Ecosystem benchmarks */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px' }}>
            🌐 DevNet Benchmarks
            <span className="badge badge-amber" style={{ marginLeft: '10px', fontSize: '0.7rem' }}>Anonymized</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="stat-box">
              <span className="stat-value text-amber">{(BENCHMARKS.avgVaultUtilization * 100).toFixed(0)}%</span>
              <span className="stat-label">Avg Vault Utilization</span>
            </div>
            <div className="stat-box">
              <span className="stat-value text-teal">{(BENCHMARKS.avgExpectedYield * 100).toFixed(2)}%</span>
              <span className="stat-label">Avg Expected Yield</span>
            </div>
            <div className="stat-box">
              <span className="stat-value text-amber">{(BENCHMARKS.avgRiskScore * 100).toFixed(0)} / 100</span>
              <span className="stat-label">Avg Risk Score</span>
            </div>
            <div className="stat-box">
              <span className="stat-value" style={{ color: 'var(--accent-blue)' }}>{BENCHMARKS.networkTxPerHour} tx/hr</span>
              <span className="stat-label">Network Transaction Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Comparative Analysis</h3>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0',
          padding: '10px 16px', background: 'var(--bg-glass)',
          borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          borderBottom: '1px solid var(--border-glass)',
        }}>
          <span className="input-label" style={{ margin: 0 }}>Metric</span>
          <span className="input-label" style={{ margin: 0 }}>Your Value</span>
          <span className="input-label" style={{ margin: 0 }}>Network Avg</span>
        </div>
        <MetricRow label="Expected Yield"
          mine={myProposals.reduce((s,p)=>s+parseFloat(p.payload.expectedYield),0)/Math.max(1,myProposals.length)}
          benchmark={BENCHMARKS.avgExpectedYield} format="percent" />
        <MetricRow label="Avg Risk Score"
          mine={avgRisk}
          benchmark={BENCHMARKS.avgRiskScore} format="percent" />
      </div>

      {/* Natural language AI query */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <h3>🤖 AI Portfolio Advisor</h3>
          <span className="badge badge-purple">Natural Language</span>
        </div>
        <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
          Ask anything about your portfolio in plain English. Example: "What is my collateral utilization vs the network?"
        </p>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            id="ai-query-input"
            className="input"
            placeholder="e.g. What is my risk score compared to the network?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuery()}
          />
          <button
            id="ai-query-btn"
            className="btn btn-primary"
            onClick={handleQuery}
            disabled={thinking || !query.trim()}
            style={{ whiteSpace: 'nowrap' }}
          >
            {thinking ? <><span className="spinner" /> Analyzing…</> : 'Ask AI'}
          </button>
        </div>

        {aiAnswer && (
          <div style={{
            padding: '16px 20px',
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.25)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.9rem',
            lineHeight: 1.7,
          }}>
            <strong className="text-purple">AI Advisor:</strong>
            <p style={{ marginTop: '6px', color: 'var(--text-secondary)' }}>{aiAnswer}</p>
          </div>
        )}
      </div>
    </div>
  );
};
