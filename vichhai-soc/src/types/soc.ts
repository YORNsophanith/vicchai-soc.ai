export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
export type AlertStatus = 'NEW' | 'TRIAGED' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED' | 'FALSE_POSITIVE';
export type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'CONTAINMENT' | 'PENDING_APPROVAL' | 'RESOLVED' | 'CLOSED';
export type TLP = 'TLP:WHITE' | 'TLP:GREEN' | 'TLP:AMBER' | 'TLP:AMBER+STRICT' | 'TLP:RED';
export type UserRole = 'SOC_ANALYST' | 'SOC_LEAD' | 'SOC_MANAGER' | 'ADMINISTRATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  code: string;
  description: string;
  assetCount: number;
  criticalAssets: string[];
  industry: string;
}

export interface Alert {
  id: string;
  tenantId: string;
  title: string;
  source: 'Wazuh' | 'FortiGate' | 'FortiEDR' | 'Active Directory' | 'Microsoft 365' | 'OpenSearch' | 'Suricata' | 'CrowdStrike';
  sourceAlertId: string;
  timestamp: string;
  severity: Severity;
  riskScore: number; // 0 - 100
  status: AlertStatus;
  host: string;
  hostIp: string;
  user: string;
  processName?: string;
  processId?: number;
  parentProcess?: string;
  commandLine?: string;
  destinationIp?: string;
  destinationPort?: number;
  mitreTechnique: string;
  mitreTactic: string;
  rawLog: string;
  reason: string;
  recommendation: string;
  isFalsePositive: boolean;
  fpConfidence: number; // 0 - 100
  correlatedIncidentId?: string;
  tags: string[];
  extractedIOCs: IOC[];
}

export interface IOC {
  id: string;
  type: 'IP' | 'DOMAIN' | 'URL' | 'HASH_SHA256' | 'HASH_MD5' | 'EMAIL' | 'MUTEX';
  value: string;
  reputation: 'MALICIOUS' | 'SUSPICIOUS' | 'BENIGN' | 'UNKNOWN';
  confidenceScore: number; // 0 - 100
  tlp: TLP;
  threatActor?: string;
  malwareFamily?: string;
  firstSeen?: string;
  lastSeen?: string;
  openCtiId?: string;
  tags: string[];
  sources: string[];
}

export interface ProcessNode {
  id: string;
  name: string;
  pid: number;
  ppid: number;
  user: string;
  cmd: string;
  hash?: string;
  timestamp: string;
  isMalicious?: boolean;
  children?: ProcessNode[];
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  source: string;
  title: string;
  description: string;
  severity: Severity;
  mitreCode?: string;
  actorOrUser: string;
  targetHost: string;
  evidenceId?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  type: 'PCAP' | 'LOG_DUMP' | 'MEMORY_STRING' | 'FILE_HASH' | 'REGISTRY_KEY' | 'SCREENSHOT';
  source: string;
  timestamp: string;
  hash: string;
  size: string;
  details: string;
  verified: boolean;
}

export interface AnalystNote {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
  type: 'NOTE' | 'HYPOTHESIS' | 'FINDING' | 'AI_GENERATED';
}

export interface Incident {
  id: string;
  tenantId: string;
  title: string;
  summary: string;
  executiveSummary: string;
  technicalSummary: string;
  severity: Severity;
  riskScore: number;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  assignedAnalyst: string;
  affectedHosts: string[];
  affectedUsers: string[];
  mitreTechniques: string[];
  alertIds: string[];
  iocs: IOC[];
  timeline: IncidentTimelineEvent[];
  evidence: EvidenceItem[];
  notes: AnalystNote[];
  recommendedPlaybooks: string[];
  theHiveCaseId?: string;
  shuffleExecutionId?: string;
}

export interface CaseTheHive {
  id: string;
  caseNumber: number;
  tenantId: string;
  incidentId: string;
  title: string;
  description: string;
  severity: Severity;
  tlp: TLP;
  pap: 'PAP:WHITE' | 'PAP:GREEN' | 'PAP:AMBER' | 'PAP:RED';
  status: 'Open' | 'InProgress' | 'PendingApproval' | 'Closed';
  assignee: string;
  tags: string[];
  observablesCount: number;
  tasksCount: number;
  createdAt: string;
  updatedAt: string;
  tasks: Array<{
    id: string;
    title: string;
    status: 'Waiting' | 'InProgress' | 'Completed' | 'Cancel';
    assignee: string;
  }>;
  observables: Array<{
    id: string;
    dataType: string;
    data: string;
    ioc: boolean;
    tags: string[];
    reportsCount: number;
  }>;
}

export interface SOARAction {
  id: string;
  title: string;
  category: 'NETWORK' | 'ENDPOINT' | 'IDENTITY' | 'NOTIFICATION' | 'FORENSICS';
  targetSystem: 'Shuffle' | 'FortiGate' | 'FortiEDR' | 'Wazuh' | 'Active Directory' | 'Microsoft 365' | 'Telegram' | 'TheHive';
  actionType: string;
  parameters: Record<string, any>;
  requiresApproval: boolean;
  destructiveLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
  status: 'READY' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  approvalRequestId?: string;
  executedAt?: string;
  executionLogs?: string[];
}

export interface ApprovalRequest {
  id: string;
  tenantId: string;
  incidentId: string;
  actionId: string;
  title: string;
  description: string;
  targetAssetOrUser: string;
  riskImpact: string;
  recommendedBy: string; // 'Vichhai AI'
  confidence: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  decisionNotes?: string;
  actionPayload: Record<string, any>;
}

export interface DetectionRule {
  id: string;
  name: string;
  category: string;
  mitreId: string;
  severity: Severity;
  enabled: boolean;
  description: string;
  logic: string;
  sourceSystems: string[];
  lastTriggered?: string;
  triggerCount: number;
}

export interface SOCReport {
  id: string;
  tenantId: string;
  title: string;
  type: 'DAILY_SUMMARY' | 'WEEKLY_POSTURE' | 'INCIDENT_DEEP_DIVE' | 'POST_MORTEM' | 'COMPLIANCE_EVIDENCE';
  createdAt: string;
  generatedBy: string;
  incidentId?: string;
  summary: string;
  stats: {
    totalAlerts: number;
    highSeverityAlerts: number;
    incidentsInvestigated: number;
    confirmedThreats: number;
    isolatedEndpoints: number;
    mttrMinutes: number;
    blockedIocs: number;
  };
  contentMarkdown: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  timestamp: string;
  actor: string;
  role: UserRole;
  action: string;
  category: 'INVESTIGATION' | 'APPROVAL' | 'SOAR_EXECUTION' | 'CASE_MGMT' | 'CTI_QUERY' | 'AUTH' | 'CONFIG';
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
  ipAddress: string;
}

export interface AgentStep {
  id: string;
  agentName: 'AI Orchestrator' | 'Triage Agent' | 'Investigation Agent' | 'Threat Intelligence Agent' | 'Detection Agent' | 'Incident Response Agent' | 'Reporting Agent' | 'Compliance Agent';
  action: string;
  input: string;
  output: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  timestamp: string;
  durationMs: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'vichhai' | 'system';
  timestamp: string;
  content: string;
  agentSteps?: AgentStep[];
  attachedData?: {
    type: 'ALERT' | 'INCIDENT' | 'IOC' | 'PROCESS_TREE' | 'APPROVAL_CARD' | 'REPORT' | 'THEHIVE_CASE';
    payload: any;
  };
}
