import requests

print("Authenticating with Keycloak...")
token_url = "https://keycloak.naas.noders.services/realms/noders-appsfactory/protocol/openid-connect/token"
data = {
    "grant_type": "password",
    "client_id": "web-app-ui-hackcanton-01-devnet",
    "username": "mebostellamaris@gmail.com",
    "password": "Swanky112#",
    "scope": "openid daml_ledger_api offline_access"
}

r = requests.post(token_url, data=data)
if r.status_code != 200:
    print("Failed to get token:", r.text)
    exit(1)

token = r.json()['access_token']
print("Token acquired!")

print("Uploading DAR...")
ledger_base = "https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services"
dar_path = r"c:\syndicAi Vault\daml\SyndicAIVault.dar"

headers = {"Authorization": f"Bearer {token}"}
with open(dar_path, 'rb') as f:
    files = {'dar': ('SyndicAIVault.dar', f, 'application/octet-stream')}
    up_r = requests.post(f"{ledger_base}/v2/packages", headers=headers, files=files)

print("Upload Status:", up_r.status_code)
print("Upload Response:", up_r.text)

print("Listing packages...")
list_r = requests.get(f"{ledger_base}/v2/packages", headers=headers)
if list_r.status_code == 200:
    print("Total packages:", len(list_r.json().get('packageIds', [])))
else:
    print("List Status:", list_r.status_code)
