"""
Quick verification: checks the deployed package is visible on the DevNet
and that the Vault/Proposal templates can be queried.
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import requests

KEYCLOAK_URL = "https://keycloak.naas.noders.services/realms/noders-appsfactory/protocol/openid-connect/token"
LEDGER_BASE  = "https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services"
PACKAGE_ID   = "6bea56f3d9a70a7fbc77f0a0ae3eb2b050996fe8cd2cfde3a3b06c90e571f428"
PARTY        = "f3ba5a8c-0c1f-4ed8-bf4d-c671ba956872::1220195a56748e538153ecc527422256c235ff27b367483b04e161d3bbc62b1ebf32"

# 1. Auth
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
print("[OK] Auth OK")

# 2. Check package is in the list
r2 = requests.get(f"{LEDGER_BASE}/v2/packages", headers=headers, timeout=15)
packages = r2.json().get("packageIds", [])
if PACKAGE_ID in packages:
    print(f"[OK] Package confirmed on DevNet ({len(packages)} total packages)")
else:
    print(f"[WARN] Package NOT found in package list. Total: {len(packages)}")
    print("   First 5:", packages[:5])

# 3. Query Vault contracts by package name
body = {
    "filter": {
        "filtersByParty": {
            PARTY: {
                "cumulative": [{
                    "identifierFilter": {
                        "templateFilter": {
                            "templateId": {
                                "packageName": "syndicai-vault",
                                "moduleName":  "SyndicAIVault",
                                "entityName":  "Vault",
                            },
                            "includeCreatedEventBlob": False,
                        }
                    }
                }]
            }
        }
    },
    "verbose": True,
}
r3 = requests.get(f"{LEDGER_BASE}/v2/state/active-contracts-page",
                  headers=headers, json=body, timeout=30)
print(f"\n[INFO] Query Vault contracts -> HTTP {r3.status_code}")
data = r3.json()
contracts = [i for i in data.get("activeContracts", []) if i.get("createdEvent")]
print(f"   Found {len(contracts)} active Vault contract(s)")
if contracts:
    print("   First:", contracts[0]["createdEvent"].get("createArguments"))

# 4. Query Proposal contracts
body["filter"]["filtersByParty"][PARTY]["cumulative"][0]["identifierFilter"]["templateFilter"]["templateId"]["entityName"] = "Proposal"
r4 = requests.get(f"{LEDGER_BASE}/v2/state/active-contracts-page",
                  headers=headers, json=body, timeout=30)
print(f"\n[INFO] Query Proposal contracts -> HTTP {r4.status_code}")
data4 = r4.json()
proposals = [i for i in data4.get("activeContracts", []) if i.get("createdEvent")]
print(f"   Found {len(proposals)} active Proposal contract(s)")
