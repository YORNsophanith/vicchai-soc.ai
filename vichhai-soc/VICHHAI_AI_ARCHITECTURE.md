# 🛡️ Vichhai AI — Autonomous SOC Agentic AI Platform

> **Full SOC Lifecycle Architecture, Multi-Agent Orchestration & Integrated Threat Intelligence**

---

## 📑 Executive Overview

**Vichhai AI** is an end-to-end **SOC Agentic AI platform** designed around the complete security operations center lifecycle rather than a simple conversational chatbot. It autonomously monitors, correlates, investigates, enriches, and coordinates human-approved containment across an enterprise security ecosystem.

### Core Workflow Paradigm
```text
Detect ──► Understand ──► Investigate ──► Enrich ──► Correlate ──► Recommend ──► Get Approval ──► Respond ──► Report
```

---

## 🏛️ System Architecture

```text
                                  VICHHAI AI CORE
                                         │
                         ┌───────────────┴───────────────┐
                         │      AI SOC Orchestrator      │
                         └───────────────┬───────────────┘
                                         │
     ┌─────────────────┬─────────────────┼─────────────────┬─────────────────┐
     ▼                 ▼                 ▼                 ▼                 ▼
Triage Agent    Investigation Agent  CTI Agent     Detection Agent   Response Agent
 (Wazuh/EDR)     (Timeline/Process)  (OpenCTI)     (Sigma/Anomalies) (Shuffle SOAR)
     │                 │                 │                 │                 │
     └─────────────────┴─────────────────┼─────────────────┴─────────────────┘
                                         │
                              ┌──────────┴──────────┐
                              │  Human-in-the-Loop  │
                              │   Approval Engine   │
                              └──────────┬──────────┘
                                         │
                                ┌────────┴────────┐
                                ▼                 ▼
                        TheHive Case Sync   Shuffle SOAR
```

---

## 🧩 15 Core Modules Implemented

### 1. 🤖 AI SOC Assistant
- Natural language security querying (`"Why was this Windows endpoint detected as suspicious?"`).
- Automatic alert simplification and forensic explanation.
- Real-time agent thought traces & step-by-step reasoning outputs.
- Small floating **"Vichhai AI"** quick summon button on all screens.

### 2. 🚨 Alert Triage
- Automatic alert classification, severity scoring (0–100), and false-positive probability rating.
- Formatted structured triage card matching SOC standard:
  ```text
  Alert: Suspicious PowerShell (AMSI Bypass)
  Risk: High (94/100)
  Host: PC-NITH (192.168.10.45)
  User: Administrator
  MITRE: T1059.001 – PowerShell
  Reason: Obfuscated Base64 stager downloading stage2.ps1.
  Recommended: Isolate endpoint and block C2 IP 185.220.101.5.
  ```

### 3. 🔍 Automated Investigation
- Cross-telemetry deep search across Wazuh, OpenSearch, Active Directory, FortiGate, and FortiEDR.
- Interactive **Process Ancestry Tree** visualizer (`explorer.exe` ➔ `cmd.exe` ➔ `powershell.exe` ➔ `rundll32.exe`).
- Unified chronological attack timeline and forensic evidence locker with SHA-256 verification.

### 4. 🧠 Threat Intelligence Enrichment (OpenCTI)
- Native integration with **OpenCTI GraphQL API**.
- IP, Domain, Hash (MD5/SHA256), URL, Threat Actor (e.g. *APT29 / Cozy Bear*), and Malware Family (*Cobalt Strike*) lookups.
- Traffic Light Protocol (TLP:WHITE, GREEN, AMBER, AMBER+STRICT, RED) and confidence scoring.

### 5. 🔗 Security Data Correlation
- Correlates multi-source event telemetry across all 9 connected systems:
  1. **Wazuh** (Endpoint & FIM)
  2. **OpenSearch** (Log aggregation)
  3. **OpenCTI** (Threat intelligence)
  4. **TheHive** (Case management)
  5. **Shuffle** (SOAR orchestration)
  6. **FortiGate** (Perimeter firewall & IPS)
  7. **FortiEDR** (Behavioral memory defense)
  8. **Active Directory** (Kerberos Event 4769)
  9. **Microsoft 365** (Entra ID Impossible Travel)

