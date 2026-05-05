"""
Creates the first SyndicAI Vault contract on the HackCanton DevNet.
"""
import sys, io, uuid
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import requests
from datetime import datetime, timezone

KEYCLOAK_URL = "https://keycloak.naas.noders.services/realms/noders-appsfactory/protocol/openid-connect/token"
LEDGER_BASE  = "https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services"
PARTY        = "f3ba5a8c-0c1f-4ed8-bf4d-c671ba956872::1220195a56748e538153ecc527422256c235ff27b367483b04e161d3bbc62b1ebf32"
PACKAGE_ID   = "6bea56f3d9a70a7fbc77f0a0ae3eb2b050996fe8cd2cfde3a3b06c90e571f428"

# The Canton v2 REST API expects templateId as a flat string:
# "<packageId>:<ModuleName>:<EntityName>"
TEMPLATE_ID = f"{PACKAGE_ID}:SyndicAIVault:Vault"

# 1. Auth
print("[1/3] Authenticating...")
r = requests.post(KEYCLOAK_URL, data={
    "grant_type": "password",
    "client_id":  "web-app-ui-hackcanton-01-devnet",
    "username":   "mebostellamaris@gmail.com",
    "password":   "Swanky112#",
    "scope":      "openid daml_ledger_api offline_access",
}, headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=15)
r.raise_for_status()
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
print("    Auth OK")

# 2. Submit Vault
now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

vault_payload = {
    "owner":              PARTY,
    "vaultId":            "vault-001",
    "name":               "SyndicAI Genesis Vault",
    "description":        "AI-governed RWA syndication vault for HackCanton Season 1.",
    "createdAt":          now_iso,
    "totalPayrollAmount": "1000000.0000000000",
    "status":             "ACTIVE",
}

body = {
    "commands": {
        "commandId": str(uuid.uuid4()),
        "actAs":     [PARTY],
        "readAs":    [PARTY],
        "commands":  [{
            "CreateCommand": {
                "templateId":     TEMPLATE_ID,
                "createArguments": vault_payload,
            }
        }],
    }
}

print("[2/3] Submitting Vault contract to ledger...")
print(f"    templateId: {TEMPLATE_ID}")
resp = requests.post(
    f"{LEDGER_BASE}/v2/commands/submit-and-wait-for-transaction",
    headers=headers,
    json=body,
    timeout=30,
)

print(f"    HTTP {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    events = data.get("transaction", {}).get("events", [])
    cid = ""
    for ev in events:
        created = ev.get("CreatedEvent") or ev.get("created", {})
        cid = created.get("contractId", "")
        if cid:
            break
    print(f"[OK] Vault created! Contract ID: {cid}")
else:
    print(f"[ERR] {resp.text[:1000]}")

# 3. Verify
print("\n[3/3] Verifying on ledger...")
qbody = {
    "filter": {
        "filtersByParty": {
            PARTY: {
                "cumulative": [{
                    "identifierFilter": {
                        "templateFilter": {
                            "templateId": TEMPLATE_ID,
                            "includeCreatedEventBlob": False,
                        }
                    }
                }]
            }
        }
    },
    "verbose": True,
}
qr = requests.get(f"{LEDGER_BASE}/v2/state/active-contracts-page",
                  headers=headers, json=qbody, timeout=30)
qdata = qr.json()
vaults = [i for i in qdata.get("activeContracts", []) if i.get("createdEvent")]
print(f"    Active Vault contracts: {len(vaults)}")
if vaults:
    args = vaults[0]["createdEvent"].get("createArguments", {})
    print(f"    Name:   {args.get('name')}")
    print(f"    Status: {args.get('status')}")
    print(f"    TVL:    {args.get('totalPayrollAmount')}")
