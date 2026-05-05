import requests
import json
import base64

with open(r'c:\syndicAi Vault\daml\SyndicAIVault.daml', 'r') as f:
    daml_code = f.read()

payload = {
    'code': daml_code,
    'moduleName': 'SyndicAIVault',
    'sdkVersion': '3.4.10'
}

print('Trying /api/compile with correct payload...')
headers = {'Content-Type': 'application/json'}
try:
    r = requests.post('https://damlstudio.tenzro.network/api/compile', json=payload, headers=headers, timeout=20)
    print("Status:", r.status_code)
    
    if r.status_code == 200:
        data = r.json()
        if 'dar' in data:
            with open(r'c:\syndicAi Vault\daml\SyndicAIVault.dar', 'wb') as f:
                f.write(base64.b64decode(data['dar']))
            print("SUCCESS! Saved DAR.")
        else:
            print("No dar in response:", list(data.keys()))
    else:
        print("Response:", r.text[:200])

except Exception as e:
    print('Error:', e)
