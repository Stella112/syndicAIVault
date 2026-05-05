/**
 * VaultsView.tsx — Vault list + Create Vault form
 * Replicating Syndic Spark Lovable App UI
 */

import { useState, type FormEvent } from 'react';
import type { Contract, VaultPayload } from '../services/devnet';

interface VaultsViewProps {
  vaults:   Contract<VaultPayload>[];
  partyId:  string | null;
  loading:  boolean;
  onCreate: (name: string, targetAsset: string, targetTVL: number, manager: string) => Promise<void>;
}

export const VaultsView = ({ vaults, partyId, loading, onCreate }: VaultsViewProps) => {
  const [showForm,  setShowForm]  = useState(false);
  const [creating,  setCreating]  = useState(false);
  const [formName,  setFormName]  = useState('');
  const [formDesc,  setFormDesc]  = useState('');
  const [formAUM,   setFormAUM]   = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!partyId) { setFormError('No party ID — are you logged in?'); return; }
    const aum = parseFloat(formAUM);
    if (isNaN(aum) || aum <= 0) { setFormError('AUM must be positive'); return; }
    setCreating(true); setFormError(null);
    try {
      await onCreate(formName, formDesc, aum, partyId);
      setShowForm(false); setFormName(''); setFormDesc(''); setFormAUM('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create vault');
    } finally { setCreating(false); }
  };

  return (
    <div style={{ padding: '40px 32px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h2 style={{ marginBottom: '8px', fontSize: '1.8rem' }}>Active LP Interests</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
            Syndicated liquidity pools recorded on Canton Network.
          </p>
        </div>
        <button id="create-vault-btn" className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ New Interest'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass-card" style={{ padding: '32px', marginBottom: '32px', border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: 'var(--shadow-emerald)' }}>
          <h3 style={{ marginBottom: '8px', fontSize: '1.2rem' }}>Create Syndicated Vault</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '24px' }}>
            Configure target size and underlying asset parameters.
          </p>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label htmlFor="vault-name" className="input-label">Interest Name</label>
                <input id="vault-name" className="input" placeholder="e.g. US Treasury Alpha"
                  value={formName} onChange={e => setFormName(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="vault-aum" className="input-label">Target Size (USD)</label>
                <input id="vault-aum" className="input" type="number" placeholder="e.g. 5000000"
                  value={formAUM} onChange={e => setFormAUM(e.target.value)} min="1" required />
              </div>
            </div>
            <div>
              <label htmlFor="vault-desc" className="input-label">Description / Strategy</label>
              <input id="vault-desc" className="input" placeholder="Brief strategy description"
                value={formDesc} onChange={e => setFormDesc(e.target.value)} />
            </div>
            {formError && <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0 }}>⚠️ {formError}</p>}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button id="submit-vault-btn" type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? <><span className="spinner" /> Recording on Canton…</> : 'Submit to Ledger'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vault list */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {loading && vaults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <span className="spinner" style={{ width: '36px', height: '36px' }} />
            <p className="text-muted" style={{ marginTop: '16px', fontSize: '0.9rem' }}>Querying active contracts…</p>
          </div>
        ) : vaults.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🏦</div>
            <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.1rem' }}>No active interests</p>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Create your first vault to begin AI proposal generation.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '0 12px 12px', borderBottom: '1px solid var(--border-glass)', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Interest / Description</span>
              <span>Status</span>
              <span style={{ textAlign: 'right' }}>Target Size</span>
            </div>
            
            {vaults.map((vault, i) => {
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
                    <div style={{ fontWeight: 500, fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>
                      {vault.payload.name || 'Unnamed Vault'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {vault.payload.description || 'No description provided.'}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '6px', opacity: 0.7 }}>
                      {vault.contractId}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`status-dot status-dot-${dotColor}`} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {vault.payload.status}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 600, color: '#fff', fontSize: '1.05rem' }}>
                    ${parseFloat(vault.payload.totalPayrollAmount || '0').toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
