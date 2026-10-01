import { AgentStep, Alert, Incident, IOC, SOCReport, CaseTheHive } from '../types/soc';
import { socStore } from './storage';

export interface AgentExecutionResult {
  responseMarkdown: string;
  steps: AgentStep[];
  attachedData?: {
    type: 'ALERT' | 'INCIDENT' | 'IOC' | 'PROCESS_TREE' | 'APPROVAL_CARD' | 'REPORT' | 'THEHIVE_CASE' | 'CUSTOMER_ESCALATION';
    payload: any;
  };
  canEscalateToHuman?: boolean;
}

export class VichhaiAgentEngine {
  /**
   * Main entrypoint for processing natural language analyst & customer inquiries
   */
  public async processQuery(query: string): Promise<AgentExecutionResult> {
    const q = query.toLowerCase().trim();
    const steps: AgentStep[] = [];
    const activeTenant = socStore.getActiveTenant();
    const currentUser = socStore.getCurrentUser();

    // 1. Initial Orchestrator Step
    steps.push({
      id: `step-${Date.now()}-1`,
      agentName: 'AI Orchestrator',
      action: 'Decomposing User Intent & Security Context',
      input: query,
      output: `Intent mapped for user [${currentUser.name} (${currentUser.role})]. Routing to specialized SOC agents for [${activeTenant.name}].`,
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 95,
    });

    // ==========================================
    // CUSTOMER / CLIENT INQUIRIES & FAQ
    // ==========================================

    // Question 1: Customer Risk Status
    if (q.includes('risk status') || q.includes('threat level') || q.includes('are we safe') || q.includes('current security status')) {
      return this.answerCustomerRiskStatus(steps, activeTenant.name);
    }

    // Question 2: Was any data exfiltrated / stolen?
    if (q.includes('data stolen') || q.includes('data exfiltrated') || q.includes('data leak') || q.includes('stolen') || q.includes('exfiltration')) {
      return this.answerDataExfiltrationInquiry(steps, query);
    }

    // Question 3: Why was my endpoint / employee computer isolated?
    if (q.includes('why was') && (q.includes('isolated') || q.includes('blocked') || q.includes('disconnected'))) {
      return this.answerEndpointIsolationReason(steps);
    }

    // Question 4: Explain the incident in plain English / simple terms
    if (q.includes('plain english') || q.includes('simple term') || q.includes('explain to management') || q.includes('executive explanation')) {
      return this.answerPlainEnglishIncidentSummary(steps);
    }

    // Question 5: Is our Microsoft 365 environment safe?
    if (q.includes('m365') || q.includes('microsoft 365') || q.includes('email safe') || q.includes('entra id') || q.includes('office 365')) {
      return this.answerM365SecurityStatus(steps);
    }

    // Question 6: Compliance Ratings (ISO 27001, SOC 2, NIST CSF, PCI-DSS)
    if (q.includes('compliance') || q.includes('iso 27001') || q.includes('soc 2') || q.includes('pci') || q.includes('nist')) {
      return this.answerComplianceStatus(steps);
    }

    // Question 7: What is our SOC Response Speed (MTTR / MTTD)?
    if (q.includes('mttr') || q.includes('mttd') || q.includes('response speed') || q.includes('how fast')) {
      return this.answerMTTRSpeed(steps);
    }

    // Question 8: Whitelist software / false positive assistance
    if (q.includes('whitelist') || q.includes('false positive') || q.includes('allow software') || q.includes('unblock')) {
      return this.answerWhitelistingInquiry(steps);
    }

    // ==========================================
    // TECHNICAL SOC INQUIRIES
    // ==========================================

    // Case A: Query about why endpoint PC-NITH / Windows endpoint is suspicious
    if (q.includes('suspicious') || q.includes('pc-nith') || q.includes('endpoint') || q.includes('windows')) {
      return this.investigateEndpointPCNith(steps);
    }

    // Case B: Query about Alert Triage or specific alert
    if (q.includes('triage') || q.includes('alert') || q.includes('alt-wz') || q.includes('powershell')) {
      return this.triageSuspiciousPowerShell(steps);
    }

    // Case C: Query about Threat Intelligence / OpenCTI / IOC lookup
    if (q.includes('opencti') || q.includes('cti') || q.includes('ioc') || q.includes('185.220.101.5') || q.includes('ip lookup') || q.includes('reputation')) {
      return this.enrichThreatIntel(steps, '185.220.101.5');
    }

    // Case D: Query about Correlation across systems
    if (q.includes('correlate') || q.includes('correlation') || q.includes('fortigate') || q.includes('active directory')) {
      return this.correlateMultiSourceSecurityData(steps);
    }

    // Case E: Query about SOAR Response / Shuffle / Containment / Isolation
    if (q.includes('isolate') || q.includes('block') || q.includes('shuffle') || q.includes('response') || q.includes('containment')) {
      return this.handleSOARContainment(steps);
    }

    // Case F: Query about Case Management / TheHive
    if (q.includes('case') || q.includes('thehive') || q.includes('ticket')) {
      return this.syncTheHiveCase(steps);
    }

    // Case G: Query about Reports / Summary
    if (q.includes('report') || q.includes('summary') || q.includes('daily') || q.includes('executive')) {
      return this.generateAutomatedReport(steps);
    }

    // Default Fallback
    return this.generalSOCQuery(steps, query);
  }

