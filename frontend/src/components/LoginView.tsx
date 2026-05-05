/**
 * LoginView.tsx — OIDC Login Screen
 *
 * Collects DevNet credentials and triggers the Keycloak
 * resource owner password grant flow via useAuth().
 */

import { useState, type FormEvent } from 'react';
import type { AuthState } from '../hooks/useAuth';

interface LoginViewProps {
  onLogin:  (email: string, password: string) => Promise<void>;
  authState: AuthState;
  error:    string | null;
}

export const LoginView = ({ onLogin, authState, error }: LoginViewProps) => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  const loading = authState === 'loading';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '48px 40px' }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '56px', height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #00d4aa22, #8b5cf622)',
            border: '1px solid rgba(0,212,170,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '24px',
          }}>
            🔐
          </div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>SyndicAI Vault</h1>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            Connect to the HackCanton DevNet
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="devnet-email" className="input-label">DevNet Email</label>
            <input
              id="devnet-email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="devnet-password" className="input-label">Password</label>
            <input
              id="devnet-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="toast-error" style={{
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
          >
            {loading ? <><span className="spinner" /> Authenticating…</> : 'Connect to DevNet'}
          </button>
        </form>

        {/* Footer note */}
        <p className="text-muted" style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '28px' }}>
          Credentials are used only to obtain a short-lived Bearer token via OIDC.<br />
          They are never stored on disk.
        </p>
      </div>
    </div>
  );
};
