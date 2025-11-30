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

// Send MPT tokens to user after XRP payment
export async function POST(request: NextRequest) {
  try {
    const {
      userAddress,
      mptTokenId,
      amount,
      farmName,
      plotDetails,
      xrpPaymentHash // Hash of user's XRP payment
    } = await request.json();

    console.log('Processing MPT purchase:', {
      userAddress,
      mptTokenId,
      amount,
      farmName,
      plotDetails,
      xrpPaymentHash
    });

    // Validate inputs
    if (!userAddress || !mptTokenId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
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

    console.log('Sending MPT from issuer:', issuerWallet.classicAddress);

    // Create MPT Payment transaction
    const paymentTx: xrpl.SubmittableTransaction = {
      TransactionType: 'Payment',
      Account: issuerWallet.classicAddress,
      Destination: userAddress,
      Amount: {
        currency: mptTokenId,
        value: amount,
        issuer: issuerWallet.classicAddress
      },
      ...(plotDetails && {
        Memos: [{
          Memo: {
            MemoData: Buffer.from(`GrowFi-${farmName}-${plotDetails}-XRPTx:${xrpPaymentHash}`, 'utf8').toString('hex').toUpperCase(),
            MemoType: Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase()
          }
        }]
      })
    };

    console.log('Submitting MPT Payment transaction:', paymentTx);

    // Submit transaction
    const response = await client.submitAndWait(paymentTx, { wallet: issuerWallet });

    const result = response.result;
    const engineResult = result.meta && typeof result.meta === 'object' && 'TransactionResult' in result.meta
      ? result.meta.TransactionResult
      : 'unknown';

    console.log('Payment result:', engineResult);
    console.log('Transaction hash:', result.hash);

    if (engineResult === 'tesSUCCESS') {
      return NextResponse.json({
        success: true,
        message: 'MPT tokens sent successfully',
        txHash: result.hash,
        explorerLink: `https://testnet.xrpl.org/transactions/${result.hash}`,
        mptTokenId,
        amount,
        recipient: userAddress
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `MPT payment failed: ${engineResult}`,
          txHash: result.hash
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('MPT payment error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}