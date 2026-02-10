'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Search, AlertTriangle, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import { submitAudit, getAudits } from '@/lib/api';
import { AuditResult } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/status-badge';
import { RiskScore } from '@/components/risk-score';
import { PaymentModal } from '@/components/payment-modal';
import Link from 'next/link';
import { getX402Config } from '@/lib/x402-config';

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const config = getX402Config();
  
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentAudits, setRecentAudits] = useState<AuditResult[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingToken, setPendingToken] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!tokenAddress.trim()) {
      setError('Please enter a token address');
      return;
    }

    // Solana address validation: 32-44 characters, Base58 encoded
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!solanaAddressRegex.test(tokenAddress.trim())) {
      setError('Invalid Solana address format');
      return;
    }

    // Check if demo mode or payment required
    if (demoMode) {
      // Skip payment in demo mode
      submitAuditDirect(tokenAddress.trim());
    } else {
      // Show payment modal
      setPendingToken(tokenAddress.trim());
      setShowPaymentModal(true);
    }
  };

  const handlePaymentComplete = async (paymentProof: string) => {
    console.log('Payment completed:', paymentProof);
    setShowPaymentModal(false);
    
    // Submit audit with payment proof
    submitAuditDirect(pendingToken, paymentProof);
  };

  const submitAuditDirect = async (address: string, paymentProof?: string) => {
    setLoading(true);
    setError('');
    try {
      const result = await submitAudit(address, paymentProof);
      router.push(`/audit/${result.id}`);
    } catch {
      setError('Failed to submit audit. Please try again.');
    } finally {
      setLoading(false);
      setPendingToken('');
    }
  };

  // Load recent audits on mount
  useState(() => {
    getAudits().then(audits => setRecentAudits(audits.slice(0, 3)));
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-bold rounded-full solana-glow">
            🏆 COLOSSEUM 2026
          </span>
          <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full solana-glow-green">
            ⚡ POWERED BY SOLANA
          </span>
        </div>
        <div className="inline-block p-3 bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800 rounded-2xl mb-4 solana-pulse">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-purple-800 bg-clip-text text-transparent">
          Token Compliance Auditor
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          AI-powered security analysis powered by Torii. Submit a Solana token address to get instant compliance insights and risk assessment.
        </p>
        <Alert className="max-w-2xl mx-auto mt-4 border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ <strong>Disclaimer:</strong> This is an automated screening tool for informational purposes only. 
            NOT legal advice. Consult a licensed attorney (弁護士) in Japan for compliance matters.
          </AlertDescription>
        </Alert>
      </div>

      {/* Demo Video Section */}
      <Card className="max-w-4xl mx-auto border-2 border-purple-600 bg-purple-900/50 shadow-lg shadow-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-100">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Watch Demo
          </CardTitle>
          <CardDescription className="text-purple-300">
            See Compliance Guardian in action (3:15)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video rounded-lg overflow-hidden border-2 border-purple-500 shadow-lg shadow-purple-500/50">
            <video 
              controls 
              className="w-full h-full"
              poster="/demo-thumbnail.png"
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-sm text-purple-300 mt-3 text-center">
            Full walkthrough: token submission → on-chain analysis → risk scoring → compliance recommendations
          </p>
        </CardContent>
      </Card>

      {/* Audit Submission Form */}
      <Card className="max-w-2xl mx-auto border-2 border-purple-600 bg-purple-900/50 shadow-lg shadow-purple-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-100">
            <Search className="w-5 h-5 text-green-400" />
            Submit Token for Audit
          </CardTitle>
          <CardDescription className="text-purple-300">
            Enter a Solana token address to begin compliance analysis • {config.AUDIT_PRICE} USDC per audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-purple-950/50 border border-purple-600 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm text-purple-200">Demo Mode (Free)</span>
              </div>
              <button
                type="button"
                onClick={() => setDemoMode(!demoMode)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  demoMode ? 'bg-green-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    demoMode ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder="DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB264"
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="text-lg bg-purple-950/50 border-purple-500 text-purple-100 placeholder:text-purple-400 focus:ring-green-400 focus:border-green-400"
                disabled={loading}
              />
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Payment Info */}
            {!demoMode && (
              <Alert className="border-green-600 bg-green-900/20">
                <DollarSign className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">
                  {isConnected 
                    ? `Payment of ${config.AUDIT_PRICE} USDC will be requested on Base network`
                    : 'Connect wallet to pay for audit with USDC on Base'}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 solana-glow transition-all"
              disabled={loading || (!demoMode && !isConnected)}
            >
              {loading ? (
                <>
                  <Skeleton className="w-4 h-4 mr-2" />
                  Submitting...
                </>
              ) : demoMode ? (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Start Free Demo Audit
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay {config.AUDIT_PRICE} & Start Audit
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
        tokenAddress={pendingToken}
      />

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="border-purple-600 bg-gradient-to-br from-purple-900/70 to-purple-950/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Total Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">1,234</div>
            <p className="text-xs text-purple-400 mt-1">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="border-purple-600 bg-gradient-to-br from-purple-900/70 to-purple-950/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400" />
              High Risk Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">34</div>
            <p className="text-xs text-purple-400 mt-1">2.8% of total audits</p>
          </CardContent>
        </Card>

        <Card className="border-green-600 bg-gradient-to-br from-green-900/40 to-emerald-950/30 backdrop-blur-sm solana-glow-green">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              Avg Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">42</div>
            <p className="text-xs text-green-400 mt-1">Medium risk average</p>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Chain Roadmap */}
      <Card className="max-w-4xl mx-auto border-purple-200 bg-gradient-to-br from-purple-900/20 to-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-100">
            🗺️ Multi-Chain Roadmap
          </CardTitle>
          <CardDescription className="text-purple-300">
            Expanding beyond Solana - Global compliance coverage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-400 mb-2">✅ Phase 1: Solana (Current)</h4>
              <p className="text-sm text-gray-300">Full Japan compliance (PSA, FIEA, Prepaid Instruments)</p>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">🔜 Phase 2: Ethereum Ecosystem</h4>
              <ul className="text-sm text-gray-300 list-disc list-inside">
                <li>Ethereum Mainnet - US SEC framework</li>
                <li>L2s: Arbitrum, Base, Optimism, zkSync, Polygon zkEVM</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">🚀 Phase 3: Alt L1s</h4>
              <ul className="text-sm text-gray-300 list-disc list-inside">
                <li>BSC - Thailand SEC</li>
                <li>Polygon PoS - EU MiCA</li>
                <li>Avalanche - Multi-subnet</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">🌐 Phase 4+: Global Expansion</h4>
              <ul className="text-sm text-gray-300 list-disc list-inside">
                <li>Bitcoin L2s (Stacks, Rootstock)</li>
                <li>Regional compliance: EU MiCA, US SEC, Singapore MAS</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Audits */}
      {recentAudits.length > 0 && (
        <Card className="max-w-4xl mx-auto bg-purple-900/50 border-purple-600 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-purple-100">Recent Audits</CardTitle>
            <CardDescription className="text-purple-300">Latest token compliance analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAudits.map((audit) => (
                <Link 
                  key={audit.id} 
                  href={`/audit/${audit.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg hover:shadow-purple-500/30 transition-all cursor-pointer border-purple-600 hover:border-green-400 bg-purple-950/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-purple-300">
                              {audit.tokenAddress.slice(0, 10)}...{audit.tokenAddress.slice(-8)}
                            </span>
                            <StatusBadge status={audit.status} />
                          </div>
                          {audit.tokenName && (
                            <p className="font-semibold text-purple-100">{audit.tokenName} ({audit.tokenSymbol})</p>
                          )}
                        </div>
                        {audit.status === 'complete' && (
                          <div className="w-48">
                            <RiskScore score={audit.riskScore} size="sm" showLabel={false} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/history">
                <Button variant="outline" className="border-purple-500 text-purple-200 hover:bg-purple-800/50 hover:border-green-400 hover:text-white">
                  View All Audits
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
