import requests

print("Authenticating with Keycloak with admin scope...")
token_url = "https://keycloak.naas.noders.services/realms/noders-appsfactory/protocol/openid-connect/token"
data = {
    "grant_type": "password",
    "client_id": "web-app-ui-hackcanton-01-devnet",
    "username": "mebostellamaris@gmail.com",
    "password": "Swanky112#",
    "scope": "openid daml_ledger_api offline_access admin"
}

r = requests.post(token_url, data=data)
if r.status_code != 200:
    print("Failed to get token:", r.text)
    # Fallback to no admin scope just to see
    data["scope"] = "openid daml_ledger_api offline_access"
    r = requests.post(token_url, data=data)

if r.status_code != 200:
    exit(1)

token = r.json()['access_token']
print("Uploading DAR with alternative /v2/packages ...")
ledger_base = "https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services"
dar_path = r"c:\syndicAi Vault\daml\SyndicAIVault.dar"

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/octet-stream"}
with open(dar_path, 'rb') as f:
    up_r = requests.post(f"{ledger_base}/v2/packages", headers=headers, data=f.read())

print("Upload Status:", up_r.status_code)
print("Upload Response:", up_r.text)
