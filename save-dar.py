"""
save-dar.py
-----------
Decodes the base64 DAR blob compiled by DAML Studio and saves it to
daml/SyndicAIVault.dar so that upload-dar.ps1 can upload it to DevNet.

Usage:
    python save-dar.py
"""

import base64, os, sys
from pathlib import Path

# ── Full base64 DAR from DAML Studio compiler ─────────────────────────────────
# Paste the ENTIRE base64 string here (from DAML Studio "Download DAR" or the
# compiler response dar field).  The truncated portions in the chat were the
# beginning; replace this with the full string if available.
#
# ⚠ The string below is the version from the previous session compiler output.
#   If you have a newer compile result, replace DAR_B64 with the new string.

# We'll try to read it from dar.b64 file first (easier to paste long strings)
ROOT = Path(__file__).parent
DAR_B64_FILE = ROOT / "dar.b64"
DAR_OUT = ROOT / "daml" / "SyndicAIVault.dar"

if DAR_B64_FILE.exists():
    print(f"📂 Reading base64 from: {DAR_B64_FILE}")
    b64 = DAR_B64_FILE.read_text(encoding="utf-8").strip().replace("\n", "").replace("\r", "")
else:
    print("❌ No dar.b64 file found!")
    print(f"   Please create {DAR_B64_FILE} and paste the full base64 DAR string into it.")
    print("   You can copy it from the DAML Studio compiler 'dar' field.")
    sys.exit(1)

# Pad to multiple of 4
pad = len(b64) % 4
if pad:
    b64 += "=" * (4 - pad)

try:
    dar_bytes = base64.b64decode(b64)
    print(f"✅ Decoded {len(dar_bytes):,} bytes")
except Exception as e:
    print(f"❌ Base64 decode error: {e}")
    sys.exit(1)

# Verify it's a ZIP/DAR (PK header)
if dar_bytes[:2] != b"PK":
    print(f"⚠️  Warning: file does not start with PK (ZIP/DAR) — got: {dar_bytes[:4]!r}")
    print("   The base64 data may be incomplete or corrupted.")
else:
    print("✅ Valid ZIP/DAR signature (PK header)")

DAR_OUT.parent.mkdir(parents=True, exist_ok=True)
DAR_OUT.write_bytes(dar_bytes)
print(f"✅ Saved to: {DAR_OUT}  ({len(dar_bytes):,} bytes)")
