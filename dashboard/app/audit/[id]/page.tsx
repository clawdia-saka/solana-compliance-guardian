'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/status-badge';
import { RiskScore } from '@/components/risk-score';
import { getAudit } from '@/lib/api';
import type { AuditResult } from '@/lib/types';

export default function AuditPage() {
  const params = useParams();
  const router = useRouter();
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const id = params.id as string;
        let result = await getAudit(id);
        
        // Retry up to 5 times if audit not found (it might be being created)
        let retries = 0;
        while (!result && retries < 5) {
          await new Promise(resolve => setTimeout(resolve, 500));
          result = await getAudit(id);
          retries++;
        }
        
        setAudit(result);
      } catch {
        setError('Failed to load audit results');
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto solana-pulse"></div>
          <p className="mt-4 text-purple-200">Loading audit results...</p>
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-black flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 bg-purple-900/50 border-purple-700">
          <CardContent className="pt-6">
            <p className="text-red-400 mb-4">{error || 'Audit not found'}</p>
            <Button onClick={() => router.push('/')} className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/')} className="border-purple-500 text-purple-200 hover:bg-purple-800/50 hover:text-white">
            ← Back to Home
          </Button>
        </div>

        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertDescription className="text-sm">
            <strong>⚖️ Legal Notice:</strong> This analysis is for informational purposes only and does not constitute legal advice.
            Consult a qualified attorney (弁護士) in Japan for compliance matters.
            <br/><span className="text-xs mt-1 block">
            この分析は情報提供のみを目的としており、法律相談ではありません。日本での規制対応については資格を持つ弁護士にご相談ください。
            </span>
          </AlertDescription>
        </Alert>

        <Card className="mb-6 bg-purple-900/50 border-purple-700 shadow-xl shadow-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-purple-100">
              <span>Audit Results</span>
              <StatusBadge status={audit.status} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-purple-300">Token Address</label>
                <p className="font-mono text-sm break-all text-purple-100">{audit.tokenAddress}</p>
              </div>
              
              {audit.status === 'complete' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <RiskScore score={audit.riskScore} />
                    <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30 solana-glow-green">
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {Math.round(audit.compliance.confidence * 100)}%
                      </div>
                      <div className="text-sm text-green-300 mt-1">Confidence</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2 text-purple-100">📋 Analysis</h3>
                    <div className="bg-purple-800/30 p-4 rounded-lg border border-purple-700">
                      <p className="text-sm font-medium text-purple-200 mb-1">Category: {audit.compliance.category}</p>
                      <p className="text-sm text-purple-300">{audit.compliance.reasoning}</p>
                    </div>
                  </div>

                  {audit.redFlags.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2 text-purple-100">⚠️ Red Flags</h3>
                      <ul className="space-y-2">
                        {audit.redFlags.map((flag) => (
                          <li key={flag.id} className="bg-red-900/30 p-3 rounded border-l-4 border-red-500">
                            <p className="font-medium text-red-200">{flag.description}</p>
                            <p className="text-sm text-red-300 mt-1">{flag.details}</p>
                            <span className="inline-block mt-2 text-xs px-2 py-1 bg-red-500/30 text-red-200 rounded">
                              {flag.severity.toUpperCase()} - {flag.category}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {audit.status === 'failed' && (
                <div className="bg-red-900/30 p-4 rounded border-l-4 border-red-500">
                  <p className="text-red-200 font-medium">Audit Failed</p>
                  <p className="text-red-300 text-sm mt-1">An error occurred during the audit. Please try again.</p>
                </div>
              )}

              <div className="text-xs text-purple-400 pt-4 border-t border-purple-700">
                <p>Audit ID: {audit.id}</p>
                <p>Created: {new Date(audit.createdAt).toLocaleString()}</p>
                {audit.completedAt && (
                  <p>Completed: {new Date(audit.completedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
