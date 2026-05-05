"""
SyndicAI Vault — Autonomous AI Agent (REST Edition)
=====================================================
Uses the Canton 3.5.1 Ledger API v2 REST endpoints — identical to the
frontend's devnet.ts service layer.  No dazl / gRPC required.

Lifecycle:
  1. Authenticates via Keycloak OIDC (resource-owner password flow).
  2. Polls /v2/state/active-contracts-page for Vault contracts every 10 s.
  3. For each Vault not yet processed, runs AI inference to generate a
     risk-scored proposal using simulated oracle data.
  4. Submits a Proposal contract via /v2/commands/submit-and-wait-for-transaction.
  5. Repeats indefinitely, skipping already-seen vault names.

Environment variables (project root .env):
  CANTON_EMAIL     — HackCanton DevNet registered e-mail
  CANTON_PASSWORD  — HackCanton DevNet password
  AGENT_PARTY      — Canton Party ID for this AI Agent (from wallet)
"""

from __future__ import annotations

import asyncio
import logging
import os
import sys
import time
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

# ── Load .env from project root (one level up from ai-agent/) ─────────────────
_ROOT = Path(__file__).parent.parent
load_dotenv(_ROOT / ".env")

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("syndicai-agent")

# ── Canton REST endpoints ──────────────────────────────────────────────────────
KEYCLOAK_URL = (
    "https://keycloak.naas.noders.services"
    "/realms/noders-appsfactory/protocol/openid-connect/token"
)
CLIENT_ID  = "web-app-ui-hackcanton-01-devnet"
LEDGER_URL = (
    "https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services"
)

# DAML package / module
PACKAGE_ID = "6bea56f3d9a70a7fbc77f0a0ae3eb2b050996fe8cd2cfde3a3b06c90e571f428"
MODULE     = "SyndicAIVault"

# Poll interval (seconds)
POLL_INTERVAL = 10

# ── Mock oracle data (simulated live market feed) ─────────────────────────────
import random

