/**
 * devnet.ts — Canton HackCanton DevNet Service
 *
 * Canton 3.5.1 / Ledger API v2
 * All endpoints discovered from the live /docs/openapi spec on the DevNet.
 *
 * Endpoints are proxied through Vite dev server to avoid CORS issues.
 */

import axios from 'axios';

// ─── Proxied base paths (see vite.config.ts for proxy rules) ───────────────
const KEYCLOAK_BASE = '/keycloak';
const LEDGER_BASE   = '/ledger';
const CLIENT_ID     = 'web-app-ui-hackcanton-01-devnet';
const DAML_SCOPE    = 'openid daml_ledger_api offline_access';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface Contract<T> {
  contractId: string;
  templateId: string;
  payload: T;
}

export interface VaultPayload {
  owner: string;
  vaultId: string;
  name: string;
  description: string;
  totalPayrollAmount: string;
  status: string;
  createdAt: string;
}

export interface LPSharePayload {
  owner: string;
  lp: string;
  vaultName: string;
  amount: string;
  depositedAt: string;
}

export interface ProposalPayload {
  vaultCid: string;
  owner: string;
  proposalId: string;
  title: string;
  description: string;
  aiRecommendation: string;
  amount: string;
  status: string;
  createdAt: string;
}

// ─── Token storage ─────────────────────────────────────────────────────────

let _accessToken: string | null = null;
let _partyId: string | null = null;

export const getStoredToken = (): string | null => _accessToken;
export const getPartyId = (): string | null => _partyId;

// ─── Authentication ─────────────────────────────────────────────────────────

