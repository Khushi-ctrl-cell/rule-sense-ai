import { ComplianceRule, Transaction, Violation, AccountRisk, AuditEntry, ScanResult } from '@/types/compliance';

export const mockRules: ComplianceRule[] = [
  {
    rule_id: 'AML_001', rule_name: 'Large Transaction Threshold', description: 'Flag any single transaction exceeding $10,000',
    required_fields: ['amount'], condition_logic: 'amount > 10000', severity: 'High', monitoring_frequency: 'real-time',
    category: 'Transaction Monitoring', regulatory_ref: 'FATF Rec. 10', version: 'v1.3', last_updated: '2025-12-01',
    updated_by: 'Compliance Officer', enabled: true, false_positive_rate: 12, threshold_value: 10000,
  },
  {
    rule_id: 'AML_002', rule_name: 'Structuring Detection', description: 'Detect multiple transactions just below threshold within 24h',
    required_fields: ['amount', 'timestamp', 'from_account'], condition_logic: 'SUM(amount) WHERE from_account=X AND last_24h > 10000 AND each < 10000',
    severity: 'Critical', monitoring_frequency: 'real-time', category: 'Pattern Detection',
    regulatory_ref: 'FATF Rec. 20, RBI AML 2023 §4.2', version: 'v2.1', last_updated: '2025-11-15',
    updated_by: 'Senior Analyst', enabled: true, false_positive_rate: 8, threshold_value: 10000,
  },
  {
    rule_id: 'AML_003', rule_name: 'Cross-Border High Value', description: 'Flag cross-border transactions over $5,000',
    required_fields: ['amount', 'from_country', 'to_country'], condition_logic: 'amount > 5000 AND from_country != to_country',
    severity: 'Medium', monitoring_frequency: 'real-time', category: 'Transaction Monitoring',
    regulatory_ref: 'FATF Rec. 16', version: 'v1.0', last_updated: '2025-10-20',
    updated_by: 'Compliance Officer', enabled: true, false_positive_rate: 22, threshold_value: 5000,
  },
  {
    rule_id: 'AML_004', rule_name: 'Rapid Transaction Velocity', description: 'More than 10 transactions from single account in 1 hour',
    required_fields: ['from_account', 'timestamp'], condition_logic: 'COUNT(txn) WHERE from_account=X AND last_1h > 10',
    severity: 'High', monitoring_frequency: 'real-time', category: 'Behavioral Analysis',
    regulatory_ref: 'Basel III §7.3', version: 'v1.1', last_updated: '2025-09-10',
    updated_by: 'Risk Manager', enabled: true, false_positive_rate: 15, threshold_value: 10,
  },
  {
    rule_id: 'AML_005', rule_name: 'Circular Transfer Detection', description: 'Detect funds returning to origin account through intermediaries',
    required_fields: ['from_account', 'to_account'], condition_logic: 'GRAPH_CYCLE(from_account, to_account, depth=3)',
    severity: 'Critical', monitoring_frequency: 'daily', category: 'Network Analysis',
    regulatory_ref: 'FATF Rec. 10, 20', version: 'v1.0', last_updated: '2025-08-05',
    updated_by: 'Senior Analyst', enabled: true, false_positive_rate: 5,
  },
  {
    rule_id: 'AML_006', rule_name: 'Dormant Account Activity', description: 'Activity on accounts inactive for 180+ days',
    required_fields: ['from_account', 'timestamp'], condition_logic: 'last_activity_days > 180',
    severity: 'Medium', monitoring_frequency: 'daily', category: 'Behavioral Analysis',
    regulatory_ref: 'RBI KYC 2023 §6.1', version: 'v1.2', last_updated: '2025-07-12',
    updated_by: 'Compliance Officer', enabled: true, false_positive_rate: 30, threshold_value: 180,
  },
  {
    rule_id: 'AML_007', rule_name: 'High-Risk Jurisdiction', description: 'Transactions involving FATF grey/black listed countries',
    required_fields: ['from_country', 'to_country'], condition_logic: 'from_country IN high_risk_list OR to_country IN high_risk_list',
    severity: 'High', monitoring_frequency: 'real-time', category: 'Geographic Risk',
    regulatory_ref: 'FATF Country List 2025', version: 'v3.0', last_updated: '2025-12-15',
    updated_by: 'Risk Manager', enabled: true, false_positive_rate: 10,
  },
  {
    rule_id: 'AML_008', rule_name: 'Cash-Heavy Business Pattern', description: 'Detect accounts with >80% cash transactions',
    required_fields: ['transaction_type', 'from_account'], condition_logic: 'cash_ratio(from_account) > 0.8',
    severity: 'Medium', monitoring_frequency: 'monthly', category: 'Pattern Detection',
    regulatory_ref: 'FATF Rec. 22', version: 'v1.0', last_updated: '2025-06-01',
    updated_by: 'Compliance Officer', enabled: false, false_positive_rate: 35, threshold_value: 80,
  },
];

