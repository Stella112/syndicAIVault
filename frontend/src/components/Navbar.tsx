/**
 * Navbar.tsx — Top navigation bar
 */

interface NavbarProps {
  partyId: string | null;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: '📊' },
  { id: 'vaults',    label: 'Vaults',     icon: '🏦' },
  { id: 'proposals', label: 'Proposals',  icon: '🤖' },
  { id: 'analytics', label: 'Analytics',  icon: '📈' },
];

export const Navbar = ({ partyId, onLogout, activeTab, onTabChange }: NavbarProps) => {
  const shortParty = partyId
    ? `${partyId.slice(0, 8)}…${partyId.slice(-6)}`
    : 'Unknown';

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      height: '64px',
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(2, 8, 23, 0.8)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(16,185,129,0.1)"></path>
          <path d="M12 8v4l3 3"></path>
        </svg>
        <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em', color: '#fff' }}>
          Syndic <span style={{ color: 'var(--emerald-500)' }}>Spark</span>
        </span>
        <span className="badge badge-emerald" style={{ marginLeft: '4px', fontSize: '0.65rem' }}>BETA</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            id={`nav-${tab.id}`}
            className="btn btn-ghost"
            onClick={() => onTabChange(tab.id)}
            style={{
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              background: activeTab === tab.id ? 'rgba(255,255,255,0.05)' : 'transparent',
              borderRadius: 'var(--radius-md)',
              padding: '6px 14px',
              fontSize: '0.85rem',
              fontWeight: 500,
              transition: 'all var(--transition-fast)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Party + Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-glass)' }}>
          <span className="status-dot status-dot-emerald" />
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {shortParty}
          </span>
        </div>
        <button id="logout-btn" className="btn btn-secondary" onClick={onLogout} style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: 'var(--radius-md)' }}>
          Disconnect
        </button>
      </div>
    </nav>
  );
};
