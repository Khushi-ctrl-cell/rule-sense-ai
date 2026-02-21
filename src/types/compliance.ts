export interface ComplianceRule {
  rule_id: string;
  rule_name: string;
  description: string;
  required_fields: string[];
  condition_logic: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  monitoring_frequency: 'real-time' | 'daily' | 'monthly';
  category: string;
  regulatory_ref: string;
  version: string;
  last_updated: string;
  updated_by: string;
  enabled: boolean;
  false_positive_rate?: number;
  threshold_value?: number;
}

export interface Transaction {
  id: string;
  timestamp: string;
  from_account: string;
  to_account: string;
  amount: number;
  currency: string;
  transaction_type: string;
  is_laundering: boolean;
  from_country: string;
  to_country: string;
  payment_format: string;
  risk_score?: number;
}

export interface Violation {
  id: string;
  record_id: string;
  rule_id: string;
  rule_name: string;
  field_values: Record<string, string | number>;
  reason: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  timestamp: string;
  status: 'Open' | 'Reviewed' | 'Escalated' | 'Resolved' | 'False Positive';
  reviewer?: string;
  remediation?: string;
  estimated_exposure?: number;
  regulatory_ref?: string;
}

export interface AccountRisk {
  account_id: string;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  violation_count: number;
  high_severity_count: number;
  repeat_violations: number;
  risky_geography: boolean;
  structuring_detected: boolean;
  last_scan: string;
  trend: 'up' | 'down' | 'stable';
}

export interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  category: string;
}

export interface ScanResult {
  scan_id: string;
  timestamp: string;
  records_scanned: number;
  violations_found: number;
  compliance_score: number;
  high_risk_accounts: number;
  scan_duration_ms: number;
  rules_applied: number;
}

export interface RuleVersion {
  version: string;
  changed_by: string;
  timestamp: string;
  change_description: string;
  previous_threshold?: number;
  new_threshold?: number;
}
