/**
 * Main Auditor Logic
 * Orchestrates the autonomous compliance audit process
 */

import axios, { AxiosError } from 'axios';
import { RiskScorer } from './risk-scorer.js';
import {
  TokenData,
  AuditReport,
  RiskFactors,
  ToriiApiRequest,
  ToriiApiResponse,
  TokenClassification,
  AuditJobResult
} from './types.js';

export class ComplianceAuditor {
  private riskScorer: RiskScorer;
  private toriiApiUrl: string;

  constructor(toriiApiUrl: string = 'http://localhost:3000/api/check') {
    this.riskScorer = new RiskScorer();
    this.toriiApiUrl = toriiApiUrl;
  }

  /**
   * Main audit function - analyzes token and generates comprehensive report
   */
  public async auditToken(tokenData: TokenData): Promise<AuditJobResult> {
    try {
      console.log(`🔍 Starting audit for token: ${tokenData.address}`);
      
      // Step 1: Analyze risk factors
      const riskFactors = this.analyzeRiskFactors(tokenData);
      
      // Step 2: Calculate overall risk score
      const overallRiskScore = this.riskScorer.calculateOverallRisk(riskFactors);
      const riskLevel = this.riskScorer.getRiskLevel(overallRiskScore);
      
      // Step 3: Identify red flags
      const redFlags = this.riskScorer.identifyRedFlags(riskFactors, tokenData);
      
      // Step 4: Infer token classification
      const classification = this.riskScorer.inferTokenClassification(tokenData, riskFactors);
      
      // Step 5: Call Torii API for Japan compliance check
      let toriiResponse: ToriiApiResponse | undefined;
      try {
        toriiResponse = await this.checkToriiCompliance(tokenData, classification);
      } catch (error) {
        console.warn('⚠️ Torii API check failed, continuing without it:', error instanceof Error ? error.message : 'Unknown error');
      }
      
      // Step 6: Generate recommendations
      const recommendations = this.riskScorer.generateRecommendations(riskFactors, redFlags);
      
      // Step 7: Compile audit report
      const report: AuditReport = {
        tokenAddress: tokenData.address,
        tokenName: tokenData.name,
        tokenSymbol: tokenData.symbol,
        timestamp: Date.now(),
        overallRiskScore,
        riskLevel,
        japanCompliance: {
          classification,
          compliant: toriiResponse?.compliant ?? (overallRiskScore < 50),
          regulatoryStatus: this.getRegulatoryStatus(classification, overallRiskScore, toriiResponse)
        },
        riskFactors,
        redFlags,
        recommendations,
        toriiApiResponse: toriiResponse,
        nextAuditSchedule: this.calculateNextAuditTime(riskLevel)
      };

      console.log(`✅ Audit completed - Risk: ${riskLevel} (${overallRiskScore}/100)`);
      
      return {
        success: true,
        report
      };

    } catch (error) {
      console.error('❌ Audit failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: this.isRetryableError(error)
      };
    }
  }

  /**
   * Analyze all risk factors
   */
  private analyzeRiskFactors(tokenData: TokenData): RiskFactors {
    return {
      centralizedOwnership: this.riskScorer.analyzeCentralizedOwnership(tokenData),
      authorityRisk: this.riskScorer.analyzeAuthorityRisk(tokenData),
      whaleConcentration: this.riskScorer.analyzeWhaleConcentration(tokenData),
      liquidityRisk: this.riskScorer.analyzeLiquidityRisk(tokenData)
    };
  }

