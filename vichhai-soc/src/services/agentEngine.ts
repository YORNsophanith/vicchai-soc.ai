import { AgentStep, Alert, Incident, IOC, SOCReport, CaseTheHive } from '../types/soc';
import { socStore } from './storage';

export interface AgentExecutionResult {
  responseMarkdown: string;
  steps: AgentStep[];
  attachedData?: {
    type: 'ALERT' | 'INCIDENT' | 'IOC' | 'PROCESS_TREE' | 'APPROVAL_CARD' | 'REPORT' | 'THEHIVE_CASE';
    payload: any;
  };
}

export class VichhaiAgentEngine {
  /**
   * Main entrypoint for processing natural language analyst inquiries
   */
  public async processQuery(query: string): Promise<AgentExecutionResult> {
    const q = query.toLowerCase().trim();
    const steps: AgentStep[] = [];
    const activeTenant = socStore.getActiveTenant();

    // 1. Initial Orchestrator Step
    steps.push({
      id: `step-${Date.now()}-1`,
      agentName: 'AI Orchestrator',
      action: 'Decomposing Analyst Intent & Security Context',
      input: query,
      output: `Intent classified. Dispatching to specialized agents for tenant [${activeTenant.name}].`,
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 120,
    });

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
    if (q.includes('correlate') || q.includes('correlation') || q.includes('fortigate') || q.includes('active directory') || q.includes('m365')) {
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

    // Default Fallback: General Security Intelligence Agent Query
    return this.generalSOCQuery(steps, query);
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

    const activeIncident = socStore.getIncidents()[0];

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
* **False-Positive Identification:** **FALSE (Confidence 98%)** — Command line uses \`-NoP -NonI -W Hidden -Exec Bypass\` with raw socket webclient download.
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
* **Connected CTI Feeds:** ${ioc.sources.join(', ')}
* **Associated MITRE Techniques:** \`T1071.001\` (Web Protocols), \`T1059.001\` (PowerShell), \`T1105\` (Ingress Tool Transfer)`;

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
\`\`\`

#### 📈 Key Correlation Insights:
1. **Initial Trigger:** Wazuh caught \`powershell.exe\` executing an AMSI bypass stager.
2. **Behavioral Layer:** FortiEDR caught the spawned thread reading \`lsass.exe\` memory.
3. **Network Layer:** FortiGate perimeter caught synchronous beaconing to OpenCTI-flagged C2 IP \`185.220.101.5\`.
4. **Identity Layer:** Active Directory Domain Controller caught Kerberos ticket downgrade request originating from \`192.168.10.45\`.
5. **Cloud Layer:** Microsoft 365 logged token abuse from German egress IP \`91.240.118.172\`.`;

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

\`\`\`text
Vichhai AI Detection
        ↓
Risk Assessment (Score: 96)
        ↓
Action Recommendation
        ↓
👨‍💻 Human-in-the-Loop Analyst Approval  <-- [CURRENT STATUS]
        ↓
Shuffle SOAR Playbook Trigger
        ↓
Wazuh / FortiGate Active Response
\`\`\`

---

> ⚠️ **Vichhai AI recommends isolating \`PC-NITH\` because of a high-confidence malicious IOC match (\`185.220.101.5\` - APT29 Cobalt Strike).**

#### Actions Queued:
1. **[Isolate Endpoint]:** Disable all inbound/outbound IP routing on \`PC-NITH\` except SIEM/EDR channels.
2. **[Block IP in FortiGate]:** Add \`185.220.101.5\` to firewall perimeter drop rule.
3. **[Revoke M365 Session]:** *(Already executed automatically by Identity Agent).*

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
    const cases = socStore.getCases();
    const activeCase = cases[0];

    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Investigation Agent',
      action: 'Synchronizing Case with TheHive 5.x API',
      input: `Incident: INC-2026-0930-01 -> Case #${activeCase?.caseNumber || 408}`,
      output: `Case #${activeCase?.caseNumber || 408} synchronized with 5 observables and 4 response tasks.`,
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 190,
    });

