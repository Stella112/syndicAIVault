import json
import base64

try:
    with open(r'c:\syndicAi Vault\compile_response.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    dar_base64 = None
    
    # Try different possible paths in the JSON based on the API response structure
    if 'result' in data and 'darBase64' in data['result']:
        dar_base64 = data['result']['darBase64']
    elif 'dar' in data:
        dar_base64 = data['dar']
        
    if dar_base64:
        dar_path = r'c:\syndicAi Vault\daml\SyndicAIVault.dar'
        with open(dar_path, 'wb') as f:
            f.write(base64.b64decode(dar_base64))
        print("SUCCESS! DAR file extracted and saved to:", dar_path)
    else:
        print("ERROR: Could not find the DAR base64 string in the JSON file.")

except Exception as e:
    print("ERROR:", e)