  /**
   * Call Torii API for Japan compliance check
   */
  private async checkToriiCompliance(
    tokenData: TokenData,
    classification: TokenClassification
  ): Promise<ToriiApiResponse> {
    const request: ToriiApiRequest = {
      tokenAddress: tokenData.address,
      classification,
      supply: tokenData.supply,
      holderCount: tokenData.holders.length
    };

    try {
      const response = await axios.post<ToriiApiResponse>(
        this.toriiApiUrl,
        request,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.code === 'ECONNREFUSED') {
          throw new Error('Torii API is not running. Start the API server first.');
        }
        if (axiosError.response?.status === 404) {
          throw new Error('Torii API endpoint not found. Check the API URL.');
        }
      }
      throw error;
    }
  }

  /**
   * Determine regulatory status for Japan
   */
  private getRegulatoryStatus(
    classification: TokenClassification,
    riskScore: number,
    toriiResponse?: ToriiApiResponse
  ): string {
    if (toriiResponse) {
      return toriiResponse.regulatoryNotes || 
             (toriiResponse.compliant ? 'Likely compliant with Japan PSA' : 'May require PSA/FIEA registration');
    }

    // Fallback logic if Torii API is unavailable
    switch (classification) {
      case TokenClassification.SECURITY_TOKEN:
        return 'Likely requires FIEA registration as security token';
      case TokenClassification.PAYMENT_TOKEN:
        return 'Requires PSA registration as crypto asset';
      case TokenClassification.UTILITY_TOKEN:
        return riskScore < 40 ? 'May qualify as utility token (PSA registration)' : 'Uncertain - consult legal counsel';
      case TokenClassification.GOVERNANCE_TOKEN:
        return 'Classification unclear - may be security or utility';
      default:
        return 'Classification unknown - legal review required';
    }
  }

  /**
   * Calculate next audit schedule based on risk level
   */
  private calculateNextAuditTime(riskLevel: string): number {
    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const ONE_WEEK = 7 * ONE_DAY;

    switch (riskLevel) {
      case 'CRITICAL':
        return now + ONE_DAY; // Re-audit daily
      case 'HIGH':
        return now + (3 * ONE_DAY); // Re-audit every 3 days
      case 'MEDIUM':
        return now + ONE_WEEK; // Re-audit weekly
      case 'LOW':
        return now + (4 * ONE_WEEK); // Re-audit monthly
      default:
        return now + ONE_WEEK;
    }
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // Retry on network errors or 5xx server errors
      return !axiosError.response || 
             (axiosError.response.status >= 500 && axiosError.response.status < 600) ||
             axiosError.code === 'ECONNREFUSED' ||
             axiosError.code === 'ETIMEDOUT';
    }
    return false;
  }

  /**
   * Format audit report as human-readable text
   */
  public formatReport(report: AuditReport): string {
    const lines: string[] = [];
    
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('🛡️  COMPLIANCE AUDIT REPORT');
    lines.push('═══════════════════════════════════════════════════════');
    lines.push('');
    lines.push(`Token: ${report.tokenSymbol || 'Unknown'} (${report.tokenName || 'N/A'})`);
    lines.push(`Address: ${report.tokenAddress}`);
    lines.push(`Audit Date: ${new Date(report.timestamp).toLocaleString()}`);
    lines.push('');
    lines.push('───────────────────────────────────────────────────────');
    lines.push('📊 RISK ASSESSMENT');
    lines.push('───────────────────────────────────────────────────────');
    lines.push(`Overall Risk Score: ${report.overallRiskScore}/100`);
    lines.push(`Risk Level: ${this.getRiskEmoji(report.riskLevel)} ${report.riskLevel}`);
    lines.push('');
    lines.push('⚖️  Japan Compliance:');
    lines.push(`  Classification: ${report.japanCompliance.classification}`);
    lines.push(`  Status: ${report.japanCompliance.compliant ? '✅ Likely Compliant' : '⚠️ May Need Registration'}`);
    lines.push(`  Notes: ${report.japanCompliance.regulatoryStatus}`);
    lines.push('');
    lines.push('───────────────────────────────────────────────────────');
    lines.push('🔍 RISK FACTORS');
    lines.push('───────────────────────────────────────────────────────');
    lines.push(`🏢 Centralized Ownership: ${report.riskFactors.centralizedOwnership.score}/100`);
    lines.push(`   ${report.riskFactors.centralizedOwnership.details}`);
    lines.push('');
    lines.push(`🔑 Authority Risk: ${report.riskFactors.authorityRisk.score}/100`);
    lines.push(`   ${report.riskFactors.authorityRisk.details}`);
    lines.push('');
    lines.push(`🐋 Whale Concentration: ${report.riskFactors.whaleConcentration.score}/100`);
    lines.push(`   ${report.riskFactors.whaleConcentration.details}`);
    lines.push('');
    lines.push(`💧 Liquidity Risk: ${report.riskFactors.liquidityRisk.score}/100`);
    lines.push(`   ${report.riskFactors.liquidityRisk.details}`);
    lines.push('');

    if (report.redFlags.length > 0) {
      lines.push('───────────────────────────────────────────────────────');
      lines.push('🚩 RED FLAGS');
      lines.push('───────────────────────────────────────────────────────');
      report.redFlags.forEach(flag => {
        lines.push(`${this.getSeverityEmoji(flag.severity)} [${flag.severity}] ${flag.category}`);
        lines.push(`   ${flag.description}`);
        lines.push(`   Impact: ${flag.impact}`);
        lines.push('');
      });
    }

    if (report.recommendations.length > 0) {
      lines.push('───────────────────────────────────────────────────────');
      lines.push('💡 RECOMMENDATIONS');
      lines.push('───────────────────────────────────────────────────────');
      report.recommendations.forEach(rec => {
        lines.push(`  ${rec}`);
      });
      lines.push('');
    }

    lines.push('───────────────────────────────────────────────────────');
    lines.push(`Next Audit: ${new Date(report.nextAuditSchedule!).toLocaleString()}`);
    lines.push('═══════════════════════════════════════════════════════');

    return lines.join('\n');
  }

  private getRiskEmoji(level: string): string {
    switch (level) {
      case 'LOW': return '🟢';
      case 'MEDIUM': return '🟡';
      case 'HIGH': return '🟠';
      case 'CRITICAL': return '🔴';
      default: return '⚪';
    }
  }

  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'LOW': return '🔵';
      case 'MEDIUM': return '🟡';
      case 'HIGH': return '🟠';
      case 'CRITICAL': return '🔴';
      default: return '⚪';
    }
  }
}
