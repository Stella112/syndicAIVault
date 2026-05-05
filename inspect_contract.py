"""
Inspect raw structure of returned contracts to find the correct field names.
"""
import sys, io, requests, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

KEYCLOAK_URL = "https://keycloak.naas.noders.services/realms/noders-appsfactory/protocol/openid-connect/token"
LEDGER_BASE  = "https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services"
PARTY        = "f3ba5a8c-0c1f-4ed8-bf4d-c671ba956872::1220195a56748e538153ecc527422256c235ff27b367483b04e161d3bbc62b1ebf32"

r = requests.post(KEYCLOAK_URL, data={
    "grant_type": "password", "client_id": "web-app-ui-hackcanton-01-devnet",
    "username": "mebostellamaris@gmail.com", "password": "Swanky112#",
    "scope": "openid daml_ledger_api offline_access",
}, headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=15)
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

resp = requests.get(f"{LEDGER_BASE}/v2/state/active-contracts-page",
    headers=headers,
    json={
        "eventFormat": {
            "filtersByParty": {PARTY: {}},
            "verbose": True
        }
    }, timeout=30)

data = resp.json()
print("Top-level keys:", list(data.keys()))
contracts = data.get("activeContracts", [])
print(f"Total: {len(contracts)}")
print("\n--- Contract 0 raw ---")
print(json.dumps(contracts[0], indent=2)[:2000])