    const responseMarkdown = `### 📁 TheHive Case Synchronization

\`\`\`text
Wazuh Alert (ALT-WZ-901)
     ↓
Vichhai Autonomous Investigation
     ↓
OpenCTI Enrichment (APT29 / Cobalt Strike)
     ↓
Incident Confirmed (INC-2026-0930-01)
     ↓
TheHive Case Created (#${activeCase.caseNumber})
\`\`\`

---

#### 📋 Case Summary:
* **Case ID:** \`${activeCase.id}\` (#${activeCase.caseNumber})
* **Title:** ${activeCase.title}
* **Status:** \`${activeCase.status}\` | **Severity:** \`${activeCase.severity}\` | **TLP:** \`${activeCase.tlp}\`
* **Assignee:** \`${activeCase.assignee}\`
* **Observables:** 5 active IOCs attached (IPs, MD5/SHA256 hashes, URLs).
* **Investigation Tasks:** 4 tasks tracked (1 Completed, 1 In-Progress, 2 Waiting).`;

    return {
      responseMarkdown,
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

    const responseMarkdown = `### 📝 Automated Daily SOC Summary Report

> **Daily SOC Summary (September 30, 2026)**
>
> • **1,245** alerts received  
> • **38** high/critical severity  
> • **7** incidents investigated  
> • **2** confirmed threats  
> • **1** endpoint isolation pending approval  
> • **Mean Time to Respond (MTTR):** 14.5 mins

---

#### 📊 Key Highlights:
* **Tenant:** ${socStore.getActiveTenant().name}
* **Primary Threat:** APT29 Cobalt Strike intrusion on \`PC-NITH\` (Contained).
* **False Positive Reduction:** 75.6% of low-risk noise automatically triaged and suppressed.
* **Compliance Posture:** Meets ISO 27001 A.12.4 (Logging & Monitoring) and NIST CSF PR.DS-1.

👉 *View or export full Markdown/HTML/PDF format in the **Reports** tab.*`;

    return {
      responseMarkdown,
      steps,
      attachedData: {
        type: 'REPORT',
        payload: report,
      },
    };
  }

  /**
   * General fallback query answering SOC questions
   */
  private generalSOCQuery(steps: AgentStep[], query: string): AgentExecutionResult {
    steps.push({
      id: `step-${Date.now()}-2`,
      agentName: 'Investigation Agent',
      action: 'Analyzing SOC Knowledge Base & Security Graph',
      input: query,
      output: 'Context resolved. Synthesizing technical recommendations.',
      status: 'COMPLETED',
      timestamp: new Date().toLocaleTimeString(),
      durationMs: 220,
    });

    const activeTenant = socStore.getActiveTenant();
    const alerts = socStore.getAlerts();
    const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL');

    const responseMarkdown = `### 🤖 Vichhai AI Assistant Analysis

Regarding your query: *"**${query}**"* for **${activeTenant.name}**:

* **Current Security State:** There are **${alerts.length} active alerts** (${criticalAlerts.length} Critical).
* **Active Intrusion Spotlight:** Endpoint **\`PC-NITH\`** is currently undergoing investigation for **Cobalt Strike C2** communication with \`185.220.101.5\`.
* **Integrated Sources Active:** Wazuh, OpenSearch, OpenCTI, TheHive, Shuffle, FortiGate, FortiEDR, Active Directory, and Microsoft 365.

#### Suggested Quick Prompts:
1. *"Why was this Windows endpoint detected as suspicious?"*
2. *"Explain alert ALT-WZ-901 in detail"*
3. *"Show me OpenCTI threat intel for 185.220.101.5"*
4. *"Isolate PC-NITH with human approval"*
5. *"Generate Daily SOC Summary report"*`;

    return {
      responseMarkdown,
      steps,
    };
  }

  /**
   * Live Attack Simulator to demonstrate autonomous Agentic SOC workflow
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