def get_oracle() -> dict:
    """Simulates a live oracle feed with small market fluctuations each poll."""
    base_repo = Decimal("5.32")
    base_gilts = Decimal("4.78")
    base_sofr = Decimal("5.31")
    base_vol = Decimal("0.18")

    # Add ±0.05% random noise to simulate live market movement
    def jitter(base: Decimal, spread: float = 0.05) -> Decimal:
        delta = Decimal(str(round(random.uniform(-spread, spread), 4)))
        return (base + delta).quantize(Decimal("0.0001"))

    return {
        "usRepoRate7d":    jitter(base_repo),
        "giltsRate7d":     jitter(base_gilts),
        "sofr":            jitter(base_sofr),
        "volatilityIndex": jitter(base_vol, 0.02),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Authentication
# ─────────────────────────────────────────────────────────────────────────────

class TokenManager:
    """Manages the Keycloak access token, refreshing when needed."""

    def __init__(self, email: str, password: str) -> None:
        self._email    = email
        self._password = password
        self._token:   str = ""
        self._expires: float = 0.0

    def get_token(self) -> str:
        if time.time() > self._expires - 60:
            self._refresh()
        return self._token

    def _refresh(self) -> None:
        log.info("🔑 Refreshing Keycloak token …")
        resp = requests.post(
            KEYCLOAK_URL,
            data={
                "grant_type": "password",
                "client_id":  CLIENT_ID,
                "username":   self._email,
                "password":   self._password,
                "scope":      "openid daml_ledger_api offline_access",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        self._token   = data["access_token"]
        self._expires = time.time() + data.get("expires_in", 300)
        log.info("✅ Token refreshed (expires in %s s)", data.get("expires_in", "?"))


# ─────────────────────────────────────────────────────────────────────────────
# Ledger REST client
# ─────────────────────────────────────────────────────────────────────────────

class LedgerClient:
    """Thin wrapper around the Canton v2 REST API."""

    def __init__(self, token_mgr: TokenManager, party: str) -> None:
        self._tokens = token_mgr
        self._party  = party
        self._sess   = requests.Session()

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self._tokens.get_token()}",
            "Content-Type":  "application/json",
        }

    # ── Active contracts ────────────────────────────────────────────────────
    def query_contracts(
        self,
        entity_name: str,
    ) -> list[dict[str, Any]]:
        """
        GET /v2/state/active-contracts-page
        - Use ONLY eventFormat (not filter+verbose - they are mutually exclusive)
        - Response structure: item['contractEntry']['JsActiveContract']['createdEvent']
        - Payload field is 'createArgument' (singular, not 'createArguments')
        - Filter by templateId client-side after receiving all party contracts
        """
        template_id = f"{PACKAGE_ID}:{MODULE}:{entity_name}"
        body = {
            "eventFormat": {
                "filtersByParty": {
                    self._party: {},   # wildcard — gets all contracts for this party
                },
                "verbose": True,
            }
        }

        resp = self._sess.request(
            method="GET",
            url=f"{LEDGER_URL}/v2/state/active-contracts-page",
            headers=self._headers(),
            json=body,
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        contracts: list[dict[str, Any]] = []
        for item in data.get("activeContracts", []):
            # v2 wraps events: item['contractEntry']['JsActiveContract']['createdEvent']
            ev = (
                item
                .get("contractEntry", {})
                .get("JsActiveContract", {})
                .get("createdEvent", {})
            )
            if not ev:
                continue
            tid = ev.get("templateId", "")
            # Client-side filter by our template
            if entity_name not in tid:
                continue
            contracts.append({
                "contractId": ev.get("contractId", ""),
                "templateId": tid,
                "payload":    ev.get("createArgument", {}),  # singular!
            })
        return contracts

    # ── Create contract ─────────────────────────────────────────────────────
    def create_contract(
        self,
        entity_name: str,
        payload: dict[str, Any],
    ) -> str:
        """
        POST /v2/commands/submit-and-wait-for-transaction
        templateId must be a flat string: "packageId:Module:Entity"
        Returns the new contractId.
        """
        template_id = f"{PACKAGE_ID}:{MODULE}:{entity_name}"
        body = {
            "commands": {
                "commandId": str(uuid.uuid4()),
                "actAs":     [self._party],
                "readAs":    [self._party],
                "commands":  [
                    {
                        "CreateCommand": {
                            "templateId":      template_id,
                            "createArguments": payload,
                        }
                    }
                ],
            }
        }

        resp = self._sess.post(
            f"{LEDGER_URL}/v2/commands/submit-and-wait-for-transaction",
            headers=self._headers(),
            json=body,
            timeout=30,
        )
        resp.raise_for_status()
        data    = resp.json()
        events  = data.get("transaction", {}).get("events", [])
        cid     = events[0].get("CreatedEvent", events[0].get("created", {})).get("contractId", "") if events else ""
        return cid


# ─────────────────────────────────────────────────────────────────────────────
# AI Inference
# ─────────────────────────────────────────────────────────────────────────────

def run_ai_inference(vault: dict[str, Any]) -> dict[str, str]:
    """
    Deterministic AI oracle model (ready for LLM / Chainlink upgrade).
    Returns string decimals matching the Proposal template fields.
    """
    oracle = get_oracle()  # Fresh market snapshot each time

    # Use the correct DAML field name: totalPayrollAmount (not targetTVL)
    raw_tvl = vault.get("totalPayrollAmount") or vault.get("targetTVL") or "10000000"
    target_tvl = Decimal(str(raw_tvl))
    proposed   = (target_tvl * Decimal("0.50")).quantize(Decimal("0.0000000001"))
    best_rate  = max(oracle["usRepoRate7d"], oracle["giltsRate7d"])
    exp_yield  = (best_rate / Decimal("100")).quantize(Decimal("0.0000000001"))
    risk       = (
        oracle["volatilityIndex"] * Decimal("0.6")
        + (Decimal("1") - best_rate / Decimal("10")) * Decimal("0.4")
    ).quantize(Decimal("0.0000000001"))

    if risk < Decimal("0.35"):
        verdict = "Low risk. Proceed with standard approval."
    elif risk < Decimal("0.65"):
        verdict = "Medium risk. Manager review recommended."
    else:
        verdict = "High risk. Caution advised."

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    desc = (
        f"AI-generated 7-day Treasury Repo proposal for vault '{vault.get('name', '?')}'. "
        f"Oracle snapshot {ts}: "
        f"US Repo={oracle['usRepoRate7d']}%, SOFR={oracle['sofr']}%, "
        f"Volatility={oracle['volatilityIndex']}. "
        f"Recommended allocation: ${proposed:,.2f} at {exp_yield * 100:.2f}% yield. "
        f"Risk score: {risk * 100:.0f}/100 — {verdict}"
    )

    return {
        "proposed_amount": str(proposed),
        "expected_yield":  str(exp_yield),
        "risk_score":      str(risk),
        "description":     desc,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Agent main loop
# ─────────────────────────────────────────────────────────────────────────────

def run_agent(token_mgr: TokenManager, party: str) -> None:
    client = LedgerClient(token_mgr, party)
    seen_vaults: set[str] = set()      # track processed vault names

    log.info("🤖 Agent started. Polling every %d s …", POLL_INTERVAL)

    while True:
        try:
            vaults = client.query_contracts("Vault")
            log.info("📋 Found %d Vault contract(s) on ledger", len(vaults))

            for vault_contract in vaults:
                vault     = vault_contract["payload"]
                vault_cid = vault_contract["contractId"]
                vault_name: str = vault.get("name", "<unnamed>")
                owner: str      = vault.get("owner", "")

                if vault_name in seen_vaults:
                    log.debug("   ↳ Already processed vault '%s', skipping.", vault_name)
                    continue

                log.info("New Vault: '%s' (owner: %s...)", vault_name, owner[:24])

                # AI inference step
                inference = run_ai_inference(vault)
                log.info(
                    "Inference -- amount=$%s  yield=%.2f%%  risk=%.0f/100",
                    inference["proposed_amount"],
                    float(inference["expected_yield"]) * 100,
                    float(inference["risk_score"]) * 100,
                )

                now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

                # Proposal payload must match DAML template exactly:
                # vaultCid, owner, proposalId, title, description,
                # aiRecommendation, amount, status, createdAt
                proposal = {
                    "vaultCid":         vault_cid,
                    "owner":            owner,
                    "proposalId":       f"prop-{int(time.time())}",
                    "title":            f"AI Treasury Repo Allocation - {vault_name}",
                    "description":      inference["description"],
                    "aiRecommendation": (
                        f"Recommended: ${inference['proposed_amount']} "
                        f"at {float(inference['expected_yield'])*100:.2f}% yield. "
                        f"Risk: {float(inference['risk_score'])*100:.0f}/100."
                    ),
                    "amount":           inference["proposed_amount"],
                    "status":           "PENDING",
                    "createdAt":        now_iso,
                }

                try:
                    cid = client.create_contract("Proposal", proposal)
                    log.info("Proposal submitted on-chain: %s", cid)
                    seen_vaults.add(vault_name)
                except requests.HTTPError as exc:
                    body = exc.response.text if exc.response is not None else ""
                    log.error(
                        "Failed to submit Proposal for '%s': %s\n   Response: %s",
                        vault_name, exc, body[:400],
                    )

        except requests.HTTPError as exc:
            body = exc.response.text if exc.response is not None else ""
            log.warning("⚠️  Ledger HTTP error: %s\n   Body: %s", exc, body[:400])
        except requests.ConnectionError as exc:
            log.warning("⚠️  Connection error: %s", exc)
        except Exception as exc:
            log.error("❌ Unexpected error: %s", exc, exc_info=True)

        log.info("💤 Sleeping %d s …", POLL_INTERVAL)
        time.sleep(POLL_INTERVAL)


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    log.info("══════════════════════════════════════════════════")
    log.info("  SyndicAI Vault — Autonomous AI Agent v0.2 REST  ")
    log.info("══════════════════════════════════════════════════")

    email    = os.getenv("CANTON_EMAIL")
    password = os.getenv("CANTON_PASSWORD")
    party    = os.getenv("AGENT_PARTY")

    missing = [k for k, v in [
        ("CANTON_EMAIL", email),
        ("CANTON_PASSWORD", password),
        ("AGENT_PARTY", party),
    ] if not v]

    if missing:
        log.error("Missing environment variables: %s", ", ".join(missing))
        log.error("Add them to %s", _ROOT / ".env")
        sys.exit(1)

    token_mgr = TokenManager(email, password)   # type: ignore[arg-type]

    # Outer retry loop (re-authenticate on token failure)
    while True:
        try:
            run_agent(token_mgr, party)             # type: ignore[arg-type]
        except KeyboardInterrupt:
            log.info("Agent stopped by user. Goodbye!")
            sys.exit(0)
        except Exception as exc:
            log.error("Fatal error: %s — restarting in 30 s …", exc, exc_info=True)
            time.sleep(30)


if __name__ == "__main__":
    main()
