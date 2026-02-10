/**
 * Type Definitions for Agent Auditor
 * Colosseum Compliance Guardian - Japan Regulatory Compliance Checker
 */

export interface TokenData {
  address: string;
  name?: string;
  symbol?: string;
  supply: number;
  decimals: number;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  holders: HolderData[];
  metadata?: {
    uri?: string;
    [key: string]: any;
  };
}

export interface HolderData {
  address: string;
  balance: number;
  percentage: number;
}

export interface RiskFactors {
  centralizedOwnership: {
    score: number; // 0-100
    details: string;
    topHolderPercentage: number;
    top10HolderPercentage: number;
  };
  authorityRisk: {
    score: number; // 0-100
    details: string;
    hasMintAuthority: boolean;
    hasFreezeAuthority: boolean;
  };
  whaleConcentration: {
    score: number; // 0-100
    details: string;
    whaleCount: number;
    whalePercentage: number;
  };
  liquidityRisk: {
    score: number; // 0-100
    details: string;
  };
}

export interface ToriiApiRequest {
  tokenAddress: string;
  classification: TokenClassification;
  supply: number;
  holderCount: number;
}

export interface ToriiApiResponse {
  compliant: boolean;
  classification: string;
  warnings: string[];
  recommendations: string[];
  regulatoryNotes?: string;
}

export enum TokenClassification {
  PAYMENT_TOKEN = 'payment_token',
  UTILITY_TOKEN = 'utility_token',
  SECURITY_TOKEN = 'security_token',
  GOVERNANCE_TOKEN = 'governance_token',
  UNKNOWN = 'unknown'
}

export interface AuditReport {
  tokenAddress: string;
  tokenName?: string;
  tokenSymbol?: string;
  timestamp: number;
  overallRiskScore: number; // 0-100 (0 = safe, 100 = maximum risk)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  japanCompliance: {
    classification: TokenClassification;
    compliant: boolean;
    regulatoryStatus: string;
  };
  riskFactors: RiskFactors;
  redFlags: RedFlag[];
  recommendations: string[];
  toriiApiResponse?: ToriiApiResponse;
  nextAuditSchedule?: number;
}

export interface RedFlag {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  description: string;
  impact: string;
}

export interface AuditJobData {
  tokenAddress: string;
  priority?: number;
  retryCount?: number;
  scheduledAudit?: boolean;
}

export interface AuditJobResult {
  success: boolean;
  report?: AuditReport;
  error?: string;
  retryable?: boolean;
}

export interface QueueConfig {
  redis: {
    host: string;
    port: number;
  };
  retryAttempts: number;
  retryDelay: number; // milliseconds
  backoff: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
}

export interface ScheduledAuditConfig {
  tokenAddress: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  priority?: number;
  enabled: boolean;
}
