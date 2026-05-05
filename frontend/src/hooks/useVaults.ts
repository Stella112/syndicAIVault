/**
 * useVaults.ts — Vault + Proposal data hook
 *
 * Polls the Canton JSON Ledger API and exposes domain-level
 * contract state to the React UI.
 *
 * NOTE: LPShare is not part of the MVP DAML template — removed to prevent 400 errors.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchVaults, fetchProposals,
  approveProposal, rejectProposal, createVault,
  type Contract, type VaultPayload, type LPSharePayload, type ProposalPayload,
} from '../services/devnet';

interface UseVaultsReturn {
  vaults:            Contract<VaultPayload>[];
  lpShares:          Contract<LPSharePayload>[];   // always [] for now
  proposals:         Contract<ProposalPayload>[];
  loading:           boolean;
  error:             string | null;
  refresh:           () => Promise<void>;
  handleCreateVault: (name: string, targetAsset: string, targetTVL: number, manager: string) => Promise<void>;
  handleApprove:     (contractId: string, manager: string) => Promise<void>;
  handleReject:      (contractId: string, manager: string) => Promise<void>;
}

const POLL_INTERVAL_MS = 15_000;

export const useVaults = (authenticated: boolean): UseVaultsReturn => {
  const [vaults,    setVaults]    = useState<Contract<VaultPayload>[]>([]);
  const [proposals, setProposals] = useState<Contract<ProposalPayload>[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch Vault and Proposal contracts in parallel
      // LPShare is not in the MVP DAML template, so we skip it
      const [v, p] = await Promise.all([
        fetchVaults(),
        fetchProposals(),
      ]);
      setVaults(v);
      setProposals(p);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load data from Canton ledger');
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  // Initial load + polling
  useEffect(() => {
    if (!authenticated) return;
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [authenticated, refresh]);

  // Create a new Vault on-ledger
  const handleCreateVault = useCallback(async (
    name: string,
    description: string,
    totalPayrollAmount: number,
    owner: string,
  ) => {
    const createdAt = new Date().toISOString();
    await createVault(owner, name, description, totalPayrollAmount, createdAt);
    await refresh();
  }, [refresh]);

  const handleApprove = useCallback(async (contractId: string) => {
    await approveProposal(contractId);
    await refresh();
  }, [refresh]);

  const handleReject = useCallback(async (contractId: string) => {
    await rejectProposal(contractId);
    await refresh();
  }, [refresh]);

  return {
    vaults,
    lpShares:  [],    // not in MVP DAML
    proposals,
    loading,
    error,
    refresh,
    handleCreateVault,
    handleApprove,
    handleReject,
  };
};
