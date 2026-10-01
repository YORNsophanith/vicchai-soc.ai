import { Alert, Incident, CaseTheHive, SOARAction, ApprovalRequest, DetectionRule, SOCReport, AuditLog, Tenant, User, UserRole, IOC, ChatMessage } from '../types/soc';
import { mockAlerts, mockIncidents, mockTheHiveCases, mockSOARActions, mockApprovals, mockDetectionRules, mockReports, mockAuditLogs, mockTenants, mockUsers, mockIOCs } from '../data/mockData';

class SOCStore {
  private alerts: Alert[] = [];
  private incidents: Incident[] = [];
  private cases: CaseTheHive[] = [];
  private soarActions: SOARAction[] = [];
  private approvals: ApprovalRequest[] = [];
  private detectionRules: DetectionRule[] = [];
  private reports: SOCReport[] = [];
  private auditLogs: AuditLog[] = [];
  private tenants: Tenant[] = [];
  private users: User[] = [];
  private iocs: IOC[] = [];
  private activeTenantId: string = 'tenant-alpha';
  private currentUser: User = mockUsers[0];
  private isUserAuthenticated: boolean = true;
  private chatMessages: ChatMessage[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.init();
  }

  private init() {
    this.alerts = [...mockAlerts];
    this.incidents = [...mockIncidents];
    this.cases = [...mockTheHiveCases];
    this.soarActions = [...mockSOARActions];
    this.approvals = [...mockApprovals];
    this.detectionRules = [...mockDetectionRules];
    this.reports = [...mockReports];
    this.auditLogs = [...mockAuditLogs];
    this.tenants = [...mockTenants];
    this.users = [...mockUsers];
    this.iocs = [...mockIOCs];
    this.currentUser = mockUsers[0];
    this.isUserAuthenticated = true;

    // Seed initial welcome message from Vichhai AI
    this.chatMessages = [
      {
        id: 'msg-welcome',
        sender: 'vichhai',
        timestamp: '07:14:00',
        content: `👋 **Welcome Sophanith (Super Admin)!** I am Vichhai AI, your autonomous SOC Agentic AI orchestrator.\n\nYou have **Root Super Administrator** privileges across all tenants, integrations, CTI feeds, and SOAR response playbooks.\n\n🚨 **Immediate Alert:** Multi-stage intrusion on endpoint **\`PC-NITH\` (192.168.10.45)**. An obfuscated PowerShell payload connected to Cobalt Strike C2 (\`185.220.101.5\`) and attempted LSASS memory dumping.\n\nHow would you like to proceed?`,
      },
    ];
  }

  public isAuthenticated(): boolean {
    return this.isUserAuthenticated;
  }

  public login(username: string, password?: string): { success: boolean; message?: string } {
    const user = this.users.find(
      u => u.username.toLowerCase() === username.toLowerCase().trim() ||
           u.name.toLowerCase().includes(username.toLowerCase().trim())
    );

    if (user) {
      if (password && user.password && user.password !== password) {
        return { success: false, message: 'Invalid password. Try Admin@2026! or click Quick Login.' };
      }
      this.currentUser = user;
      this.isUserAuthenticated = true;
      this.addAuditLog('USER_LOGIN', 'AUTH', `User ${user.name} logged in with ${user.role} role.`);
      this.notify();
      return { success: true };
    }

    return { success: false, message: 'User not found. Use Sophanith (Super Admin) or select a demo profile.' };
  }

  public logout(): void {
    this.addAuditLog('USER_LOGOUT', 'AUTH', `User ${this.currentUser.name} logged out.`);
    this.isUserAuthenticated = false;
    this.notify();
  }

