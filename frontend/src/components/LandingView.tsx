/**
 * LandingView.tsx — Syndic Spark Precision Replica
 * Minimal Institutional Command Center Aesthetic
 */

import { Shield, Sparkles, ArrowRight, Lock, Vault, Bot, Vote, BarChart3, Zap } from 'lucide-react';
import { Backdrop } from './landing/Backdrop';

interface LandingViewProps {
  onLaunchApp: () => void;
}

export const LandingView = ({ onLaunchApp }: LandingViewProps) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* NAV (sticky, blurred) */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '64px',
        borderBottom: '1px solid var(--border-glass)',
        background: 'oklch(0.145 0.01 260 / 0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'oklch(0.78 0.17 160 / 0.1)', padding: '6px', borderRadius: '8px' }}>
            <Shield size={18} color="var(--emerald-primary)" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em', color: '#fff' }}>
            SyndicAI <span style={{ color: 'var(--emerald-primary)' }}>Vault</span>
          </span>
        </div>
        
        {/* Center */}
        <div className="hidden-mobile">
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Vaults</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Proposals</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Analytics</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Governance</span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'oklch(0.985 0.003 247 / 0.03)', padding: '6px 12px', borderRadius: '9999px', border: '1px solid var(--border-glass)' }}>
            <span className="status-dot animate-pulse" />
            <span className="font-mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
              Canton DevNet
            </span>
          </div>
          <button className="btn btn-primary glow-emerald" onClick={onLaunchApp}>
            Launch App
          </button>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        
        {/* 1. HERO */}
        <section style={{ position: 'relative', overflow: 'hidden' }} className="py-28">
          <Backdrop />
          <div className="grid-bg" style={{ position: 'absolute', inset: 0, zIndex: -1 }} />
          
          <div className="max-w-7xl mx-auto px-6 text-center" style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '9999px', marginBottom: '32px' }}>
              <Sparkles size={14} color="var(--emerald-primary)" />
              <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SyndicAI DevNet Beta · Live on Canton
              </span>
            </div>
            
            <h1 className="text-7xl font-semibold tracking-tight text-balance" style={{ marginBottom: '24px' }}>
              Privacy-first <span className="text-gradient">RWA syndication</span>, <br />
              governed by AI on Canton.
            </h1>
            
            <p className="text-muted" style={{ fontSize: '1.15rem', maxWidth: '42rem', margin: '0 auto 40px', lineHeight: 1.6 }}>
              Replace fragmented emails and spreadsheets with on-ledger AI proposals, selective-disclosure voting, and atomic DvP settlement.
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
              <button className="btn btn-primary glow-emerald" onClick={onLaunchApp} style={{ padding: '14px 28px' }}>
                Request institutional access <ArrowRight size={16} style={{ marginLeft: '4px' }} />
              </button>
              <button className="btn btn-secondary" style={{ padding: '14px 28px' }}>
                <Lock size={16} style={{ marginRight: '6px' }} /> View privacy model
              </button>
            </div>

            <p className="font-mono" style={{ fontSize: '10px', color: 'var(--border-glass)' }}>
              PartyID · f3ba5a8c-0c1f-4ed8-bf4d-c671ba956872::1220195a56748e538153ecc527422256c235ff27b367483b04e161d3bbc62b1ebf32
            </p>
          </div>
        </section>

        <div style={{ borderBottom: '1px solid var(--border-glass)' }} />

        {/* 2. TRUST BAR */}
        <section className="py-8" style={{ background: 'var(--bg-card)' }}>
          <div className="max-w-7xl mx-auto px-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <span className="font-mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Built natively on</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
              <span>Canton Network</span>
              <span>DAML Stakeholder Privacy</span>
              <span>Atomic DvP Settlement</span>
              <span>OIDC / Keycloak</span>
              <span>JSON Ledger API</span>
              <span>On-ledger AI Inference</span>
            </div>
          </div>
        </section>

        <div style={{ borderBottom: '1px solid var(--border-glass)' }} />

        {/* 3. FEATURES */}
        <section id="vaults" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div style={{ marginBottom: '64px' }}>
              <span className="font-mono text-emerald" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '16px' }}>PLATFORM</span>
              <h2 className="text-5xl font-semibold tracking-tight text-balance" style={{ marginBottom: '16px' }}>
                The institutional-grade backbone for tokenized Treasury repo.
              </h2>
              <p className="text-muted" style={{ fontSize: '1.1rem', maxWidth: '48rem' }}>
                A highly secure, deeply private infrastructure designed to bring syndicated private credit and Treasury flows onto the Canton Network.
              </p>
            </div>

            {/* Feature Grid (Hairline borders via bg-border gap) */}
            <div className="bg-border gap-px" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', borderRadius: '16px', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
              {[
                { icon: Vault, title: 'Private Vaults', desc: 'Sponsors deploy tokenized vaults representing RWA assets with target TVL constraints.' },
                { icon: Bot, title: 'On-Ledger AI Agent', desc: 'Autonomous agent polls the ledger, evaluating vault risk profiles and generating allocation proposals.' },
                { icon: Vote, title: 'Selective-Disclosure Voting', desc: 'Vault managers review cryptographically signed AI proposals on-chain and exercise Approve/Reject choices.' },
                { icon: BarChart3, title: 'Anonymized Benchmarks', desc: 'Compare your vault yields directly against live US Treasuries and Corporate Bond indices.' },
                { icon: Lock, title: 'Sub-Transaction Privacy', desc: 'Canton Network ensures your allocation strategies and vault parameters remain completely private.' },
                { icon: Zap, title: 'Atomic DvP Settlement', desc: 'Approved proposals settle atomically and instantly, reducing counterparty risk to near zero.' },
              ].map(f => (
                <div key={f.title} style={{ padding: '32px', background: 'var(--bg-primary)', transition: 'background var(--transition-fast)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card)'} onMouseOut={e => e.currentTarget.style.background = 'var(--bg-primary)'}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'oklch(0.78 0.17 160 / 0.1)', border: '1px solid oklch(0.78 0.17 160 / 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    <f.icon size={20} color="var(--emerald-primary)" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>{f.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. DASHBOARD PREVIEW */}
        <section className="py-8" style={{ paddingBottom: '96px' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="glass-card" style={{ padding: '8px', borderRadius: '24px', background: 'oklch(0.985 0.003 247 / 0.02)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
              <div style={{ background: 'var(--bg-primary)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderBottom: '1px solid var(--border-glass)', background: 'oklch(0.985 0.003 247 / 0.01)' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--emerald-primary)' }} />
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>syndicai.vault</div>
                </div>
                {/* Body */}
                <div style={{ padding: '32px', display: 'flex', gap: '24px', height: '500px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ height: '32px', width: '180px', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-glass)' }} />
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1, height: '120px', background: 'oklch(0.78 0.17 160 / 0.05)', border: '1px solid oklch(0.78 0.17 160 / 0.2)', borderRadius: '12px' }} />
                      <div style={{ flex: 1, height: '120px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px' }} />
                      <div style={{ flex: 1, height: '120px', background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px' }} />
                    </div>
                    <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px', marginTop: '16px' }} />
                  </div>
                  <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ height: '200px', background: 'oklch(0.70 0.28 330 / 0.05)', border: '1px solid oklch(0.70 0.28 330 / 0.2)', borderRadius: '12px' }} />
                    <div style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-glass)', borderRadius: '12px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div style={{ borderBottom: '1px solid var(--border-glass)' }} />

        {/* 5. HOW IT WORKS */}
        <section id="governance" className="py-24" style={{ background: 'oklch(0.985 0.003 247 / 0.01)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div style={{ marginBottom: '64px' }}>
              <span className="font-mono text-emerald" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '16px' }}>WORKFLOW</span>
              <h2 className="text-5xl font-semibold tracking-tight text-balance">
                From proposal to settlement in one verifiable flow.
              </h2>
            </div>
            
            <div className="bg-border gap-px" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(240px, 1fr))', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
              {[
                { num: '01', title: 'Create Vault', desc: 'Deploy a tokenized representation of RWA capital.' },
                { num: '02', title: 'AI Proposes', desc: 'Agent evaluates yield vs risk, submitting on-chain.' },
                { num: '03', title: 'Vote Privately', desc: 'Manager cryptographic signing within sub-transactions.' },
                { num: '04', title: 'Settle Atomically', desc: 'DvP execution natively across the Canton Network.' },
              ].map(s => (
                <div key={s.num} style={{ padding: '32px 24px', background: 'oklch(0.145 0.01 260 / 0.4)' }}>
                  <div className="font-mono text-emerald" style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{s.num}</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '8px' }}>{s.title}</h3>
                  <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div style={{ borderBottom: '1px solid var(--border-glass)' }} />

        {/* 6. PERSONA */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
              <div>
                <span className="font-mono text-emerald" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '16px' }}>BUILT FOR</span>
                <h2 className="text-5xl font-semibold tracking-tight text-balance" style={{ marginBottom: '24px' }}>
                  Family offices participating in Canton pilots.
                </h2>
                <p className="text-muted" style={{ fontSize: '1.1rem', marginBottom: '32px' }}>
                  We built SyndicAI Vault to solve the operational drag of traditional syndication, replacing manual off-chain coordination with an autonomous, deterministic network.
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    'End-to-end on-chain syndication',
                    'Atomic settlement removes counterparty risk',
                    'Selective disclosure preserves competitive privacy',
                    'Real-time anonymized peer benchmarks'
                  ].map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.05rem' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald-primary)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card" style={{ padding: '40px', background: 'oklch(0.20 0.01 260 / 0.8)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                <p style={{ fontSize: '1.25rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '32px' }}>
                  "We were managing $400M of repo flow through encrypted inboxes and spreadsheets. Moving that workflow to Canton with an AI agent generating the initial proposals has fundamentally changed our velocity."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'oklch(0.78 0.17 160 / 0.1)', border: '1px solid oklch(0.78 0.17 160 / 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--emerald-primary)' }}>
                    SC
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Sarah Chen</div>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>Director of Digital Assets · $2B+ Family Office</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div style={{ borderBottom: '1px solid var(--border-glass)' }} />

        {/* 7. CTA */}
        <section className="py-28" style={{ position: 'relative', overflow: 'hidden' }}>
          <Backdrop />
          <div className="grid-bg" style={{ position: 'absolute', inset: 0, zIndex: -1 }} />
          
          <div className="max-w-7xl mx-auto px-6 text-center" style={{ position: 'relative', zIndex: 10 }}>
            <h2 className="text-5xl font-semibold tracking-tight text-balance" style={{ marginBottom: '24px' }}>
              Ship your next syndication on Canton — <span className="text-gradient">privately</span>.
            </h2>
            <p className="text-muted" style={{ fontSize: '1.15rem', maxWidth: '32rem', margin: '0 auto 40px' }}>
              Join the HackCanton DevNet pilot and experience autonomous RWA settlement today.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <button className="btn btn-primary glow-emerald" onClick={onLaunchApp} style={{ padding: '14px 28px' }}>
                Request access <ArrowRight size={16} style={{ marginLeft: '4px' }} />
              </button>
              <button className="btn btn-secondary" style={{ padding: '14px 28px' }}>
                Read the DAML spec
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', background: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '64px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'oklch(0.78 0.17 160 / 0.1)', padding: '6px', borderRadius: '8px' }}>
                  <Shield size={18} color="var(--emerald-primary)" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em', color: '#fff' }}>
                  SyndicAI <span style={{ color: 'var(--emerald-primary)' }}>Vault</span>
                </span>
              </div>
              <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '24rem' }}>
                The minimal institutional standard for AI-governed private syndication on the Canton Network.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '8px' }}>Protocol</span>
              <a href="#" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>DAML Specs</a>
              <a href="#" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>Privacy Model</a>
              <a href="#" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>AI Agent</a>
              <a href="#" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>Audit Logs</a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '8px' }}>Company</span>
              <a href="#" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>HackCanton</a>
              <a href="#" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>Pitch Deck</a>
              <a href="#" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>Contact</a>
              <a href="#" className="text-muted" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>GitHub</a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-glass)', padding: '24px 0' }}>
          <div className="max-w-7xl mx-auto px-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>© 2026 SyndicAI · HackCanton Season #1 Submission</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-mono">● DevNet Synchronized</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