### 6. 🕵️ Incident Investigation Workspace
- Unified incident case canvas featuring affected assets (`PC-NITH`), affected accounts (`Administrator`, `nith.sophal@acmefin.com`), MITRE techniques matrix, analyst comment threads, and autonomous AI summaries.

### 7. 📁 Case Management (TheHive)
- Bi-directional synchronization with **TheHive 5.x REST API**.
- Observable auto-extraction, task assignment, TLP/PAP governance, and post-incident review (PIR) generation.

### 8. ⚙️ SOAR / Automated Response (Shuffle)
- Automated execution of Shuffle SOAR playbooks:
  - `SHUFFLE-PB-ISOLATE-HOST` (Wazuh active-response & FortiEDR)
  - `SHUFFLE-PB-BLOCK-IP-FIREWALL` (FortiGate perimeter drop)
  - `SHUFFLE-PB-REVOKE-M365-SESSION` (Microsoft Graph API)
  - `SHUFFLE-PB-TELEGRAM-ALERT` (High-priority SOC channel)

### 9. 👨‍💻 Human-in-the-Loop (HITL) Governance
- Strict guardrails for destructive containment actions:
  ```text
  Vichhai AI Detection ──► Recommendation ──► Analyst Approval ──► Shuffle Playbook ──► Execution
  ```
- Interactive buttons: `[Approve Isolation]` `[Reject]` `[Investigate More]` with mandatory decision justification logging.

### 10. 🛡️ Automated Detection Engine
- Active behavioral rules:
  - Encoded PowerShell with AMSI bypass (`T1059.001`)
  - LSASS memory dumping / Mimikatz (`T1003.001`)
  - Entra ID Impossible Travel anomaly (`T1078.004`)
  - Kerberoasting RC4 encryption downgrade (`T1558.003`)
  - Ransomware canary file modification (`T1486`)
  - Lateral movement via PsExec (`T1543.003`)
- One-click live attack simulation triggers for live end-to-end testing.

### 11. 📊 SOC Dashboard
- Real-time command center metrics: Critical Alerts (12), High Alerts (37), Open Incidents (8), Investigating (5), Critical Assets (3), Active IOCs (24).
- 🤖 **Vichhai AI Insights** dynamic intelligence feed.

### 12. 📝 Automated Reporting
- On-demand compilation of **Daily SOC Summaries**, **Technical Post-Mortems**, **Executive Briefings**, and **Compliance Dossiers** (ISO 27001, SOC2, NIST CSF).
- Downloadable Markdown & printable PDF formatting.

### 13. 🔐 RBAC & Security
- 4 Role Tiers: `SOC Analyst`, `SOC Lead` (Approver), `SOC Manager`, `Administrator`.
- Immutable Audit Log recording actor, role, timestamp, action type, IP, and status.

### 14. 🏢 Multi-Tenant MSSP Support
- Instant tenant switching between isolated customer partitions:
  - `Tenant A: Acme FinTech Ltd.`
  - `Tenant B: Phnom Penh Retail Group`
  - `Tenant C: Global Health Systems`
  - `Tenant D: MegaCorp Logistics`
- Strict data isolation ensuring zero cross-tenant leakage.

### 15. 🧩 Multi-Agent Visualizer
- Visual pipeline monitoring 8 specialized agents with individual tool registries, confidence ratings, and execution latencies.

---

## 🚀 Getting Started

1. **Access the Live Preview:** The application is running on port `5173`.
2. **Try Suggested Inquiries:** Click any quick prompt in the Assistant (e.g. *"Why was this Windows endpoint detected as suspicious?"*).
3. **Trigger Live Ingestion:** Use the *"Simulate Attack"* dropdown in the top header to inject real-time Cobalt Strike or Impossible Travel events.
4. **Approve Containment:** Navigate to the *"Human-in-the-Loop"* tab to review and approve the isolation of `PC-NITH`.
