import { describe, it, expect } from 'vitest';

// Rule engine logic (inline for testing)
function evaluateLargeTransaction(amount: number | null | undefined): boolean {
  if (amount == null || typeof amount !== 'number' || isNaN(amount)) return false;
  return amount > 10000;
}

function evaluateCrossBorder(amount: number, fromCountry: string, toCountry: string): boolean {
  if (amount == null || !fromCountry || !toCountry) return false;
  return amount > 5000 && fromCountry !== toCountry;
}

function evaluateHighRiskJurisdiction(fromCountry: string, toCountry: string): boolean {
  const highRisk = ['IR', 'RU', 'NG', 'PK'];
  return highRisk.includes(fromCountry) || highRisk.includes(toCountry);
}

function detectStructuring(transactions: { amount: number; timestamp: string; from_account: string }[], accountId: string): boolean {
  const accountTxns = transactions.filter(t => t.from_account === accountId);
  const now = Date.now();
  const last24h = accountTxns.filter(t => now - new Date(t.timestamp).getTime() < 86400000);
  const allBelow = last24h.every(t => t.amount < 10000);
  const totalAbove = last24h.reduce((s, t) => s + t.amount, 0) > 10000;
  return allBelow && totalAbove && last24h.length >= 3;
}

function calculateRiskScore(violations: { severity: string }[], riskyGeo: boolean, structuring: boolean): number {
  let score = 0;
  violations.forEach(v => {
    if (v.severity === 'Critical') score += 30;
    else if (v.severity === 'High') score += 20;
    else if (v.severity === 'Medium') score += 15;
    else score += 5;
  });
  if (riskyGeo) score += 20;
  if (structuring) score += 25;
  return Math.min(100, score);
}

function resolveConflict(ruleA: { priority: number; action: 'flag' | 'suppress' }, ruleB: { priority: number; action: 'flag' | 'suppress' }): 'flag' | 'suppress' {
  return ruleA.priority >= ruleB.priority ? ruleA.action : ruleB.action;
}

describe('Rule Engine — Large Transaction (AML_001)', () => {
  it('flags transactions over $10,000', () => {
    expect(evaluateLargeTransaction(15000)).toBe(true);
    expect(evaluateLargeTransaction(50000)).toBe(true);
  });

  it('passes transactions under $10,000', () => {
    expect(evaluateLargeTransaction(3000)).toBe(false);
    expect(evaluateLargeTransaction(9999)).toBe(false);
  });

  it('handles null/undefined amount gracefully', () => {
    expect(evaluateLargeTransaction(null)).toBe(false);
    expect(evaluateLargeTransaction(undefined)).toBe(false);
    expect(evaluateLargeTransaction(NaN)).toBe(false);
  });
});

describe('Rule Engine — Cross-Border (AML_003)', () => {
  it('flags cross-border over $5,000', () => {
    expect(evaluateCrossBorder(8000, 'US', 'CH')).toBe(true);
  });

  it('passes domestic transfers', () => {
    expect(evaluateCrossBorder(8000, 'US', 'US')).toBe(false);
  });
});

describe('Rule Engine — High-Risk Jurisdiction (AML_007)', () => {
  it('flags high-risk countries', () => {
    expect(evaluateHighRiskJurisdiction('US', 'IR')).toBe(true);
    expect(evaluateHighRiskJurisdiction('RU', 'DE')).toBe(true);
  });

  it('passes safe jurisdictions', () => {
    expect(evaluateHighRiskJurisdiction('US', 'UK')).toBe(false);
  });
});

describe('Rule Engine — Structuring Detection (AML_002)', () => {
  it('detects structuring pattern', () => {
    const now = new Date().toISOString();
    const txns = [
      { amount: 9800, timestamp: now, from_account: 'ACC-001' },
      { amount: 9700, timestamp: now, from_account: 'ACC-001' },
      { amount: 9600, timestamp: now, from_account: 'ACC-001' },
    ];
    expect(detectStructuring(txns, 'ACC-001')).toBe(true);
  });

  it('ignores legitimate transactions', () => {
    const now = new Date().toISOString();
    const txns = [
      { amount: 2000, timestamp: now, from_account: 'ACC-002' },
      { amount: 1500, timestamp: now, from_account: 'ACC-002' },
    ];
    expect(detectStructuring(txns, 'ACC-002')).toBe(false);
  });
});

describe('Risk Score Aggregation', () => {
  it('calculates composite risk score', () => {
    const score = calculateRiskScore(
      [{ severity: 'Critical' }, { severity: 'High' }],
      true, false
    );
    expect(score).toBe(70); // 30 + 20 + 20
  });

  it('caps at 100', () => {
    const score = calculateRiskScore(
      [{ severity: 'Critical' }, { severity: 'Critical' }, { severity: 'Critical' }, { severity: 'Critical' }],
      true, true
    );
    expect(score).toBe(100);
  });
});

describe('Conflict Resolution', () => {
  it('higher priority wins', () => {
    expect(resolveConflict(
      { priority: 8, action: 'suppress' },
      { priority: 5, action: 'flag' }
    )).toBe('suppress');
  });

  it('flag wins when higher priority', () => {
    expect(resolveConflict(
      { priority: 3, action: 'suppress' },
      { priority: 9, action: 'flag' }
    )).toBe('flag');
  });
});
