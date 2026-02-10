import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Shield } from "lucide-react";
import { PaymentProvider } from "@/components/payment-provider";
import { WalletConnectButton } from "@/components/wallet-connect-button";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Compliance Guardian - Token Audit Dashboard",
  description: "AI-powered token compliance auditing - $0.10 USDC per audit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PaymentProvider>
          <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-black">
            <nav className="border-b border-purple-700/50 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="p-2 bg-gradient-to-br from-purple-600 via-violet-600 to-purple-800 rounded-lg solana-glow">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-400 to-purple-300 bg-clip-text text-transparent">
                        Compliance Guardian
                      </h1>
                      <p className="text-xs text-purple-300">Token Audit Dashboard • $0.10 USDC per audit</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-6">
                    <Link 
                      href="/" 
                      className="text-sm font-medium text-purple-200 hover:text-green-400 transition-colors"
                    >
                      Home
                    </Link>
                    <Link 
                      href="/history" 
                      className="text-sm font-medium text-purple-200 hover:text-green-400 transition-colors"
                    >
                      History
                    </Link>
                    <WalletConnectButton />
                  </div>
                </div>
              </div>
            </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-purple-700/50 bg-black/40 backdrop-blur-sm mt-16">
            <div className="container mx-auto px-4 py-6 text-center text-sm text-purple-300">
              <p className="text-xs text-muted-foreground mb-2">
                ⚠️ Not Legal Advice | Automated Screening Tool Only | Consult Licensed Attorney
              </p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  ⚡ Powered by Solana
                </span>
                <span className="text-purple-400">•</span>
                <span>🏆 Colosseum Hackathon 2026</span>
                <span className="text-purple-400">•</span>
                <span className="text-green-400">💳 x402 Payments</span>
              </div>
              <p className="text-xs text-purple-400">Built with Torii AI • Pay with USDC on Base</p>
            </div>
          </footer>
          </div>
        </PaymentProvider>
      </body>
    </html>
  );
}
