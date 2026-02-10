/**
 * x402 Payment Protocol Configuration
 * Handles payment integration with Base network for audit fees
 */

export const X402_CONFIG = {
  // Payment amount: $0.01 USDC per audit
  AUDIT_PRICE: '$0.01',
  
  // Base network (mainnet)
  NETWORK: 'eip155:8453' as const,
  
  // Facilitator URL (testnet for demo, mainnet for production)
  FACILITATOR_URL: process.env.NEXT_PUBLIC_X402_FACILITATOR_URL || 'https://www.x402.org/facilitator',
  
  // Receiving wallet address (update with actual wallet)
  PAY_TO_ADDRESS: process.env.NEXT_PUBLIC_PAY_TO_ADDRESS || '0xBB6FdC629a153E2bF7629032A3Bf99aec8b48938',
  
  // Payment scheme
  SCHEME: 'exact' as const,
  
  // Test mode flag
  IS_TESTNET: process.env.NEXT_PUBLIC_X402_TESTNET === 'true',
} as const;

// Use Base Sepolia testnet for testing
export const X402_TESTNET_CONFIG = {
  ...X402_CONFIG,
  NETWORK: 'eip155:84532' as const, // Base Sepolia
  AUDIT_PRICE: '$0.005', // Lower price for testing (half of mainnet)
};

export const getX402Config = () => {
  return X402_CONFIG.IS_TESTNET ? X402_TESTNET_CONFIG : X402_CONFIG;
};
