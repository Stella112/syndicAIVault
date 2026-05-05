"""
Tests different query body formats against the Canton v2 active-contracts endpoint
to find the one that works.
"""
import sys, io, requests
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

KEYCLOAK_URL = "https://keycloak.naas.noders.services/realms/noders-appsfactory/protocol/openid-connect/token"
LEDGER_BASE  = "https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services"
PACKAGE_ID   = "6bea56f3d9a70a7fbc77f0a0ae3eb2b050996fe8cd2cfde3a3b06c90e571f428"
PARTY        = "f3ba5a8c-0c1f-4ed8-bf4d-c671ba956872::1220195a56748e538153ecc527422256c235ff27b367483b04e161d3bbc62b1ebf32"
TEMPLATE_ID  = f"{PACKAGE_ID}:SyndicAIVault:Vault"

r = requests.post(KEYCLOAK_URL, data={
    "grant_type": "password", "client_id": "web-app-ui-hackcanton-01-devnet",
    "username": "mebostellamaris@gmail.com", "password": "Swanky112#",
    "scope": "openid daml_ledger_api offline_access",
}, headers={"Content-Type": "application/x-www-form-urlencoded"}, timeout=15)
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
print("[OK] Auth")

def test(label, url, method, body):
    fn = requests.post if method == "POST" else requests.get
    resp = fn(url, headers=headers, json=body, timeout=30)
    result = resp.text[:300].replace('\n', ' ')
    print(f"\n[{resp.status_code}] {label}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"    KEYS: {list(data.keys()) if isinstance(data, dict) else type(data)}")
    else:
        print(f"    ERR: {result}")

# ---- Try 1: POST /v2/state/active-contracts (the correct endpoint per spec)
# with a simple wildcard filter
test("POST /active-contracts - wildcard", f"{LEDGER_BASE}/v2/state/active-contracts", "POST", {
    "filter": {
        "filtersByParty": {PARTY: {}}
    },
    "eventFormat": {
        "filtersByParty": {PARTY: {}},
        "verbose": True
    }
})

# ---- Try 2: POST /active-contracts with templateFilter as string
test("POST /active-contracts - templateFilter string", f"{LEDGER_BASE}/v2/state/active-contracts", "POST", {
    "filter": {
        "filtersByParty": {
            PARTY: {
                "cumulative": [{"identifierFilter": {"templateFilter": {"value": {"templateId": TEMPLATE_ID}}}}]
            }
        }
    },
    "eventFormat": {
        "filtersByParty": {
            PARTY: {
                "cumulative": [{"identifierFilter": {"templateFilter": {"value": {"templateId": TEMPLATE_ID}}}}]
            }
        },
        "verbose": True
    }
})

# ---- Try 3: GET /active-contracts-page with wildcardFilter
test("GET /active-contracts-page - wildcard", f"{LEDGER_BASE}/v2/state/active-contracts-page", "GET", {
    "filter": {
        "filtersByParty": {PARTY: {}}
    },
    "eventFormat": {
        "filtersByParty": {PARTY: {}},
        "verbose": True
    }
})

# ---- Try 4: POST with filtersForAnyParty wildcard
test("POST /active-contracts - filtersForAnyParty wildcard", f"{LEDGER_BASE}/v2/state/active-contracts", "POST", {
    "filter": {
        "filtersForAnyParty": {}
    },
    "eventFormat": {
        "filtersForAnyParty": {},
        "verbose": True
    }
})

# ---- Try 5: No filter at all - just eventFormat
test("POST /active-contracts - empty filter + eventFormat only", f"{LEDGER_BASE}/v2/state/active-contracts", "POST", {
    "filter": {},
    "eventFormat": {
        "filtersByParty": {PARTY: {}},
        "verbose": True
    }
})