  /**
   * CUSTOMER Q&A 1: Current Risk Status
   */
  private answerCustomerRiskStatus(steps: AgentStep[], tenantName: string): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'SOC Assistant Agent',
      action: 'Evaluating Real-Time Risk Posture & Defenses',
      input: `Tenant: ${tenantName}`,
      output: 'Posture Score: 92/100 (HIGH SECURITY). 1 Active Contained Incident on PC-NITH.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 140,
    });

    const responseMarkdown = `### 🛡️ Real-Time Security Health & Threat Level

**Customer Organization:** **${tenantName}**  
**Overall Security Posture Score:** 🟢 **92 / 100 (HEALTHY & PROTECTED)**

---

#### 📊 Current State Summary:
* **Active Defenses:** 9/9 Connected (Wazuh SIEM, FortiGate Firewalls, FortiEDR, Microsoft 365, OpenCTI).
* **Endpoints Monitored:** 420 Workstations & Servers protected with 24/7 autonomous surveillance.
* **Current Threat Spotlight:** 1 isolated containment event on **\`PC-NITH\`** (Threat contained via FortiGate edge blocks).
* **Critical Financial Core (\`DB-CORE-01\` & \`SRV-DC01\`):** **100% SECURE & OPERATIONAL**. Zero unauthorized access detected.

💡 *Need an immediate technical consultation with our lead security engineer? Click the **Escalate to Human SOC Lead** button below.*`;

    return {
      responseMarkdown,
      steps,
      canEscalateToHuman: true,
    };
  }

  /**
   * CUSTOMER Q&A 2: Was Data Stolen / Exfiltrated?
   */
  private answerDataExfiltrationInquiry(steps: AgentStep[], query: string): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Investigation Agent',
      action: 'Inspecting Egress PCAP Flow & FortiGate Session Volume',
      input: 'Filter: Outbound Bytes > 10MB to Unverified IPs (Timeframe: 24h)',
      output: 'Total Egress on C2 Channel: 15.4 KB (Heartbeat Beacon only). No mass data exfiltration observed.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 220,
    });

    const responseMarkdown = `### 🔒 Data Exfiltration Forensic Analysis

**Analysis for Inquiry:** *"Was any company data stolen or leaked?"*

---

#### 🔍 Forensic Verdict: **NO MASS DATA EXFILTRATION DETECTED**

1. **Network Egress Verification:**
   * FortiGate edge session records show total outbound data to the external C2 node (\`185.220.101.5\`) was only **15.4 Kilobytes** (strictly lightweight encrypted heartbeat beacons).
2. **File Integrity Monitoring (FIM):**
   * No database export dumps, zip archives, or staging directories were created on \`PC-NITH\` or financial file shares.
3. **Cloud Egress & M365:**
   * All OneDrive, SharePoint, and Exchange mail export APIs were locked down immediately after the impossible travel alert was triggered.

---

> ⚠️ **Notice:** If you require a formally signed forensic data non-compromise declaration for insurance or compliance auditors, click **"Escalate to Human SOC Lead"** to request a formal review by **Sophanith**.`;

    return {
      responseMarkdown,
      steps,
      canEscalateToHuman: true,
      attachedData: {
        type: 'CUSTOMER_ESCALATION',
        payload: {
          question: query,
          urgency: 'HIGH',
        },
      },
    };
  }

  /**
   * CUSTOMER Q&A 3: Why was endpoint isolated?
   */
  private answerEndpointIsolationReason(steps: AgentStep[]): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Incident Response Agent',
      action: 'Retrieving Isolation Playbook Trigger Context',
      input: 'Target: PC-NITH',
      output: 'Reason: In-memory Cobalt Strike stager detected with LSASS credential dumping attempt.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 130,
    });

    const responseMarkdown = `### 🚫 Why Endpoint \`PC-NITH\` Was Isolated

**Target Device:** \`PC-NITH\` (Finance Workstation - IP: 192.168.10.45)  
**Containment Status:** Isolated via Wazuh Active Response & Windows Firewall (Management channels only)

---

#### 📌 Why this action was necessary:
1. **Malicious Stager Intercepted:** The computer executed a hidden background PowerShell command connecting to a known cyber espionage C2 server (\`185.220.101.5\`).
2. **LSASS Memory Protection Triggered:** The malicious script attempted to harvest Windows administrative passwords from memory.
3. **Preventing Spread (Blast Radius Control):** By isolating the machine from the local network in under 2 minutes, Vichhai AI prevented the attacker from hopping onto other corporate servers or file shares.

#### 🔄 How to Restore Access:
Once our security analysts verify the machine is clean, access will be restored in one click without data loss.

👉 *Click **Escalate to Human SOC Lead** if this machine is required urgently for emergency business operations.*`;

    return {
      responseMarkdown,
      steps,
      canEscalateToHuman: true,
    };
  }

  /**
   * CUSTOMER Q&A 4: Plain English Incident Explanation
   */
  private answerPlainEnglishIncidentSummary(steps: AgentStep[]): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Reporting Agent',
      action: 'Synthesizing Non-Technical Executive Overview',
      input: 'Incident: INC-2026-0930-01',
      output: 'Non-technical summary generated.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 180,
    });

    const responseMarkdown = `### 📋 Plain English Incident Explanation (For Management & Clients)

**Incident Name:** Multi-Stage Intrusion on PC-NITH  
**What Happened (Simplified):**

1. **The Attempted Intrusion:** A workstation in the office (\`PC-NITH\`) ran a hidden, unauthorized script that reached out to a known malicious computer on the internet.
2. **The Defense System in Action:** **Vichhai AI** immediately caught the suspicious activity within **1.8 minutes** and blocked the script from stealing employee login passwords.
3. **The Containment:** To protect the rest of the company, the affected computer was disconnected from the office network while leaving all files intact.
4. **Current Status:** The threat is neutralized. No customer records, bank accounts, or financial databases were accessed.

---

**Next Steps:** Security engineers are performing a routine forensic clean-up and resetting cached passwords.`;

    return {
      responseMarkdown,
      steps,
      canEscalateToHuman: false,
    };
  }

  /**
   * CUSTOMER Q&A 5: Microsoft 365 Cloud Security
   */
  private answerM365SecurityStatus(steps: AgentStep[]): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Investigation Agent',
      action: 'Auditing Entra ID Token Health & Risky Sign-ins',
      input: 'Provider: Microsoft Graph API',
      output: '1 Risky Sign-in from Frankfurt proxy mitigated. 4 OAuth refresh tokens revoked.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 160,
    });

    const responseMarkdown = `### ☁️ Microsoft 365 & Cloud Email Security Status

**Cloud Identity Protection Status:** 🟢 **SECURE & MONITORED**

* **Entra ID Protection:** Active multi-factor authentication (MFA) enabled for 100% of executive accounts.
* **Incident Handled:** An unauthorized login attempt from a German proxy server was intercepted and blocked within 18 minutes.
* **Automated Action Taken:** All active session tokens for user \`nith.sophal@acmefin.com\` were automatically revoked via Microsoft Graph API to prevent unauthorized email access.

💡 *Vichhai AI recommends enabling FIDO2 hardware security keys for all senior finance officers.*`;

    return {
      responseMarkdown,
      steps,
      canEscalateToHuman: true,
    };
  }

  /**
   * CUSTOMER Q&A 6: Compliance Ratings
   */
  private answerComplianceStatus(steps: AgentStep[]): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Compliance Agent',
      action: 'Mapping Continuous Telemetry to Compliance Standards',
      input: 'Standards: ISO 27001, SOC 2 Type II, PCI-DSS v4.0, NIST CSF',
      output: 'Compliance Score: 98.4%. Audit trails verified.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 210,
    });

    const responseMarkdown = `### 📜 Compliance & Regulatory Posture Scorecard

**Continuous SOC Compliance Evaluation:**

| Standard | Framework Control | Status | Readiness Score |
| :--- | :--- | :--- | :--- |
| **ISO/IEC 27001:2022** | A.12.4 (Logging & Monitoring) | 🟢 Compliant | **99.1%** |
| **SOC 2 Type II** | CC7.2 (Security Incident Monitoring) | 🟢 Compliant | **98.2%** |
| **PCI-DSS v4.0** | Req 10 (Log Review & Active Defense) | 🟢 Compliant | **97.8%** |
| **NIST CSF v2.0** | DE.CM-1 & RS.CO-2 (Detection & Response) | 🟢 Compliant | **98.5%** |

*All audit logs and incident evidence are immutably signed and exportable on demand.*`;

    return {
      responseMarkdown,
      steps,
    };
  }

  /**
   * CUSTOMER Q&A 7: MTTR & Response Speed
   */
  private answerMTTRSpeed(steps: AgentStep[]): AgentExecutionResult {
    return {
      responseMarkdown: `### ⚡ SOC SLA & Response Performance Metrics

* **Mean Time to Detect (MTTD):** **1.8 minutes** *(Industry Average: 207 days)*
* **Mean Time to Respond (MTTR):** **14.5 minutes** *(Industry Average: 73 days)*
* **False Positive Reduction:** **75.6%** of alerts automatically filtered by Vichhai AI Triage Agent.
* **SLA Compliance:** 100% of Critical (P1) incidents acknowledged in under 5 minutes.`,
      steps: [
        {
          id: `step-${Date.now()}-2`,
          agentName: 'Reporting Agent',
          action: 'Calculating Operational SLA Performance',
          input: 'Timeframe: last 30 days',
          output: 'MTTR: 14.5m | MTTD: 1.8m',
          status: 'COMPLETED',
          timestamp: new Date().toLocaleTimeString(),
          durationMs: 110,
        },
      ],
    };
  }

  /**
   * CUSTOMER Q&A 8: Whitelisting Software
   */
  private answerWhitelistingInquiry(steps: AgentStep[]): AgentExecutionResult {
    return {
      responseMarkdown: `### 🛡️ How to Whitelist Legitimate Software or IT Patches

If your IT team is deploying new software or running maintenance scripts that triggered an alert:

1. **Automatic Filtering:** Vichhai AI automatically validates Enterprise PKI CA digital signatures (e.g. SCCM deployment \`PatchWeekly.ps1\` was automatically verified as safe).
2. **Submit a Whitelist Request:** Click **"Escalate to Human SOC Lead"** with the software hash or file path.
3. **Immediate Policy Update:** Super Admin **Sophanith** can add an exclusion to the FortiEDR and Wazuh ruleset in under 5 minutes.`,
      steps,
      canEscalateToHuman: true,
    };
  }

  /**
   * Endpoint deep investigation (PC-NITH)
   */
  private investigateEndpointPCNith(steps: AgentStep[]): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Investigation Agent',
      action: 'Querying Wazuh & OpenSearch Telemetry for PC-NITH (192.168.10.45)',
      input: 'host: PC-NITH AND timeframe: last 24h',
      output: 'Found 6 anomalous events: Hidden PowerShell execution, LSASS memory handle opened, RC4 Kerberos ticket request.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 240,
    });

    steps.push({
      id: `step-${Date.now()}-3`,
      agentName: 'Threat Intelligence Agent',
      action: 'OpenCTI Indicator Match & Attribution',
      input: 'IOCs: 185.220.101.5, Hash: e3b0c442...',
      output: 'Matched Cobalt Strike C2 (Confidence 96%, TLP:AMBER) and Mimikatz binary (Confidence 99%). Threat Actor: APT29.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 180,
    });

    steps.push({
      id: `step-${Date.now()}-4`,
      agentName: 'Incident Response Agent',
      action: 'Formulating Containment Playbook & Approval Payload',
      input: 'Target: PC-NITH | Action: Host Isolation via Shuffle',
      output: 'Created Approval Request APPR-2026-001. Requires Human-in-the-Loop authorization from SOC Lead.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 110,
    });

    const responseMarkdown = `### 🔍 Deep Investigation Finding: Endpoint \`PC-NITH\` (192.168.10.45)

**Vichhai AI** flagged **\`PC-NITH\`** as **CRITICAL RISK (Score: 96/100)** due to a confirmed multi-stage intrusion attributed to **APT29 (Cozy Bear)**.

---

#### 📌 Why this endpoint is suspicious:
1. **Encoded PowerShell Execution (T1059.001):** \`cmd.exe\` (PID 3108) spawned \`powershell.exe\` with hidden window parameters downloading a secondary payload from \`http://185.220.101.5:8080/stage2.ps1\`.
2. **LSASS Credential Harvesting (T1003.001):** \`rundll32.exe\` opened a direct minidump handle to \`lsass.exe\` to extract local and domain administrative credentials.
3. **Active Directory Kerberoasting (T1558.003):** Generated Event 4769 requesting RC4 downgrade tickets for service account \`svc_mssql\`.
4. **C2 Beaconing (T1071.001):** FortiGate logged persistent 15-second beaconing to \`185.220.101.5\`.
5. **M365 Impossible Travel (T1078.004):** Compromised credentials used to access cloud mail from Frankfurt proxy (91.240.118.172) within 18 minutes of Phnom Penh login.

---

#### 🛡️ Vichhai AI Recommendation:
* **Immediate Isolation:** Isolate \`PC-NITH\` to prevent lateral movement.
* **Firewall Blacklist:** Block \`185.220.101.5\` on FortiGate perimeter.
* **Rotate Credentials:** Invalidate all domain tokens cached in LSASS.

👉 *Click the **Human Approval** button below to approve containment.*`;

    return {
      responseMarkdown,
      steps,
      canEscalateToHuman: true,
      attachedData: {
        type: 'APPROVAL_CARD',
        payload: socStore.getApprovals()[0],
      },
    };
  }

  /**
   * Alert Triage workflow matching prompt specification
   */
  private triageSuspiciousPowerShell(steps: AgentStep[]): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Triage Agent',
      action: 'Evaluating Alert AST-WZ-901 against MITRE ATT&CK Framework',
      input: 'Wazuh Event 4688: EncodedCommand Base64 payload',
      output: 'Classified: High Risk (Score: 94). MITRE: T1059.001 (PowerShell). False Positive probability: 2%.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 150,
    });

    const responseMarkdown = `### 🚨 Vichhai AI Alert Triage Output

\`\`\`text
Alert: Suspicious PowerShell (AMSI Bypass)

Risk: High (94/100)
Host: PC-NITH (192.168.10.45)
User: Administrator

MITRE:
T1059.001 – Command and Scripting Interpreter: PowerShell

Reason:
Multiple suspicious PowerShell executions were detected running obfuscated base64 stager downloading from 185.220.101.5:8080.

Recommended:
Investigate process tree, terminate child threads, dump active memory, and block C2 IP in FortiGate.
\`\`\`

---

#### 📊 Triage Breakdown:
* **Classification:** Active Exploitation / C2 Stager
* **Severity Assessment:** CRITICAL (Score: 94/100)
* **False-Positive Identification:** **FALSE (Confidence 98%)**
* **Affected Assets:** \`PC-NITH\` (Host), \`Administrator\` (User), \`SRV-DC01-HQ\` (Target DC).
* **Cross-Cluster Linkage:** Correlated into Incident **\`INC-2026-0930-01\`** with 5 related events.`;

    return {
      responseMarkdown,
      steps,
      attachedData: {
        type: 'ALERT',
        payload: socStore.getAlerts()[0],
      },
    };
  }

  /**
   * OpenCTI Threat Intelligence enrichment
   */
  private enrichThreatIntel(steps: AgentStep[], targetIoc: string): AgentExecutionResult {
    const ioc = socStore.getIOCs().find(i => i.value.includes(targetIoc)) || socStore.getIOCs()[0];

    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Threat Intelligence Agent',
      action: `Querying OpenCTI GraphQL API for Indicator [${ioc.value}]`,
      input: `type: ${ioc.type} | query: ${ioc.value}`,
      output: `Found verified CTI entity: ${ioc.threatActor} (${ioc.malwareFamily}). Confidence: ${ioc.confidenceScore}%.`,
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 210,
    });

    const responseMarkdown = `### 🧠 OpenCTI Threat Intelligence Enrichment

\`\`\`text
Wazuh Alert
     ↓
Extract IOC [${ioc.value}]
     ↓
OpenCTI Connector
     ↓
Threat Intelligence Matched
     ↓
Vichhai AI Risk Assessment (Score: ${ioc.confidenceScore}/100 - ${ioc.reputation})
\`\`\`

---

#### 🎯 Indicator Details:
* **Observable:** \`${ioc.value}\` (${ioc.type})
* **Reputation:** 🔴 **${ioc.reputation}**
* **Confidence Score:** **${ioc.confidenceScore}%**
* **TLP Level:** \`${ioc.tlp}\`
* **Threat Actor Attribution:** **${ioc.threatActor || 'APT29 (Cozy Bear)'}**
* **Malware Family:** **${ioc.malwareFamily || 'Cobalt Strike Beacon'}**
* **First Seen / Last Seen:** ${ioc.firstSeen} / ${ioc.lastSeen}
* **Connected CTI Feeds:** ${ioc.sources.join(', ')}`;

    return {
      responseMarkdown,
      steps,
      attachedData: {
        type: 'IOC',
        payload: ioc,
      },
    };
  }

  /**
   * Multi-Source Data Correlation
   */
  private correlateMultiSourceSecurityData(steps: AgentStep[]): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Investigation Agent',
      action: 'Aggregating Telemetry across Wazuh, FortiGate, AD, and M365',
      input: 'Correlation Matrix: Host [PC-NITH] + User [Administrator] + Time Window: 30 mins',
      output: 'Correlated 6 distinct telemetry points across 5 independent systems into Unified Attack Graph.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 290,
    });

    const responseMarkdown = `### 🔗 Multi-System Security Data Correlation

**Vichhai AI Correlation Engine** linked telemetry across **5 distinct security layers** into a single attack graph:

\`\`\`text
[Wazuh Syscheck]        [FortiEDR]           [FortiGate Edge]
      │                     │                       │
      ▼                     ▼                       ▼
PowerShell Exec  ───►  LSASS Memory Dump  ───►  C2 Port 8080 Flow
 (PC-NITH:4912)         (Mimikatz Hash)          (185.220.101.5)
      │                     │                       │
      └─────────────────────┼───────────────────────┘
                            ▼
              [Active Directory Event 4769]
             (Kerberoasting against svc_mssql)
                            │
                            ▼
               [Microsoft 365 Entra ID]
            (Impossible Travel to Frankfurt)
                            │
                            ▼
             🎯 Incident INC-2026-0930-01
\`\`\``;

    return {
      responseMarkdown,
      steps,
      attachedData: {
        type: 'INCIDENT',
        payload: socStore.getIncidents()[0],
      },
    };
  }

  /**
   * SOAR Containment & Human-in-the-Loop
   */
  private handleSOARContainment(steps: AgentStep[]): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Incident Response Agent',
      action: 'Evaluating SOAR Playbooks via Shuffle API',
      input: 'Playbook: SHUFFLE-PB-ISOLATE-HOST (Target: PC-NITH)',
      output: 'Safety Check: Destructive containment requires SOC Lead Human Approval (Rule HITL-01).',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 140,
    });

    const responseMarkdown = `### ⚙️ SOAR / Automated Response via Shuffle

> ⚠️ **Vichhai AI recommends isolating \`PC-NITH\` because of a high-confidence malicious IOC match (\`185.220.101.5\` - APT29 Cobalt Strike).**

#### Actions Queued:
1. **[Isolate Endpoint]:** Disable all inbound/outbound IP routing on \`PC-NITH\` except SIEM/EDR channels.
2. **[Block IP in FortiGate]:** Add \`185.220.101.5\` to firewall perimeter drop rule.

👉 *Use the Approval Queue or the buttons below to authorize or reject this action.*`;

    return {
      responseMarkdown,
      steps,
      attachedData: {
        type: 'APPROVAL_CARD',
        payload: socStore.getApprovals()[0],
      },
    };
  }

  /**
   * TheHive Case Management
   */
  private syncTheHiveCase(steps: AgentStep[]): AgentExecutionResult {
    const activeCase = socStore.getCases()[0];

    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Investigation Agent',
      action: 'Synchronizing Case with TheHive 5.x API',
      input: `Incident: INC-2026-0930-01 -> Case #${activeCase?.caseNumber || 408}`,
      output: `Case #${activeCase?.caseNumber || 408} synchronized with 5 observables.`,
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 190,
    });

    return {
      responseMarkdown: `### 📁 TheHive Case #${activeCase.caseNumber} Synchronized\n\n* **Title:** ${activeCase.title}\n* **Status:** \`${activeCase.status}\` | **TLP:** \`${activeCase.tlp}\`\n* **Observables:** 5 active IOCs attached.`,
      steps,
      attachedData: {
        type: 'THEHIVE_CASE',
        payload: activeCase,
      },
    };
  }

  /**
   * Automated SOC Reporting
   */
  private generateAutomatedReport(steps: AgentStep[]): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Reporting Agent',
      action: 'Compiling Daily SOC Operational & Executive Report',
      input: `Tenant: ${socStore.getActiveTenant().name} | Timeframe: 24h`,
      output: 'Report generated successfully with MTTR, MTTD, and MITRE heatmap.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 310,
    });

    const report = socStore.getReports()[0];

    return {
      responseMarkdown: `### 📝 Automated Daily SOC Summary Report\n\n> **Daily SOC Summary**\n>\n> • **1,245** alerts received\n> • **38** high/critical severity\n> • **7** incidents investigated\n> • **2** confirmed threats\n> • **1** endpoint isolation pending approval\n> • **Mean Time to Respond (MTTR):** 14.5 mins`,
      steps,
      attachedData: {
        type: 'REPORT',
        payload: report,
      },
    };
  }

  /**
   * General fallback query
   */
  private generalSOCQuery(steps: AgentStep[], query: string): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Investigation Agent',
      action: 'Analyzing SOC Knowledge Base & Security Graph',
      input: query,
      output: 'Context resolved. Synthesizing recommendations.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 220,
    });

    const activeTenant = socStore.getActiveTenant();
    const alerts = socStore.getAlerts();

    return {
      responseMarkdown: `### 🤖 Vichhai AI Assistant Analysis

Regarding your query: *"**${query}**"* for **${activeTenant.name}**:

* **Current Security State:** There are **${alerts.length} active alerts** under monitoring.
* **Active Intrusion Spotlight:** Endpoint **\`PC-NITH\`** is undergoing investigation for **Cobalt Strike C2** communication with \`185.220.101.5\`.

#### Suggested Inquiries:
1. *"Was any data stolen from my network?"*
2. *"Why was this Windows endpoint detected as suspicious?"*
3. *"Explain the Cobalt Strike threat in simple English"*
4. *"What are our ISO 27001 and SOC 2 compliance ratings?"*
5. *"Show me OpenCTI threat intel for 185.220.101.5"*`,
      steps,
      canEscalateToHuman: true,
    };
  }

  /**
   * Live Attack Simulator
   */
  public simulateLiveAttack(scenario: 'COBALT_STRIKE' | 'IMPOSSIBLE_TRAVEL' | 'RANSOMWARE_CANARY') {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const activeTenantId = socStore.getActiveTenant().id;

    if (scenario === 'COBALT_STRIKE') {
      const newAlert: Alert = {
        id: `ALT-LIVE-${Date.now()}`,
        tenantId: activeTenantId,
        title: 'Live Detection: Obfuscated PowerShell In-Memory Stager',
        source: 'Wazuh',
        sourceAlertId: `wazuh-live-${Date.now()}`,
        timestamp,
        severity: 'CRITICAL',
        riskScore: 97,
        status: 'NEW',
        host: 'PC-NITH',
        hostIp: '192.168.10.45',
        user: 'Administrator',
        processName: 'powershell.exe',
        processId: 7892,
        parentProcess: 'cmd.exe (PID 3108)',
        commandLine: 'powershell.exe -w hidden -nop -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAAgAEkATwAuAE0AZQBtAG8AcgB5AFMAdAByAGUAYQBt...',
        destinationIp: '185.220.101.5',
        destinationPort: 8080,
        mitreTechnique: 'T1059.001 – PowerShell',
        mitreTactic: 'Execution',
        rawLog: '{"event":"Live PowerShell In-Memory Injection","agent":"PC-NITH"}',
        reason: 'Detected live reflective DLL injection into powershell.exe connecting to known C2.',
        recommendation: 'Isolate PC-NITH immediately via Shuffle.',
        isFalsePositive: false,
        fpConfidence: 1,
        tags: ['live-simulation', 'cobalt-strike', 'powershell'],
        extractedIOCs: socStore.getIOCs().slice(0, 2),
      };

      socStore.addAlert(newAlert);
      socStore.addAuditLog('SIMULATED_ATTACK_INGEST', 'INVESTIGATION', 'Simulated Cobalt Strike in-memory injection attack on PC-NITH.');
      return newAlert;
    } else if (scenario === 'IMPOSSIBLE_TRAVEL') {
      const newAlert: Alert = {
        id: `ALT-LIVE-${Date.now()}`,
        tenantId: activeTenantId,
        title: 'Live Detection: Entra ID Risky Sign-in (Impossible Velocity)',
        source: 'Microsoft 365',
        sourceAlertId: `m365-live-${Date.now()}`,
        timestamp,
        severity: 'HIGH',
        riskScore: 89,
        status: 'NEW',
        host: 'Cloud-EntraID',
        hostIp: '194.26.29.112',
        user: 'dara.chan@acmefin.com',
        mitreTechnique: 'T1078.004 – Cloud Accounts',
        mitreTactic: 'Initial Access',
        rawLog: '{"user":"dara.chan@acmefin.com","loc1":"Phnom Penh, KH","loc2":"London, GB","delta_min":6}',
        reason: 'Token accessed from London 6 minutes after authentication in Phnom Penh.',
        recommendation: 'Revoke cloud refresh token and enforce MFA challenge.',
        isFalsePositive: false,
        fpConfidence: 2,
        tags: ['impossible-travel', 'm365', 'live-simulation'],
        extractedIOCs: [],
      };

      socStore.addAlert(newAlert);
      socStore.addAuditLog('SIMULATED_ATTACK_INGEST', 'INVESTIGATION', 'Simulated Entra ID impossible travel login event.');
      return newAlert;
    } else {
      const newAlert: Alert = {
        id: `ALT-LIVE-${Date.now()}`,
        tenantId: activeTenantId,
        title: 'Live Detection: Ransomware Canary File Renamed (.lockbit)',
        source: 'FortiEDR',
        sourceAlertId: `fedr-live-${Date.now()}`,
        timestamp,
        severity: 'CRITICAL',
        riskScore: 99,
        status: 'NEW',
        host: 'SRV-FIN-APP',
        hostIp: '192.168.10.60',
        user: 'SYSTEM',
        processName: 'svchost_update.exe',
        processId: 8840,
        mitreTechnique: 'T1486 – Data Encrypted for Impact',
        mitreTactic: 'Impact',
        rawLog: '{"event":"Canary file modified","path":"C:\\\\Shares\\\\Financial\\\\canary_report.docx.lockbit"}',
        reason: 'Decoy canary file modified with known ransomware extension.',
        recommendation: 'Kill process tree and isolate SRV-FIN-APP immediately.',
        isFalsePositive: false,
        fpConfidence: 0,
        tags: ['ransomware', 'canary', 'lockbit', 'live-simulation'],
        extractedIOCs: [],
      };

      socStore.addAlert(newAlert);
      socStore.addAuditLog('SIMULATED_ATTACK_INGEST', 'INVESTIGATION', 'Simulated Ransomware Canary file modification alert.');
      return newAlert;
    }
  }
}

export const agentEngine = new VichhaiAgentEngine();