export const authenticate = async (email: string, password: string): Promise<AuthToken> => {
  const params = new URLSearchParams({
    grant_type: 'password',
    client_id:  CLIENT_ID,
    username:   email,
    password:   password,
    scope:      DAML_SCOPE,
  });

  const response = await axios.post<AuthToken>(
    `${KEYCLOAK_BASE}/realms/noders-appsfactory/protocol/openid-connect/token`,
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  _accessToken = response.data.access_token;
  return response.data;
};

export const refreshToken = async (refresh: string): Promise<AuthToken> => {
  const params = new URLSearchParams({
    grant_type:    'refresh_token',
    client_id:     CLIENT_ID,
    refresh_token: refresh,
  });

  const response = await axios.post<AuthToken>(
    `${KEYCLOAK_BASE}/realms/noders-appsfactory/protocol/openid-connect/token`,
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );

  _accessToken = response.data.access_token;
  return response.data;
};

// ─── Ledger API v2 client ────────────────────────────────────────────────────

const ledger = axios.create({ baseURL: LEDGER_BASE });

ledger.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

// ─── User / Party ────────────────────────────────────────────────────────────

/**
 * Canton 3.x: GET /v2/authenticated-user
 * Returns the primary party ID for the authenticated user.
 */
export const fetchPartyId = async (): Promise<string> => {
  const res = await ledger.get<{
    user: { id: string; primaryParty: string };
  }>('/v2/authenticated-user');
  _partyId = res.data.user.primaryParty;
  return _partyId;
};

// ─── Active Contracts (v2) ───────────────────────────────────────────────────

/**
 * Queries active contracts using Canton 3.x /v2/state/active-contracts-page.
 * The v2 API uses a streaming-style POST with a filter body.
 */
export const queryContracts = async <T>(
  fullTemplateId: string,
): Promise<Contract<T>[]> => {
  const party = _partyId;
  if (!party) throw new Error('Party ID not set — authenticate first');

  // POST to our custom Vite middleware which server-side performs GET+body to Canton.
  // Browser cannot send GET+body; this middleware bridges the gap.
  // Sends ONLY eventFormat (wildcard), then filters client-side by templateId.
  const res = await axios.post<{ activeContracts?: unknown[] }>(
    '/api/active-contracts-page',
    {
      eventFormat: {
        filtersByParty: { [party]: {} },
        verbose: true,
      },
    },
    { headers: { Authorization: `Bearer ${_accessToken}` } },
  );

  const raw: unknown[] = res.data?.activeContracts ?? [];
  return raw
    .filter((item: unknown) => {
      const i = item as { contractEntry?: { JsActiveContract?: { createdEvent?: unknown } } };
      return !!i.contractEntry?.JsActiveContract?.createdEvent;
    })
    .filter((item: unknown) => {
      // client-side filter by templateId
      const i = item as { contractEntry: { JsActiveContract: { createdEvent: { templateId?: string } } } };
      const tid = i.contractEntry.JsActiveContract.createdEvent.templateId ?? '';
      return tid.includes(fullTemplateId.split(':')[2]); // match entityName
    })
    .map((item: unknown) => {
      const i = item as {
        contractEntry: {
          JsActiveContract: {
            createdEvent: {
              contractId: string;
              templateId: string;
              createArgument: Record<string, unknown>; // singular!
            };
          };
        };
      };
      const ev = i.contractEntry.JsActiveContract.createdEvent;
      return {
        contractId: ev.contractId,
        templateId:  ev.templateId,
        payload:     ev.createArgument as T,
      };
    });
};

// ─── Create Contract (v2) ───────────────────────────────────────────────────

/**
 * Creates a contract using Canton 3.x /v2/commands/submit-and-wait.
 */
export const createContract = async <T extends object>(
  fullTemplateId: string,
  payload: T,
): Promise<{ contractId: string }> => {
  const party = _partyId;
  if (!party) throw new Error('Party ID not set — authenticate first');

  const body = {
    commands: {
      commandId: crypto.randomUUID(),
      actAs:     [party],
      readAs:    [party],
      commands:  [
        {
          CreateCommand: {
            templateId:      fullTemplateId,
            createArguments: payload,
          },
        },
      ],
    },
  };

  const res = await ledger.post<{
    transaction: { events: Array<{ created: { contractId: string } }> };
  }>('/v2/commands/submit-and-wait-for-transaction', body);

  const createdEvent = res.data?.transaction?.events?.[0]?.created;
  return { contractId: createdEvent?.contractId ?? '' };
};

// ─── Exercise Choice (v2) ───────────────────────────────────────────────────

export const exerciseChoice = async <A extends object>(
  fullTemplateId: string,
  contractId: string,
  choice: string,
  choiceArgument: A,
): Promise<unknown> => {
  const party = _partyId;
  if (!party) throw new Error('Party ID not set — authenticate first');

  const body = {
    commands: {
      commandId: crypto.randomUUID(),
      actAs:     [party],
      readAs:    [party],
      commands:  [
        {
          ExerciseCommand: {
            templateId:     fullTemplateId,
            contractId,
            choice,
            choiceArgument,
          },
        },
      ],
    },
  };

  const res = await ledger.post<{ transaction: unknown }>(
    '/v2/commands/submit-and-wait-for-transaction',
    body,
  );
  return res.data;
};

// ─── Domain-specific helpers ────────────────────────────────────────────────

// Package ID on HackCanton DevNet:
const PACKAGE_ID = '6bea56f3d9a70a7fbc77f0a0ae3eb2b050996fe8cd2cfde3a3b06c90e571f428';
const MOD = 'SyndicAIVault';

const templateId = (entity: string) => `${PACKAGE_ID}:${MOD}:${entity}`;

export const fetchVaults = (): Promise<Contract<VaultPayload>[]> =>
  queryContracts<VaultPayload>(templateId('Vault'));

export const fetchLPShares = (): Promise<Contract<LPSharePayload>[]> =>
  queryContracts<LPSharePayload>(templateId('LPShare'));

export const fetchProposals = (): Promise<Contract<ProposalPayload>[]> =>
  queryContracts<ProposalPayload>(templateId('Proposal'));

export const createVault = (
  owner: string,
  name: string,
  description: string,
  totalPayrollAmount: number,
  createdAt: string,
): Promise<{ contractId: string }> =>
  createContract<VaultPayload>(templateId('Vault'), {
    owner,
    vaultId: `vault-${Date.now()}`,
    name,
    description,
    createdAt,
    totalPayrollAmount: totalPayrollAmount.toFixed(10),
    status: 'ACTIVE',
  } as unknown as VaultPayload);

export const approveProposal = (contractId: string): Promise<unknown> =>
  exerciseChoice(templateId('Proposal'), contractId, 'Approve', {});

export const rejectProposal = (contractId: string): Promise<unknown> =>
  exerciseChoice(templateId('Proposal'), contractId, 'Reject', {});
