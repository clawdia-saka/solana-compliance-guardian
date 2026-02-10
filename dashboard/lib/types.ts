export type AuditStatus = 'pending' | 'complete' | 'failed';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RedFlag {
  id: string;
  severity: RiskLevel;
  category: string;
  description: string;
  details?: string;
}

export interface ComplianceClassification {
  category: string;
  confidence: number;
  reasoning: string;
}

export interface AuditResult {
  id: string;
  tokenAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  status: AuditStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  compliance: ComplianceClassification;
  redFlags: RedFlag[];
  createdAt: string;
  completedAt?: string;
}
