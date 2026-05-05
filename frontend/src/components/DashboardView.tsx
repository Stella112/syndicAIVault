/**
 * DashboardView.tsx — Main dashboard with live Canton ledger stats
 * Replicating Syndic Spark Lovable App UI
 */

import { useState } from 'react';
import type { Contract, VaultPayload, LPSharePayload, ProposalPayload } from '../services/devnet';

interface DashboardViewProps {
  vaults:    Contract<VaultPayload>[];
  lpShares:  Contract<LPSharePayload>[];
  proposals: Contract<ProposalPayload>[];
  partyId:   string | null;
  loading:   boolean;
  onTabChange: (tab: string) => void;
}

export const DashboardView = ({
  vaults, proposals, partyId, loading, onTabChange,
}: DashboardViewProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const totalAUM = vaults.reduce((sum, v) => sum + parseFloat(v.payload.totalPayrollAmount || '0'), 0);
  const activeVaults = vaults.filter(v => v.payload.status === 'ACTIVE').length;
  const pendingProposals = proposals.filter(p => p.payload.status === 'PENDING').length;

  const stats = [
    {
      label: 'Liquidity Pool',
      value: `$${(totalAUM / 1e6).toFixed(2)}M`,
      change: '+12.5%',
      icon:  '💧',
    },
    {
      label: 'Active Positions',
      value: activeVaults.toString(),
      change: '+2',
      icon:  '🏦',
    },
    {
      label: 'Pending Settlements',
      value: pendingProposals.toString(),
      change: 'Action Needed',
      icon:  '⏳',
    },
    {
      label: 'Agent Status',
      value: 'Online',
      change: 'Polling Canton',
      icon:  '🤖',
    },
  ];

  return (
    <div style={{ padding: '40px 32px', maxWidth: '1280px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Dashboard</h2>
            {loading && <span className="spinner" />}
          </div>
          <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
            Real-world asset syndication on the Canton Network.
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '40px',
      }}>
        {stats.map(stat => (
          <div key={stat.label} className="glass-card glass-card-hoverable" style={{
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '140px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
                {stat.label}
              </span>
              <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>{stat.icon}</span>
            </div>
            <div>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', margin: '0 0 4px', lineHeight: 1, letterSpacing: '-0.02em' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '0.75rem', color: stat.change.includes('+') ? 'var(--emerald-400)' : 'var(--accent-warning)', margin: 0, fontWeight: 500 }}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '40px' }}>
        
        {/* Active LP Interests List (Recent Vaults) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Active LP Interests</h3>
            <button className="btn btn-ghost" onClick={() => onTabChange('vaults')} style={{ fontSize: '0.8rem' }}>
              View All
            </button>
          </div>

          {vaults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              <p>No active vaults.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '0 12px 12px', borderBottom: '1px solid var(--border-glass)', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span>Interest / Description</span>
                <span>Status</span>
                <span style={{ textAlign: 'right' }}>Target Size</span>
              </div>
              
              {vaults.slice(0, 5).map((vault, i) => {
                const statusDotColors = ['emerald', 'blue', 'amber'];
                const dotColor = statusDotColors[i % 3];
                return (
                  <div key={vault.contractId} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', alignItems: 'center',
                    padding: '16px 12px',
                    borderRadius: 'var(--radius-md)',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }} className="hover:bg-white/5" onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#fff', marginBottom: '4px' }}>
                        {vault.payload.name || 'Unnamed Vault'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {vault.payload.description || 'No description provided.'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`status-dot status-dot-${dotColor}`} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {vault.payload.status}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>
                      ${parseFloat(vault.payload.totalPayrollAmount || '0').toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Query Bar & Benchmarks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>AI Query</h3>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </span>
              <input 
                type="text" 
                className="input" 
                placeholder="Ask about yields, risks, or vaults..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', paddingRight: '40px', background: 'rgba(0,0,0,0.3)' }}
              />
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                ⌘K
              </span>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Recent Queries</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {proposals.slice(0,3).map(p => (
                  <div key={p.contractId} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--emerald-500)', marginTop: '2px' }}>↳</span>
                    <div>
                      <span style={{ color: '#fff' }}>Analyze {p.payload.title} risk profile</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Recommendation: {p.payload.aiRecommendation}
                      </div>
                    </div>
                  </div>
                ))}
                {proposals.length === 0 && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No recent queries.</div>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', flex: 1 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>Yield Benchmarks</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
              {[
                { name: 'US Treasuries (1Y)', yield: '4.8%', w: '85%', color: 'var(--emerald-500)' },
                { name: 'Corporate Bonds (IG)', yield: '5.2%', w: '95%', color: 'var(--accent-secondary)' },
                { name: 'SyndicAI Avg Yield', yield: '6.1%', w: '100%', color: 'var(--emerald-400)' },
              ].map(b => (
                <div key={b.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{b.name}</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{b.yield}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: b.w, background: b.color, borderRadius: '3px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
