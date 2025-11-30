import { NextRequest, NextResponse } from 'next/server';
import * as xrpl from 'xrpl';

// XRPL client
let client: xrpl.Client | null = null;

async function getClient() {
  if (!client) {
    client = new xrpl.Client(process.env.NEXT_PUBLIC_XRPL_SERVER || 'wss://s.altnet.rippletest.net:51233');
    await client.connect();
  }
  return client;
}

// Authorize user to hold a specific MPT
export async function POST(request: NextRequest) {
  try {
    const { userAddress, mptTokenId } = await request.json();

    console.log('Authorizing user for MPT:', { userAddress, mptTokenId });

    // Validate inputs
    if (!userAddress || !mptTokenId) {
      return NextResponse.json(
        { success: false, error: 'Missing userAddress or mptTokenId' },
        { status: 400 }
      );
    }

    // Get issuer wallet from environment
    const issuerSeed = process.env.ISSUER_WALLET_SEED;
    if (!issuerSeed) {
      return NextResponse.json(
        { success: false, error: 'Issuer seed not configured' },
        { status: 500 }
      );
    }

    const client = await getClient();
    const issuerWallet = xrpl.Wallet.fromSeed(issuerSeed);

    console.log('Using issuer:', issuerWallet.classicAddress);

    // Create MPTokenAuthorize transaction
    const authorizeTx: xrpl.SubmittableTransaction = {
      TransactionType: 'MPTokenAuthorize',
      Account: issuerWallet.classicAddress,
      MPTokenIssuanceID: mptTokenId,
      Holder: userAddress,
      // Flags: 0x00000001, // tfMPTAuthorize flag if needed
    };

    console.log('Submitting MPTokenAuthorize transaction:', authorizeTx);

    // Submit transaction
    const response = await client.submitAndWait(authorizeTx, { wallet: issuerWallet });

    const result = response.result;
    const engineResult = result.meta && typeof result.meta === 'object' && 'TransactionResult' in result.meta
      ? result.meta.TransactionResult
      : 'unknown';

    console.log('Authorization result:', engineResult);
    console.log('Transaction hash:', result.hash);

    if (engineResult === 'tesSUCCESS') {
      return NextResponse.json({
        success: true,
        message: 'User authorized successfully',
        txHash: result.hash,
        explorerLink: `https://testnet.xrpl.org/transactions/${result.hash}`
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Authorization failed: ${engineResult}`,
          txHash: result.hash
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Authorization error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}