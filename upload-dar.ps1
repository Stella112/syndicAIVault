# ============================================================
# upload-dar.ps1  — Upload SyndicAIVault.dar to HackCanton DevNet
# ============================================================

$ErrorActionPreference = "Stop"

# ── 1. Get a fresh Keycloak token ───────────────────────────
Write-Host "🔑 Authenticating with Keycloak..." -ForegroundColor Cyan

$tokenResponse = Invoke-RestMethod `
    -Method Post `
    -Uri "https://keycloak.naas.noders.services/realms/noders-appsfactory/protocol/openid-connect/token" `
    -ContentType "application/x-www-form-urlencoded" `
    -Body @{
        grant_type = "password"
        client_id  = "web-app-ui-hackcanton-01-devnet"
        username   = "mebostellamaris@gmail.com"
        password   = "Swanky112#"
        scope      = "openid daml_ledger_api offline_access"
    }

$token = $tokenResponse.access_token
Write-Host "✅ Token acquired (${($token.Length)} chars)" -ForegroundColor Green

# ── 2. Locate the DAR file ──────────────────────────────────
$darPath = Join-Path $PSScriptRoot "daml\SyndicAIVault.dar"

if (-not (Test-Path $darPath)) {
    Write-Host "⚠️  DAR not found at: $darPath" -ForegroundColor Yellow
    Write-Host "   Searching for any .dar file..." -ForegroundColor Yellow
    $darFiles = Get-ChildItem -Path $PSScriptRoot -Filter "*.dar" -Recurse
    if ($darFiles.Count -eq 0) {
        Write-Error "No .dar file found! Please build the DAR first."
        exit 1
    }
    $darPath = $darFiles[0].FullName
    Write-Host "   Found: $darPath" -ForegroundColor Yellow
}

Write-Host "📦 Uploading DAR: $darPath" -ForegroundColor Cyan
$darBytes = [System.IO.File]::ReadAllBytes($darPath)
Write-Host "   Size: $($darBytes.Length) bytes" -ForegroundColor Gray

# ── 3. Upload via /v2/packages (multipart/form-data) ────────
$ledgerBase = "https://ledger-api-json.participant.hackcanton-01.devnet.naas.noders.services"

# Build multipart body manually
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=`"dar`"; filename=`"SyndicAIVault.dar`"",
    "Content-Type: application/octet-stream",
    ""
)

$bodyHeader = [System.Text.Encoding]::UTF8.GetBytes(($bodyLines -join $LF) + $LF)
$bodyFooter = [System.Text.Encoding]::UTF8.GetBytes("$LF--$boundary--$LF")

$stream = New-Object System.IO.MemoryStream
$stream.Write($bodyHeader, 0, $bodyHeader.Length)
$stream.Write($darBytes, 0, $darBytes.Length)
$stream.Write($bodyFooter, 0, $bodyFooter.Length)
$bodyBytes = $stream.ToArray()

try {
    $uploadResponse = Invoke-RestMethod `
        -Method Post `
        -Uri "$ledgerBase/v2/packages" `
        -Headers @{ Authorization = "Bearer $token" } `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $bodyBytes

    Write-Host "✅ DAR uploaded successfully!" -ForegroundColor Green
    Write-Host ($uploadResponse | ConvertTo-Json -Depth 5) -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $statusDesc = $_.Exception.Response.StatusDescription
    Write-Host "❌ Upload failed: HTTP $statusCode $statusDesc" -ForegroundColor Red

    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "Response body: $body" -ForegroundColor Red
    } catch {}

    # ── Fallback: try raw binary PUT to /v2/packages ─────────
    Write-Host "" 
    Write-Host "🔄 Trying alternative endpoint: PUT /v2/packages" -ForegroundColor Yellow
    try {
        $altResponse = Invoke-RestMethod `
            -Method Post `
            -Uri "$ledgerBase/v2/packages" `
            -Headers @{
                Authorization  = "Bearer $token"
                "Content-Type" = "application/octet-stream"
            } `
            -Body $darBytes

        Write-Host "✅ DAR uploaded via alternative method!" -ForegroundColor Green
        Write-Host ($altResponse | ConvertTo-Json -Depth 5) -ForegroundColor Gray
    } catch {
        Write-Host "❌ Alternative also failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "📋 Available /v2 endpoints to try:" -ForegroundColor Yellow
        Write-Host "   POST /v2/packages  (multipart)" -ForegroundColor Gray
        Write-Host "   POST /v2/dars      (raw bytes)" -ForegroundColor Gray
    }
}

# ── 4. Verify — list packages ───────────────────────────────
Write-Host ""
Write-Host "📋 Listing uploaded packages..." -ForegroundColor Cyan
try {
    $packages = Invoke-RestMethod `
        -Uri "$ledgerBase/v2/packages" `
        -Headers @{ Authorization = "Bearer $token" }
    Write-Host "Packages on ledger:" -ForegroundColor Green
    $packages | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor Gray
} catch {
    Write-Host "Could not list packages: $($_.Exception.Message)" -ForegroundColor Yellow
}
