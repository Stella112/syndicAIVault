"""
Now that we know GET /v2/state/active-contracts-page works with eventFormat,
test the correct filter format to get Vault contracts specifically.
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

def test(label, body):
    resp = requests.get(f"{LEDGER_BASE}/v2/state/active-contracts-page",
                        headers=headers, json=body, timeout=30)
    print(f"\n[{resp.status_code}] {label}")
    if resp.status_code == 200:
        data = resp.json()
        contracts = [i for i in data.get("activeContracts", []) if i.get("createdEvent")]
        print(f"    Contracts: {len(contracts)}")
        if contracts:
            ev = contracts[0]["createdEvent"]
            print(f"    templateId: {ev.get('templateId')}")
            print(f"    payload key: {list((ev.get('createArgument') or ev.get('createArguments') or {}).keys())[:4]}")
    else:
        print(f"    ERR: {resp.text[:300]}")

# Try A: wildcard - gets ALL contracts for party (should see our Vault)
test("Wildcard - all contracts", {
    "eventFormat": {
        "filtersByParty": {PARTY: {}},
        "verbose": True
    }
})

# Try B: template filter with TemplateFilter wrapper (PascalCase)
test("TemplateFilter PascalCase wrapper", {
    "eventFormat": {
        "filtersByParty": {
            PARTY: {
                "cumulative": [{
                    "TemplateFilter": {
                        "value": {"templateId": TEMPLATE_ID}
                    }
                }]
            }
        },
        "verbose": True
    }
})

# Try C: templateFilter with value field (snake_case)
test("templateFilter snake_case value", {
    "eventFormat": {
        "filtersByParty": {
            PARTY: {
                "cumulative": [{
                    "identifierFilter": {
                        "TemplateFilter": {
                            "value": {"templateId": TEMPLATE_ID}
                        }
                    }
                }]
            }
        },
        "verbose": True
    }
})
