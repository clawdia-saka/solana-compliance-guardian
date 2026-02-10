/**
 * Torii Compliance Engine
 * Core logic ported from bash script
 */

export class ToriiEngine {
  constructor() {
    // Risk keyword patterns and their scores
    this.riskPatterns = [
      {
        pattern: /profit|dividend|revenue[\s-]?share|fee[\s-]?distribut|yield|fees distributed/i,
        score: 30,
        flag: '⚠️  Profit/revenue distribution detected'
      },
      {
        pattern: /staking|stake|reward/i,
        score: 20,
        flag: '⚠️  Staking mechanism may trigger collective investment scheme'
      },
      {
        pattern: /governance|voting|vote/i,
        score: 10,
        flag: 'ℹ️  Governance rights (lower risk if no economic benefit)'
      },
      {
        pattern: /buyback|burn|repurchase/i,
        score: 15,
        flag: '⚠️  Buyback program may indicate security characteristics'
      },
      {
        pattern: /invest|return|appreciation|growth/i,
        score: 25,
        flag: '🚨 Investment language detected - high security risk'
      }
    ];

    // Token type patterns
    this.typePatterns = {
      nft: /nft|collectible|art|unique|pfp|jpeg/i,
      payment: /payment|currency|transfer|remit|send money/i,
      prepaid: /prepaid|gift[\s-]?card|voucher|point/i
    };
  }

  /**
   * Check security risk from token description
   * @param {string} description - Token description
   * @returns {object} - { score, risks }
   */
  checkSecurityRisk(description) {
    let score = 0;
    const risks = [];

    for (const { pattern, score: points, flag } of this.riskPatterns) {
      if (pattern.test(description)) {
        score += points;
        risks.push(flag);
      }
    }

    return { score, risks };
  }

  /**
   * Classify token based on description
   * @param {string} description - Token description
   * @returns {object} - Full classification result
   */
  classify(description) {
    const { score, risks } = this.checkSecurityRisk(description);
    let classification, classificationJP, required, governingLaw, riskLevel;

    // Determine classification based on risk score and keywords
    if (score >= 50) {
      classification = 'SECURITY TOKEN';
      classificationJP = '電子記録移転権利';
      required = 'Type I or II Financial Instruments Business License';
      governingLaw = 'Financial Instruments and Exchange Act';
      riskLevel = 'HIGH';
    } else if (score >= 25) {
      classification = 'HIGH RISK - Possible Security';
      classificationJP = '要審査';
      required = 'Legal consultation before Japan launch';
      governingLaw = 'May require: FIEA registration';
      riskLevel = 'HIGH';
    } else if (this.typePatterns.nft.test(description)) {
      classification = 'NFT';
      classificationJP = 'NFT';
      required = 'Usually none (case by case)';
      governingLaw = 'Note: Fractional NFTs may be securities';
      riskLevel = 'LOW';
    } else if (this.typePatterns.payment.test(description)) {
      classification = 'CRYPTO ASSET';
      classificationJP = '暗号資産';
      required = 'Crypto Asset Exchange License';
      governingLaw = 'Payment Services Act';
      riskLevel = 'MEDIUM';
    } else if (this.typePatterns.prepaid.test(description)) {
      classification = 'PREPAID PAYMENT';
      classificationJP = '前払式支払手段';
      required = 'Notification to Finance Bureau';
      governingLaw = 'Payment Services Act';
      riskLevel = 'LOW';
    } else {
      classification = 'UTILITY TOKEN';
      classificationJP = 'ユーティリティトークン';
      required = 'Usually no registration';
      governingLaw = 'Note: Verify no security characteristics';
      riskLevel = 'LOW';
    }

    return {
      classification,
      classificationJP,
      riskScore: score,
      riskLevel,
      required,
      governingLaw,
      risks,
      confidence: this.calculateConfidence(score, risks.length),
      timestamp: new Date().toISOString(),
      disclaimer: 'This is not legal advice. Consult licensed Japanese attorneys for formal opinions.',
      futureConsideration: 'Japan is considering moving crypto assets to FIEA jurisdiction by 2027.'
    };
  }

  /**
   * Quick classification by type
   * @param {string} type - Token type (utility|governance|security|payment|nft)
   * @returns {object} - Classification info
   */
  quickClassify(type) {
    const classifications = {
      utility: {
        type: 'UTILITY TOKEN',
        registration: 'Usually not required',
        risk: 'LOW',
        action: 'Verify no security characteristics',
        confidence: 0.85
      },
      governance: {
        type: 'GOVERNANCE TOKEN',
        registration: 'Depends on economic rights',
        risk: 'MEDIUM',
        action: 'Review for profit-sharing mechanisms',
        confidence: 0.75
      },
      security: {
        type: 'SECURITY TOKEN (電子記録移転権利)',
        registration: 'Type I/II FIEA License',
        risk: 'HIGH',
        action: 'Engage licensed securities lawyers',
        confidence: 0.95
      },
      payment: {
        type: 'CRYPTO ASSET (暗号資産)',
        registration: 'Exchange license required',
        risk: 'HIGH',
        action: 'Partner with licensed exchange',
        confidence: 0.90
      },
      nft: {
        type: 'NFT',
        registration: 'Usually not required',
        risk: 'LOW',
        action: 'Avoid fractional ownership structures',
        confidence: 0.80
      }
    };

    const result = classifications[type.toLowerCase()];
    if (!result) {
      throw new Error(`Unknown type: ${type}. Valid types: utility, governance, security, payment, nft`);
    }

    return {
      ...result,
      timestamp: new Date().toISOString(),
      disclaimer: 'This is not legal advice. Consult licensed Japanese attorneys for formal opinions.'
    };
  }

  /**
   * Calculate confidence score based on risk indicators
   * @param {number} score - Risk score
   * @param {number} riskCount - Number of risk factors
   * @returns {number} - Confidence (0-1)
   */
  calculateConfidence(score, riskCount) {
    // Higher confidence when more risk factors are detected
    // Lower confidence for edge cases (low score, few indicators)
    if (riskCount === 0) return 0.60; // Low confidence, needs more info
    if (riskCount >= 3) return 0.95; // High confidence, multiple indicators
    if (score >= 50) return 0.90;
    if (score >= 25) return 0.80;
    return 0.70;
  }
}
