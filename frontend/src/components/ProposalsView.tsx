/**
 * ProposalsView.tsx — AI-generated proposal review panel
 * Replicating Syndic Spark Lovable App UI
 */

import { useState } from 'react';
import type { Contract, ProposalPayload } from '../services/devnet';

interface ProposalsViewProps {
  proposals: Contract<ProposalPayload>[];
  partyId:   string | null;
  loading:   boolean;
  onApprove: (contractId: string, manager: string) => Promise<void>;
  onReject:  (contractId: string, manager: string) => Promise<void>;
}

export const ProposalsView = ({ proposals, partyId, loading, onApprove, onReject }: ProposalsViewProps) => {
  const [acting, setActing] = useState<string | null>(null);

  const handleApprove = async (contractId: string, owner: string) => {
    setActing(contractId + '-approve');
    try { await onApprove(contractId, owner); } finally { setActing(null); }
  };
  const handleReject = async (contractId: string, owner: string) => {
    setActing(contractId + '-reject');
    try { await onReject(contractId, owner); } finally { setActing(null); }
  };

  return (
    <div style={{ padding: '40px 32px', maxWidth: '1000px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '1.8rem' }}>AI Governance</h2>
          {proposals.length > 0 && (
            <span className="badge badge-emerald" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
              {proposals.filter(p => p.payload.status === 'PENDING').length} Pending Review
            </span>
          )}
        </div>
        <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
          Review autonomous AI allocation proposals for your syndicated vaults.
        </p>
      </div>

      {/* List */}
      {loading && proposals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <span className="spinner" style={{ width: '36px', height: '36px' }} />
          <p className="text-muted" style={{ marginTop: '16px' }}>Fetching proposals from Canton…</p>
        </div>
      ) : proposals.length === 0 ? (
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🤖</div>
          <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.1rem' }}>No pending proposals</p>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            The AI Agent will generate proposals when it detects active Vault contracts.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {proposals.map(proposal => {
            const canAct = proposal.payload.owner === partyId && proposal.payload.status === 'PENDING';
            const amount = parseFloat(proposal.payload.amount || '0');
            const propId = proposal.payload.proposalId.split('-').pop()?.substring(0,6).toUpperCase() || 'XXXX';

            return (
              <div
                key={proposal.contractId}
                className="glass-card glass-card-hoverable"
                style={{ padding: '32px' }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>
                      #PROP-{propId}
                    </span>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '4px',
                      background: proposal.payload.status === 'PENDING' ? 'rgba(245,158,11,0.1)' : 
                                  proposal.payload.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: proposal.payload.status === 'PENDING' ? 'var(--accent-warning)' : 
                             proposal.payload.status === 'APPROVED' ? 'var(--emerald-400)' : '#ef4444',
                      border: `1px solid ${
                        proposal.payload.status === 'PENDING' ? 'rgba(245,158,11,0.2)' : 
                        proposal.payload.status === 'APPROVED' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
                      }`
                    }}>
                      {proposal.payload.status}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p className="font-mono" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--emerald-400)', margin: 0 }}>
                      ${amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Grid info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Target Vault</span>
                    <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 500 }}>{proposal.payload.title}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Contract ID</span>
                    <span className="font-mono" style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>
                      {proposal.contractId.substring(0,16)}...
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Strategy Details</span>
                    <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 500, lineHeight: 1.6 }}>
                      {proposal.payload.description}
                    </span>
                  </div>
                  {proposal.payload.aiRecommendation && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--emerald-500)' }}>↳</span> AI Recommendation
                      </span>
                      <span style={{ fontSize: '0.95rem', color: '#fff', fontWeight: 500, background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
                        {proposal.payload.aiRecommendation}
                      </span>
                    </div>
                  )}
                </div>

                <hr className="divider" style={{ margin: '24px 0' }} />

                {/* Footer / Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    <span style={{ opacity: 0.6 }}>🔒 Selective disclosure:</span> Only showing fields authorized by Canton Network sub-transaction privacy.
                  </p>
                  
                  {canAct ? (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        className="btn btn-danger"
                        disabled={acting !== null}
                        onClick={() => handleReject(proposal.contractId, proposal.payload.owner)}
                        style={{ padding: '10px', borderRadius: '50%' }}
                        title="Reject"
                      >
                        {acting === proposal.contractId + '-reject' ? <span className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} /> : 
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        }
                      </button>
                      <button
                        className="btn btn-primary"
                        disabled={acting !== null}
                        onClick={() => handleApprove(proposal.contractId, proposal.payload.owner)}
                        style={{ padding: '10px', borderRadius: '50%' }}
                        title="Approve"
                      >
                        {acting === proposal.contractId + '-approve' ? <span className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} /> : 
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        }
                      </button>
                    </div>
                  ) : proposal.payload.status !== 'PENDING' ? (
                    <p className="text-muted" style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>
                      This proposal has been {proposal.payload.status.toLowerCase()}.
                    </p>
                  ) : (
                    <p className="text-muted" style={{ fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>
                      You are observing. Only the owner can act.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
