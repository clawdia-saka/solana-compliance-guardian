import { AuditResult } from './types';

// Mock API - Replace with actual API calls
const mockAudits: AuditResult[] = [
  {
    id: '1',
    tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenName: 'Safe Token',
    tokenSymbol: 'SAFE',
    status: 'complete',
    riskScore: 25,
    riskLevel: 'low',
    compliance: {
      category: 'Compliant',
      confidence: 0.95,
      reasoning: 'Token follows standard ERC-20 implementation with no suspicious patterns detected.'
    },
    redFlags: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 86000000).toISOString(),
  },
  {
    id: '2',
    tokenAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    tokenName: 'Suspicious Token',
    tokenSymbol: 'SUS',
    status: 'complete',
    riskScore: 85,
    riskLevel: 'high',
    compliance: {
      category: 'High Risk',
      confidence: 0.89,
      reasoning: 'Multiple red flags detected including hidden minting functions and suspicious ownership transfers.'
    },
    redFlags: [
      {
        id: 'rf1',
        severity: 'high',
        category: 'Hidden Functions',
        description: 'Hidden mint function detected',
        details: 'Contract contains a mint function that is not visible in the standard interface.'
      },
      {
        id: 'rf2',
        severity: 'medium',
        category: 'Ownership',
        description: 'Centralized ownership',
        details: 'Single address has excessive control over contract functions.'
      }
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    completedAt: new Date(Date.now() - 172400000).toISOString(),
  }
];

export async function submitAudit(tokenAddress: string): Promise<AuditResult> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate BONK token audit results
  const newAudit: AuditResult = {
    id: Date.now().toString(),
    tokenAddress,
    tokenName: 'BONK',
    tokenSymbol: 'BONK',
    status: 'complete',
    riskScore: 55,
    riskLevel: 'medium',
    compliance: {
      category: 'Medium Risk - PSA Registration Recommended',
      confidence: 0.82,
      reasoning: 'Token exhibits characteristics requiring Payment Services Act consideration. Holder concentration and centralized control present regulatory compliance concerns.'
    },
    redFlags: [
      {
        id: 'rf1',
        severity: 'high',
        category: 'Holder Concentration',
        description: 'Top holder owns 35% of supply',
        details: 'Excessive concentration in single wallet creates market manipulation risk and raises concerns under PSA Article 2 regarding proper asset custody.'
      },
      {
        id: 'rf2',
        severity: 'medium',
        category: 'Centralized Authority',
        description: 'Single wallet controls upgrade authority',
        details: 'Upgrade authority concentrated in one address. Consider multi-signature governance per FIEA guidelines on operational transparency.'
      },
      {
        id: 'rf3',
        severity: 'low',
        category: 'Liquidity',
        description: 'Limited liquidity depth',
        details: 'Potential for price volatility. Recommend maintaining adequate market depth to meet PSA user protection standards.'
      }
    ],
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() + 2000).toISOString(),
  };
  
  mockAudits.unshift(newAudit);
  return newAudit;
}

export async function getAudit(id: string): Promise<AuditResult | null> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockAudits.find(audit => audit.id === id) || null;
}

export async function getAudits(): Promise<AuditResult[]> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockAudits];
}

export async function getAuditByAddress(address: string): Promise<AuditResult | null> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockAudits.find(audit => 
    audit.tokenAddress.toLowerCase() === address.toLowerCase()
  ) || null;
}
