"""
test-api.py  — Quick connectivity check for SyndicAI Vault DevNet
Run: python test-api.py
"""
import os, sys, json
from pathlib import Path
import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

EMAIL    = os.getenv("CANTON_EMAIL")
PASSWORD = os.getenv("CANTON_PASSWORD")
PARTY    = os.getenv("AGENT_PARTY")

KEYCLOAK = (
    "https://keycloak.naas.noders.services"
    "/realms/noders-appsfactory/protocol/openid-connect/token"
)
LEDGER = "https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services"

print("[1] Authenticating ...")
r = requests.post(KEYCLOAK, data={
    "grant_type": "password",
    "client_id":  "web-app-ui-hackcanton-01-devnet",
    "username":   EMAIL,
    "password":   PASSWORD,
    "scope":      "openid daml_ledger_api offline_access",
}, headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=15)
r.raise_for_status()
token = r.json()["access_token"]
print("    Auth OK, token length:", len(token))

hdrs = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

print("\n[2] GET /v2/authenticated-user ...")
r2 = requests.get(f"{LEDGER}/v2/authenticated-user", headers=hdrs, timeout=10)
print("    Status:", r2.status_code)
print("    Body:", r2.text[:500])

print("\n[3] GET /v2/packages ...")
r3 = requests.get(f"{LEDGER}/v2/packages", headers=hdrs, timeout=10)
print("    Status:", r3.status_code)
try:
    pkgs = r3.json()
    print("    Packages:", json.dumps(pkgs, indent=2)[:800])
except Exception:
    print("    Body:", r3.text[:500])

print("\n[4] GET /v2/state/active-contracts-page (Vault contracts) ...")
body = {
    "filter": {
        "filtersByParty": {
            PARTY: {
                "cumulative": [{
                    "identifierFilter": {
                        "templateFilter": {
                            "templateId": {
                                "packageName": "syndicai-vault",
                                "moduleName": "SyndicAIVault",
                                "entityName": "Vault"
                            },
                            "includeCreatedEventBlob": False
                        }
                    }
                }]
            }
        }
    },
    "verbose": True
}
r4 = requests.request("GET", f"{LEDGER}/v2/state/active-contracts-page",
                      headers=hdrs, json=body, timeout=15)
print("    Status:", r4.status_code)
print("    Body:", r4.text[:800])
