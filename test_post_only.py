"""
Verify what POST /v2/state/active-contracts returns with ONLY eventFormat (no filter).
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

# POST with ONLY eventFormat (no filter key)
resp = requests.post(f"{LEDGER_BASE}/v2/state/active-contracts",
    headers=headers,
    json={
        "eventFormat": {
            "filtersByParty": {PARTY: {}},
            "verbose": True
        }
    }, timeout=30)

print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"Type: {type(data).__name__}")
    if isinstance(data, list):
        print(f"Items: {len(data)}")
        for item in data[:2]:
            print(f"\n-- Item keys: {list(item.keys()) if isinstance(item, dict) else type(item)}")
            if isinstance(item, dict):
                entry = item.get('contractEntry', {})
                print(f"   contractEntry keys: {list(entry.keys())}")
                active = entry.get('JsActiveContract', {})
                ev = active.get('createdEvent', {})
                print(f"   templateId: {ev.get('templateId', 'N/A')}")
    elif isinstance(data, dict):
        print(f"Dict keys: {list(data.keys())}")
else:
    print(f"Error: {resp.text[:400]}")
