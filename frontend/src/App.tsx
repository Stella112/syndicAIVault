/**
 * App.tsx — Root application component
 *
 * Orchestrates auth state, tab routing, and data fetching.
 * All Canton contract interactions happen through hooks.
 */

import { useState } from 'react';
import './index.css';

import { useAuth }   from './hooks/useAuth';
import { useVaults } from './hooks/useVaults';

import { LandingView }   from './components/LandingView';
import { LoginView }     from './components/LoginView';
import { Navbar }        from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { VaultsView }    from './components/VaultsView';
import { ProposalsView } from './components/ProposalsView';
import { AnalyticsView } from './components/AnalyticsView';

type Tab = 'dashboard' | 'vaults' | 'proposals' | 'analytics';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showLogin, setShowLogin] = useState(false);

  const { state: authState, partyId, error: authError, login, logout } = useAuth();

  const isAuthenticated = authState === 'authenticated';
  const { vaults, lpShares, proposals, loading, error: dataError,
    handleCreateVault, handleApprove, handleReject } = useVaults(isAuthenticated);

  // ── Render Landing / Login if not authenticated ──────────────────────────
  if (!isAuthenticated) {
    if (!showLogin) {
      return <LandingView onLaunchApp={() => setShowLogin(true)} />;
    }
    return (
      <LoginView onLogin={login} authState={authState} error={authError} />
    );
  }

  // ── Main application ──────────────────────────────────────────────────────
  return (
    <>

      <Navbar
        partyId={partyId}
        onLogout={logout}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as Tab)}
      />

      {/* Global data error banner */}
      {dataError && (
        <div className="toast toast-error" style={{ position: 'relative', bottom: 'auto', right: 'auto', margin: '12px 28px 0', borderRadius: '10px' }}>
          ⚠️ {dataError}
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            vaults={vaults}
            lpShares={lpShares}
            proposals={proposals}
            partyId={partyId}
            loading={loading}
            onTabChange={(tab) => setActiveTab(tab as Tab)}
          />
        )}
        {activeTab === 'vaults' && (
          <VaultsView
            vaults={vaults}
            partyId={partyId}
            loading={loading}
            onCreate={handleCreateVault}
          />
        )}
        {activeTab === 'proposals' && (
          <ProposalsView
            proposals={proposals}
            partyId={partyId}
            loading={loading}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsView
            vaults={vaults}
            lpShares={lpShares}
            proposals={proposals}
            partyId={partyId}
          />
        )}
      </main>
    </>
  );
}

export default App;
