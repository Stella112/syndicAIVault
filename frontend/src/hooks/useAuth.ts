/**
 * useAuth.ts — Authentication state hook
 *
 * Manages the OIDC token lifecycle. Reads credentials from
 * sessionStorage so page refreshes don't force re-login.
 */

import { useState, useEffect, useCallback } from 'react';
import { authenticate, refreshToken, fetchPartyId, type AuthToken } from '../services/devnet';

export type AuthState = 'idle' | 'loading' | 'authenticated' | 'error';

interface UseAuthReturn {
  state:    AuthState;
  partyId:  string | null;
  error:    string | null;
  login:    (email: string, password: string) => Promise<void>;
  logout:   () => void;
}

const REFRESH_TOKEN_KEY = 'syndicai_refresh_token';

export const useAuth = (): UseAuthReturn => {
  const [state,   setState]   = useState<AuthState>('idle');
  const [partyId, setPartyId] = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const finalizeAuth = useCallback(async () => {
    const id = await fetchPartyId();
    setPartyId(id);
    setState('authenticated');
  }, []);

  // On mount, try to restore session from refresh token
  useEffect(() => {
    const storedRefresh = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (!storedRefresh) return;

    setState('loading');
    refreshToken(storedRefresh)
      .then((auth) => {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, auth.refresh_token);
        return finalizeAuth();
      })
      .catch(() => {
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        setState('idle');
      });
  }, [finalizeAuth]);

  const login = useCallback(async (email: string, password: string) => {
    setState('loading');
    setError(null);
    try {
      const auth: AuthToken = await authenticate(email, password);
      sessionStorage.setItem(REFRESH_TOKEN_KEY, auth.refresh_token);
      await finalizeAuth();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
      setState('error');
    }
  }, [finalizeAuth]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    setPartyId(null);
    setState('idle');
    setError(null);
    window.location.reload();
  }, []);

  return { state, partyId, error, login, logout };
};
