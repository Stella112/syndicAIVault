# Syndic Spark ✦ HackCanton Season 1

**Privacy-first RWA syndication, governed by AI on the Canton Network.**

![Syndic Spark UI](./frontend/public/mockup.png)

Syndic Spark is an institutional-grade platform built for the **HackCanton DevNet**. It replaces fragmented emails and spreadsheets with on-ledger AI proposals, selective-disclosure voting, and atomic DvP settlement using DAML Smart Contracts.

## Architecture

This monorepo contains the complete end-to-end platform:

1. **`frontend/`**: A React/Vite web application providing the "Minimal Institutional" command center UI. It interfaces directly with the Canton JSON Ledger API (v2).
2. **`ai-agent/`**: A Python-based autonomous agent that acts as a background daemon. It continuously polls the Canton network for new Vaults, evaluates risk profiles using simulated oracles, and autonomously submits Allocation Proposals back to the ledger.
3. **`daml/`**: The underlying smart contracts (`SyndicAIVault.daml`) defining the schema, privacy guarantees, and atomic settlement rules.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- Canton DevNet Credentials (Keycloak Email/Password)

### 1. Start the React Frontend

```bash
cd frontend
npm install
npm run dev
```
The app will be available at `http://localhost:3000`. 
*Note: Due to browser CORS restrictions with Canton's JSON Ledger API, the frontend utilizes a custom Vite middleware proxy to securely route `POST` and `GET` requests to the DevNet.*

### 2. Configure the AI Agent

Copy the environment template and add your DevNet credentials:
```bash
cp .env.example .env
```
Update `.env`:
```env
CANTON_EMAIL="your_devnet_email@example.com"
CANTON_PASSWORD="your_devnet_password"
AGENT_PARTY="your_party_id_here"
```

### 3. Run the AI Agent

In a separate terminal, start the Python daemon:
```bash
cd ai-agent
python -m venv venv
source venv/bin/activate  # Or `.\venv\Scripts\activate` on Windows
pip install -r requirements.txt

python main.py
```

The agent will begin polling the ledger. When you create a new "Active LP Interest" (Vault) from the frontend UI, the Python agent will detect it, generate an AI risk assessment, and submit a Proposal contract for your approval.

## Submission Details
- **Hackathon:** HackCanton Season 1
- **Tracks:** Track 3 (DAML) & Track 4 (AI Integration)
- **Status:** Live on DevNet