const countries = ['US', 'UK', 'IN', 'DE', 'CN', 'RU', 'AE', 'SG', 'CH', 'NG', 'BR', 'JP', 'KR', 'PK', 'IR'];
const paymentFormats = ['Wire', 'ACH', 'SWIFT', 'RTGS', 'Cash', 'Crypto', 'Check'];
const txnTypes = ['Transfer', 'Deposit', 'Withdrawal', 'Payment', 'Exchange'];

function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomBetween(min: number, max: number) { return Math.floor(Math.random() * (max - min) + min); }
function randomId() { return 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(); }
function randomAccountId() { return 'ACC-' + randomBetween(1000, 9999); }

function generateTransactions(count: number): Transaction[] {
  const txns: Transaction[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const isLaundering = Math.random() < 0.12;
    const amount = isLaundering
      ? (Math.random() < 0.5 ? randomBetween(8000, 9999) : randomBetween(15000, 500000))
      : randomBetween(50, 25000);
    const daysAgo = randomBetween(0, 90);
    const date = new Date(now.getTime() - daysAgo * 86400000 - randomBetween(0, 86400000));
    txns.push({
      id: randomId(),
      timestamp: date.toISOString(),
      from_account: randomAccountId(),
      to_account: randomAccountId(),
      amount,
      currency: 'USD',
      transaction_type: randomFrom(txnTypes),
      is_laundering: isLaundering,
      from_country: randomFrom(countries),
      to_country: randomFrom(countries),
      payment_format: randomFrom(paymentFormats),
      risk_score: isLaundering ? randomBetween(55, 98) : randomBetween(5, 50),
    });
  }
  return txns.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const mockTransactions = generateTransactions(500);

function generateViolations(): Violation[] {
  const violations: Violation[] = [];
  const statuses: Violation['status'][] = ['Open', 'Reviewed', 'Escalated', 'Resolved', 'False Positive'];
  let idx = 0;
  mockTransactions.forEach(txn => {
    if (txn.amount > 10000) {
      violations.push({
        id: `VIO-${String(++idx).padStart(4, '0')}`, record_id: txn.id, rule_id: 'AML_001',
        rule_name: 'Large Transaction Threshold',
        field_values: { amount: txn.amount, from_account: txn.from_account },
        reason: `Transaction amount $${txn.amount.toLocaleString()} exceeds $10,000 threshold`,
        severity: txn.amount > 50000 ? 'Critical' : 'High', confidence: randomBetween(75, 99),
        timestamp: txn.timestamp, status: randomFrom(statuses),
        estimated_exposure: txn.amount, regulatory_ref: 'FATF Rec. 10',
      });
    }
    if (txn.amount > 5000 && txn.from_country !== txn.to_country) {
      violations.push({
        id: `VIO-${String(++idx).padStart(4, '0')}`, record_id: txn.id, rule_id: 'AML_003',
        rule_name: 'Cross-Border High Value',
        field_values: { amount: txn.amount, from_country: txn.from_country, to_country: txn.to_country },
        reason: `Cross-border transaction $${txn.amount.toLocaleString()} from ${txn.from_country} to ${txn.to_country}`,
        severity: 'Medium', confidence: randomBetween(60, 90),
        timestamp: txn.timestamp, status: randomFrom(statuses),
        estimated_exposure: txn.amount * 0.3, regulatory_ref: 'FATF Rec. 16',
      });
    }
    if (['IR', 'RU', 'NG', 'PK'].includes(txn.to_country) || ['IR', 'RU', 'NG', 'PK'].includes(txn.from_country)) {
      violations.push({
        id: `VIO-${String(++idx).padStart(4, '0')}`, record_id: txn.id, rule_id: 'AML_007',
        rule_name: 'High-Risk Jurisdiction',
        field_values: { from_country: txn.from_country, to_country: txn.to_country, amount: txn.amount },
        reason: `Transaction involves high-risk jurisdiction (${txn.from_country} → ${txn.to_country})`,
        severity: 'High', confidence: randomBetween(80, 95),
        timestamp: txn.timestamp, status: randomFrom(statuses),
        regulatory_ref: 'FATF Country List 2025',
      });
    }
  });
  return violations.slice(0, 200);
}

export const mockViolations = generateViolations();

function generateAccountRisks(): AccountRisk[] {
  const accountSet = new Set<string>();
  mockTransactions.forEach(t => { accountSet.add(t.from_account); accountSet.add(t.to_account); });
  const accounts = Array.from(accountSet).slice(0, 60);
  return accounts.map(acc => {
    const vCount = mockViolations.filter(v => v.field_values.from_account === acc).length;
    const score = Math.min(100, vCount * 12 + randomBetween(0, 30));
    const level: AccountRisk['risk_level'] = score > 80 ? 'Critical' : score > 60 ? 'High' : score > 30 ? 'Medium' : 'Low';
    return {
      account_id: acc, risk_score: score, risk_level: level,
      violation_count: vCount, high_severity_count: Math.floor(vCount * 0.4),
      repeat_violations: Math.floor(vCount * 0.3), risky_geography: Math.random() < 0.25,
      structuring_detected: Math.random() < 0.1,
      last_scan: new Date().toISOString(), trend: randomFrom(['up', 'down', 'stable'] as const),
    };
  });
}

export const mockAccountRisks = generateAccountRisks();

export const mockScanResults: ScanResult[] = [
  { scan_id: 'SCN-001', timestamp: '2026-02-21T10:00:00Z', records_scanned: 500, violations_found: mockViolations.length, compliance_score: 73, high_risk_accounts: mockAccountRisks.filter(a => a.risk_level === 'Critical' || a.risk_level === 'High').length, scan_duration_ms: 2340, rules_applied: 8 },
  { scan_id: 'SCN-002', timestamp: '2026-02-20T10:00:00Z', records_scanned: 480, violations_found: 156, compliance_score: 76, high_risk_accounts: 9, scan_duration_ms: 2100, rules_applied: 8 },
  { scan_id: 'SCN-003', timestamp: '2026-02-19T10:00:00Z', records_scanned: 465, violations_found: 142, compliance_score: 78, high_risk_accounts: 7, scan_duration_ms: 1980, rules_applied: 7 },
];

export const mockAuditLog: AuditEntry[] = [
  { id: 'AUD-001', action: 'Rule Updated', user: 'Compliance Officer', timestamp: '2026-02-21T09:30:00Z', details: 'AML_001 threshold changed from $8,000 to $10,000', category: 'Rule Change' },
  { id: 'AUD-002', action: 'Scan Completed', user: 'System', timestamp: '2026-02-21T10:00:00Z', details: `Full scan: ${mockViolations.length} violations detected`, category: 'Scan' },
  { id: 'AUD-003', action: 'Violation Reviewed', user: 'Senior Analyst', timestamp: '2026-02-21T10:15:00Z', details: 'VIO-0012 marked as True Positive', category: 'Review' },
  { id: 'AUD-004', action: 'Rule Created', user: 'Risk Manager', timestamp: '2026-02-20T14:00:00Z', details: 'AML_007 High-Risk Jurisdiction rule added', category: 'Rule Change' },
  { id: 'AUD-005', action: 'Account Escalated', user: 'Compliance Officer', timestamp: '2026-02-20T16:30:00Z', details: 'ACC-4521 escalated to senior review', category: 'Escalation' },
  { id: 'AUD-006', action: 'Policy Uploaded', user: 'Admin', timestamp: '2026-02-19T09:00:00Z', details: 'AML Policy v3.2 uploaded and parsed', category: 'Policy' },
  { id: 'AUD-007', action: 'Violation Resolved', user: 'Senior Analyst', timestamp: '2026-02-19T11:00:00Z', details: 'VIO-0005 resolved after manual review', category: 'Review' },
  { id: 'AUD-008', action: 'System Alert', user: 'System', timestamp: '2026-02-18T22:00:00Z', details: 'Structuring pattern detected for ACC-3847', category: 'Alert' },
];

export function getSeverityColor(severity: string) {
  switch (severity) {
    case 'Critical': return 'text-critical';
    case 'High': return 'text-destructive';
    case 'Medium': return 'text-warning';
    case 'Low': return 'text-primary';
    default: return 'text-muted-foreground';
  }
}

export function getSeverityBg(severity: string) {
  switch (severity) {
    case 'Critical': return 'bg-critical/15 text-critical border-critical/30';
    case 'High': return 'bg-destructive/15 text-destructive border-destructive/30';
    case 'Medium': return 'bg-warning/15 text-warning border-warning/30';
    case 'Low': return 'bg-primary/15 text-primary border-primary/30';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function getStatusBg(status: string) {
  switch (status) {
    case 'Open': return 'bg-warning/15 text-warning border-warning/30';
    case 'Reviewed': return 'bg-accent/15 text-accent border-accent/30';
    case 'Escalated': return 'bg-destructive/15 text-destructive border-destructive/30';
    case 'Resolved': return 'bg-primary/15 text-primary border-primary/30';
    case 'False Positive': return 'bg-muted text-muted-foreground border-border';
    default: return 'bg-muted text-muted-foreground';
  }
}
