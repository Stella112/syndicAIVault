"""
Debug: find the actual party ID from the token, then query all contracts.
"""
import sys, io, requests, json, base64
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

KEYCLOAK_URL = "https://keycloak.naas.noders.services/realms/noders-appsfactory/protocol/openid-connect/token"
LEDGER_BASE  = "https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services"
PACKAGE_ID   = "6bea56f3d9a70a7fbc77f0a0ae3eb2b050996fe8cd2cfde3a3b06c90e571f428"

r = requests.post(KEYCLOAK_URL, data={
    "grant_type": "password", "client_id": "web-app-ui-hackcanton-01-devnet",
    "username": "mebostellamaris@gmail.com", "password": "Swanky112#",
    "scope": "openid daml_ledger_api offline_access",
}, headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=15)
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Decode JWT to see claims
payload_b64 = token.split('.')[1]
payload_b64 += '=' * (4 - len(payload_b64) % 4)
claims = json.loads(base64.urlsafe_b64decode(payload_b64))
print("JWT actAs:", claims.get('actAs', 'N/A'))
print("JWT sub:", claims.get('sub', 'N/A')[:50])

# Get the real party from the ledger API
user_r = requests.get(f"{LEDGER_BASE}/v2/authenticated-user", headers=headers, timeout=15)
print("\n/v2/authenticated-user:", user_r.status_code)
print(user_r.text[:500])

# Get the primary party
if user_r.status_code == 200:
    user_data = user_r.json()
    party = user_data.get('user', {}).get('primaryParty', '')
    print(f"\nPrimary Party: {party}")
    
    # Query with actual party
    resp = requests.get(f"{LEDGER_BASE}/v2/state/active-contracts-page",
        headers=headers,
        json={
            "eventFormat": {
                "filtersByParty": {party: {}},
                "verbose": True
            }
        }, timeout=30)
    print(f"\nQuery with actual party -> HTTP {resp.status_code}")
    data = resp.json()
    contracts = data.get("activeContracts", [])
    print(f"Total contracts: {len(contracts)}")
    for c in contracts[:3]:
        ev = c.get("createdEvent", {})
        print(f"  templateId: {ev.get('templateId')}")
        args = ev.get('createArgument') or ev.get('createArguments') or {}
        if isinstance(args, dict):
            print(f"  fields: {list(args.keys())[:5]}")