  public getUsers(): User[] {
    return this.users;
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // Tenant & User
  public getActiveTenant(): Tenant {
    return this.tenants.find(t => t.id === this.activeTenantId) || this.tenants[0];
  }

  public getTenants(): Tenant[] {
    return this.tenants;
  }

  public setActiveTenant(tenantId: string) {
    this.activeTenantId = tenantId;
    this.addAuditLog('SWITCHED_TENANT', 'AUTH', `Switched active tenant view to ${this.getActiveTenant().name}`);
    this.notify();
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public setCurrentUserRole(role: UserRole) {
    this.currentUser = { ...this.currentUser, role };
    this.addAuditLog('ROLE_SWITCH', 'AUTH', `User switched active role to ${role}`);
    this.notify();
  }

  // Alerts
  public getAlerts(): Alert[] {
    return this.alerts.filter(a => a.tenantId === this.activeTenantId);
  }

  public getAllAlerts(): Alert[] {
    return this.alerts;
  }

  public getAlertById(id: string): Alert | undefined {
    return this.alerts.find(a => a.id === id);
  }

  public addAlert(alert: Alert) {
    this.alerts = [alert, ...this.alerts];
    this.notify();
  }

  public updateAlertStatus(id: string, status: Alert['status']) {
    this.alerts = this.alerts.map(a => a.id === id ? { ...a, status } : a);
    this.addAuditLog('UPDATE_ALERT_STATUS', 'INVESTIGATION', `Updated alert ${id} status to ${status}`);
    this.notify();
  }

  // Incidents
  public getIncidents(): Incident[] {
    return this.incidents.filter(i => i.tenantId === this.activeTenantId);
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find(i => i.id === id);
  }

  public addIncident(incident: Incident) {
    this.incidents = [incident, ...this.incidents];
    this.notify();
  }

  public updateIncidentStatus(id: string, status: Incident['status']) {
    this.incidents = this.incidents.map(i => i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i);
    this.addAuditLog('UPDATE_INCIDENT_STATUS', 'INVESTIGATION', `Updated incident ${id} status to ${status}`);
    this.notify();
  }

  public addAnalystNote(incidentId: string, noteText: string, noteType: 'NOTE' | 'HYPOTHESIS' | 'FINDING' | 'AI_GENERATED' = 'NOTE') {
    const newNote = {
      id: `note-${Date.now()}`,
      author: this.currentUser.name,
      role: this.currentUser.role,
      timestamp: new Date().toLocaleTimeString(),
      content: noteText,
      type: noteType,
    };
    this.incidents = this.incidents.map(i => {
      if (i.id === incidentId) {
        return { ...i, notes: [...i.notes, newNote], updatedAt: new Date().toISOString() };
      }
      return i;
    });
    this.addAuditLog('ADD_ANALYST_NOTE', 'INVESTIGATION', `Added ${noteType} to incident ${incidentId}`);
    this.notify();
  }

  // IOCs
  public getIOCs(): IOC[] {
    return this.iocs;
  }

  public addIOC(ioc: IOC) {
    if (!this.iocs.some(i => i.value.toLowerCase() === ioc.value.toLowerCase())) {
      this.iocs = [ioc, ...this.iocs];
      this.notify();
    }
  }

  // TheHive Cases
  public getCases(): CaseTheHive[] {
    return this.cases.filter(c => c.tenantId === this.activeTenantId);
  }

  public createCase(newCase: Partial<CaseTheHive>): CaseTheHive {
    const fullCase: CaseTheHive = {
      id: `THEHIVE-CASE-${Math.floor(400 + Math.random() * 500)}`,
      caseNumber: Math.floor(400 + Math.random() * 500),
      tenantId: this.activeTenantId,
      incidentId: newCase.incidentId || 'INC-MANUAL-01',
      title: newCase.title || 'Untitled Case',
      description: newCase.description || 'Generated by Vichhai AI',
      severity: newCase.severity || 'HIGH',
      tlp: newCase.tlp || 'TLP:AMBER',
      pap: newCase.pap || 'PAP:AMBER',
      status: 'Open',
      assignee: this.currentUser.email,
      tags: newCase.tags || ['vichhai-ai'],
      observablesCount: newCase.observables?.length || 0,
      tasksCount: newCase.tasks?.length || 2,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      tasks: newCase.tasks || [
        { id: `tsk-${Date.now()}-1`, title: 'Verify OpenCTI reputation', status: 'Completed', assignee: 'Vichhai AI' },
        { id: `tsk-${Date.now()}-2`, title: 'Execute containment playbook', status: 'InProgress', assignee: this.currentUser.name },
      ],
      observables: newCase.observables || [],
    };
    this.cases = [fullCase, ...this.cases];
    this.addAuditLog('CREATED_THEHIVE_CASE', 'CASE_MGMT', `Created TheHive case ${fullCase.id}: ${fullCase.title}`);
    this.notify();
    return fullCase;
  }

  public updateCaseStatus(id: string, status: CaseTheHive['status']) {
    this.cases = this.cases.map(c => c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c);
    this.addAuditLog('UPDATED_THEHIVE_CASE', 'CASE_MGMT', `Updated TheHive case ${id} status to ${status}`);
    this.notify();
  }

  // SOAR Actions & Approvals
  public getSOARActions(): SOARAction[] {
    return this.soarActions;
  }

  public getApprovals(): ApprovalRequest[] {
    return this.approvals.filter(a => a.tenantId === this.activeTenantId);
  }

  public approveAction(approvalId: string, analystNotes: string = 'Approved following IOC confirmation') {
    const approval = this.approvals.find(a => a.id === approvalId);
    if (!approval) return;

    this.approvals = this.approvals.map(a => 
      a.id === approvalId 
        ? { ...a, status: 'APPROVED', respondedAt: new Date().toLocaleTimeString(), respondedBy: this.currentUser.name, decisionNotes: analystNotes } 
        : a
    );

    // Update corresponding SOAR action to EXECUTING -> COMPLETED
    if (approval.actionId) {
      this.soarActions = this.soarActions.map(act => {
        if (act.id === approval.actionId) {
          return {
            ...act,
            status: 'COMPLETED',
            executedAt: new Date().toLocaleTimeString(),
            executionLogs: [
              ...(act.executionLogs || []),
              `[${new Date().toLocaleTimeString()}] Human Approval granted by ${this.currentUser.name} (${this.currentUser.role}).`,
              `[${new Date().toLocaleTimeString()}] Dispatching execution signal to Shuffle SOAR API.`,
              `[${new Date().toLocaleTimeString()}] Action SUCCESS: Endpoint/Firewall containment applied.`,
            ],
          };
        }
        return act;
      });
    }

    // Update incident status to CONTAINMENT
    if (approval.incidentId) {
      this.updateIncidentStatus(approval.incidentId, 'CONTAINMENT');
      this.addAnalystNote(approval.incidentId, `Action Approved & Executed: ${approval.title}. Response applied successfully via Shuffle.`, 'FINDING');
    }

    this.addAuditLog('APPROVED_SOAR_ACTION', 'APPROVAL', `Approved: ${approval.title} for ${approval.targetAssetOrUser}`);
    this.notify();
  }

  public rejectAction(approvalId: string, reason: string = 'Rejected by SOC Lead due to business continuity priority') {
    const approval = this.approvals.find(a => a.id === approvalId);
    if (!approval) return;

    this.approvals = this.approvals.map(a => 
      a.id === approvalId 
        ? { ...a, status: 'REJECTED', respondedAt: new Date().toLocaleTimeString(), respondedBy: this.currentUser.name, decisionNotes: reason } 
        : a
    );

    if (approval.actionId) {
      this.soarActions = this.soarActions.map(act => {
        if (act.id === approval.actionId) {
          return {
            ...act,
            status: 'REJECTED',
            executionLogs: [
              ...(act.executionLogs || []),
              `[${new Date().toLocaleTimeString()}] Human Approval REJECTED by ${this.currentUser.name}: ${reason}`,
            ],
          };
        }
        return act;
      });
    }

    if (approval.incidentId) {
      this.addAnalystNote(approval.incidentId, `Action REJECTED: ${approval.title}. Reason: ${reason}`, 'NOTE');
    }

    this.addAuditLog('REJECTED_SOAR_ACTION', 'APPROVAL', `Rejected: ${approval.title}`);
    this.notify();
  }

  // Detection Rules
  public getDetectionRules(): DetectionRule[] {
    return this.detectionRules;
  }

  public toggleDetectionRule(ruleId: string) {
    this.detectionRules = this.detectionRules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
    this.notify();
  }

  // Reports
  public getReports(): SOCReport[] {
    return this.reports.filter(r => r.tenantId === this.activeTenantId);
  }

  public addReport(report: SOCReport) {
    this.reports = [report, ...this.reports];
    this.addAuditLog('GENERATED_SOC_REPORT', 'CONFIG', `Generated ${report.type} report: ${report.title}`);
    this.notify();
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs.filter(a => a.tenantId === this.activeTenantId);
  }

  public addAuditLog(action: string, category: AuditLog['category'], details: string, status: AuditLog['status'] = 'SUCCESS') {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      tenantId: this.activeTenantId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: this.currentUser.name,
      role: this.currentUser.role,
      action,
      category,
      details,
      status,
      ipAddress: '192.168.10.88',
    };
    this.auditLogs = [newLog, ...this.auditLogs];
    this.notify();
  }

  // Chat Messages
  public getChatMessages(): ChatMessage[] {
    return this.chatMessages;
  }

  public addChatMessage(msg: ChatMessage) {
    this.chatMessages = [...this.chatMessages, msg];
    this.notify();
  }

  public resetDemoData() {
    this.init();
    this.notify();
  }
}

export const socStore = new SOCStore();
