/**
 * Risk Scoring Algorithm
 * Analyzes token data and calculates risk scores for Japan regulatory compliance
 */

import { TokenData, RiskFactors, RedFlag, TokenClassification } from './types.js';

export class RiskScorer {
  /**
   * Calculate overall risk score (0-100)
   * 0 = Lowest risk (most compliant)
   * 100 = Highest risk (least compliant)
   */
  public calculateOverallRisk(riskFactors: RiskFactors): number {
    const weights = {
      centralizedOwnership: 0.30,
      authorityRisk: 0.35,
      whaleConcentration: 0.25,
      liquidityRisk: 0.10
    };

    const weightedScore = 
      riskFactors.centralizedOwnership.score * weights.centralizedOwnership +
      riskFactors.authorityRisk.score * weights.authorityRisk +
      riskFactors.whaleConcentration.score * weights.whaleConcentration +
      riskFactors.liquidityRisk.score * weights.liquidityRisk;

    return Math.round(weightedScore);
  }

  /**
   * Determine risk level from score
   */
  public getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 25) return 'LOW';
    if (score < 50) return 'MEDIUM';
    if (score < 75) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Analyze centralized ownership risk
   */
  public analyzeCentralizedOwnership(tokenData: TokenData): RiskFactors['centralizedOwnership'] {
    const holders = tokenData.holders;
    
    if (holders.length === 0) {
      return {
        score: 100,
        details: 'No holder data available',
        topHolderPercentage: 0,
        top10HolderPercentage: 0
      };
    }

    // Sort by percentage descending
    const sortedHolders = [...holders].sort((a, b) => b.percentage - a.percentage);
    
    const topHolderPercentage = sortedHolders[0]?.percentage || 0;
    const top10HolderPercentage = sortedHolders
      .slice(0, 10)
      .reduce((sum, h) => sum + h.percentage, 0);

    let score = 0;
    let details = '';

    // Single holder > 50% is critical
    if (topHolderPercentage > 50) {
      score = 100;
      details = `CRITICAL: Single holder owns ${topHolderPercentage.toFixed(2)}% of supply`;
    } else if (topHolderPercentage > 30) {
      score = 75;
      details = `High centralization: Top holder owns ${topHolderPercentage.toFixed(2)}%`;
    } else if (topHolderPercentage > 20) {
      score = 50;
      details = `Moderate centralization: Top holder owns ${topHolderPercentage.toFixed(2)}%`;
    } else if (top10HolderPercentage > 70) {
      score = 60;
      details = `Top 10 holders control ${top10HolderPercentage.toFixed(2)}% of supply`;
    } else if (top10HolderPercentage > 50) {
      score = 40;
      details = `Top 10 holders control ${top10HolderPercentage.toFixed(2)}% of supply`;
    } else {
      score = 20;
      details = `Well-distributed: Top holder ${topHolderPercentage.toFixed(2)}%, top 10 holders ${top10HolderPercentage.toFixed(2)}%`;
    }

    return {
      score,
      details,
      topHolderPercentage,
      top10HolderPercentage
    };
  }

  /**
   * Analyze mint/freeze authority risk
   */
  public analyzeAuthorityRisk(tokenData: TokenData): RiskFactors['authorityRisk'] {
    const hasMintAuthority = tokenData.mintAuthority !== null;
    const hasFreezeAuthority = tokenData.freezeAuthority !== null;

    let score = 0;
    let details = '';

    if (hasMintAuthority && hasFreezeAuthority) {
      score = 100;
      details = 'CRITICAL: Both mint and freeze authorities are active - token can be inflated and accounts frozen';
    } else if (hasMintAuthority) {
      score = 70;
      details = 'HIGH RISK: Mint authority active - supply can be inflated at any time';
    } else if (hasFreezeAuthority) {
      score = 60;
      details = 'HIGH RISK: Freeze authority active - accounts can be frozen';
    } else {
      score = 0;
      details = 'Authorities renounced - token supply is fixed and accounts cannot be frozen';
    }

    return {
      score,
      details,
      hasMintAuthority,
      hasFreezeAuthority
    };
  }

  /**
   * Analyze whale concentration
   * A "whale" is defined as holding > 5% of supply
   */
  public analyzeWhaleConcentration(tokenData: TokenData): RiskFactors['whaleConcentration'] {
    const WHALE_THRESHOLD = 5.0; // 5% of supply
    
    const whales = tokenData.holders.filter(h => h.percentage > WHALE_THRESHOLD);
    const whalePercentage = whales.reduce((sum, h) => sum + h.percentage, 0);

    let score = 0;
    let details = '';

    if (whales.length === 0) {
      score = 0;
      details = 'No whales detected (no holder > 5%)';
    } else if (whalePercentage > 70) {
      score = 90;
      details = `${whales.length} whales control ${whalePercentage.toFixed(2)}% of supply`;
    } else if (whalePercentage > 50) {
      score = 70;
      details = `${whales.length} whales control ${whalePercentage.toFixed(2)}% of supply`;
    } else if (whalePercentage > 30) {
      score = 50;
      details = `${whales.length} whales control ${whalePercentage.toFixed(2)}% of supply`;
    } else {
      score = 25;
      details = `${whales.length} whales control ${whalePercentage.toFixed(2)}% of supply - moderate risk`;
    }

    return {
      score,
      details,
      whaleCount: whales.length,
      whalePercentage
    };
  }

  /**
   * Analyze liquidity risk
   * Based on number of holders and distribution
   */
  public analyzeLiquidityRisk(tokenData: TokenData): RiskFactors['liquidityRisk'] {
    const holderCount = tokenData.holders.length;

    let score = 0;
    let details = '';

    if (holderCount < 10) {
      score = 90;
      details = `Very low liquidity: only ${holderCount} holders`;
    } else if (holderCount < 50) {
      score = 60;
      details = `Low liquidity: ${holderCount} holders`;
    } else if (holderCount < 200) {
      score = 30;
      details = `Moderate liquidity: ${holderCount} holders`;
    } else {
      score = 10;
      details = `Good liquidity: ${holderCount} holders`;
    }

    return {
      score,
      details
    };
  }

  /**
   * Identify red flags based on risk factors
   */
  public identifyRedFlags(riskFactors: RiskFactors, tokenData: TokenData): RedFlag[] {
    const redFlags: RedFlag[] = [];

    // Centralized ownership red flags
    if (riskFactors.centralizedOwnership.topHolderPercentage > 50) {
      redFlags.push({
        severity: 'CRITICAL',
        category: 'Centralized Ownership',
        description: `Single holder controls ${riskFactors.centralizedOwnership.topHolderPercentage.toFixed(2)}% of supply`,
        impact: 'Potential for price manipulation and regulatory classification as security'
      });
    } else if (riskFactors.centralizedOwnership.topHolderPercentage > 30) {
      redFlags.push({
        severity: 'HIGH',
        category: 'Centralized Ownership',
        description: `Top holder owns ${riskFactors.centralizedOwnership.topHolderPercentage.toFixed(2)}% of supply`,
        impact: 'May indicate centralized control and regulatory scrutiny'
      });
    }

    // Authority red flags
    if (riskFactors.authorityRisk.hasMintAuthority) {
      redFlags.push({
        severity: 'CRITICAL',
        category: 'Mint Authority',
        description: 'Mint authority is not renounced',
        impact: 'Supply can be inflated at any time, undermining scarcity and value'
      });
    }

    if (riskFactors.authorityRisk.hasFreezeAuthority) {
      redFlags.push({
        severity: 'HIGH',
        category: 'Freeze Authority',
        description: 'Freeze authority is not renounced',
        impact: 'Token accounts can be frozen, preventing transfers'
      });
    }

    // Whale concentration red flags
    if (riskFactors.whaleConcentration.whalePercentage > 50) {
      redFlags.push({
        severity: 'HIGH',
        category: 'Whale Concentration',
        description: `${riskFactors.whaleConcentration.whaleCount} whales control ${riskFactors.whaleConcentration.whalePercentage.toFixed(2)}% of supply`,
        impact: 'High risk of coordinated market manipulation'
      });
    }

    // Liquidity red flags
    if (tokenData.holders.length < 50) {
      redFlags.push({
        severity: 'MEDIUM',
        category: 'Low Liquidity',
        description: `Only ${tokenData.holders.length} token holders`,
        impact: 'Low liquidity may result in high slippage and difficulty exiting positions'
      });
    }

    return redFlags;
  }

  /**
   * Infer token classification based on characteristics
   */
  public inferTokenClassification(tokenData: TokenData, riskFactors: RiskFactors): TokenClassification {
    // Security token indicators
    const hasHighCentralization = riskFactors.centralizedOwnership.topHolderPercentage > 30;
    const hasActiveAuthorities = riskFactors.authorityRisk.hasMintAuthority || 
                                  riskFactors.authorityRisk.hasFreezeAuthority;
    
    // If highly centralized with active authorities, likely a security
    if (hasHighCentralization && hasActiveAuthorities) {
      return TokenClassification.SECURITY_TOKEN;
    }

    // Check metadata for hints
    const name = tokenData.name?.toLowerCase() || '';
    const symbol = tokenData.symbol?.toLowerCase() || '';

    if (name.includes('governance') || symbol.includes('gov')) {
      return TokenClassification.GOVERNANCE_TOKEN;
    }

    // Default to utility if well-distributed
    if (riskFactors.centralizedOwnership.score < 50 && !hasActiveAuthorities) {
      return TokenClassification.UTILITY_TOKEN;
    }

    // Otherwise unknown
    return TokenClassification.UNKNOWN;
  }

  /**
   * Generate recommendations based on risk factors
   */
  public generateRecommendations(riskFactors: RiskFactors, redFlags: RedFlag[]): string[] {
    const recommendations: string[] = [];

    // Authority recommendations
    if (riskFactors.authorityRisk.hasMintAuthority) {
      recommendations.push('🔑 Renounce mint authority to fix total supply and improve trust');
    }
    if (riskFactors.authorityRisk.hasFreezeAuthority) {
      recommendations.push('🔑 Renounce freeze authority to prevent account freezing');
    }

    // Centralization recommendations
    if (riskFactors.centralizedOwnership.topHolderPercentage > 30) {
      recommendations.push('📊 Improve token distribution to reduce centralization risk');
      recommendations.push('🔄 Consider vesting schedules or airdrops to increase holder diversity');
    }

    // Whale recommendations
    if (riskFactors.whaleConcentration.whalePercentage > 50) {
      recommendations.push('🐋 Encourage whale holders to diversify or implement anti-whale mechanisms');
    }

    // Liquidity recommendations
    if (riskFactors.liquidityRisk.score > 50) {
      recommendations.push('💧 Increase liquidity by adding to DEX pools or increasing holder count');
    }

    // Compliance recommendations
    if (redFlags.some(f => f.severity === 'CRITICAL')) {
      recommendations.push('⚖️ Consult with legal counsel regarding Japan PSA/FIEA compliance');
      recommendations.push('📋 Consider registration with Japanese Financial Services Agency if classified as security');
    }

    return recommendations;
  }
}
