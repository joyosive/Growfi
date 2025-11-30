import { NextRequest, NextResponse } from 'next/server';
import * as xrpl from 'xrpl';

// XRPL client
let client: xrpl.Client | null = null;

async function getClient() {
  if (!client) {
    client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
  }
  return client;
}

export async function POST(request: NextRequest) {
  try {
    const {
      userAddress,
      mptTokenId,
      amount,
      tokenSymbol,
      farmName,
      plotDetails
    } = await request.json();

    console.log('Creating real MPT Payment transaction:', {
      userAddress,
      mptTokenId,
      amount,
      tokenSymbol,
      farmName,
      plotDetails
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
    const issuerAddress = process.env.ISSUER_WALLET_ADDRESS;

    if (!issuerSeed || !issuerAddress) {
      return NextResponse.json(
        { success: false, error: 'Issuer credentials not configured' },
        { status: 500 }
      );
    }

    const client = await getClient();
    const issuerWallet = xrpl.Wallet.fromSeed(issuerSeed, { algorithm: 'ed25519' });

    console.log('Sending MPT from issuer:', issuerWallet.classicAddress);

    // Create memo with farm and plot details
    const memoData = `GrowFi-${farmName}-${tokenSymbol}-Plots:${plotDetails}`;
    const memoDataHex = Buffer.from(memoData, 'utf8').toString('hex').toUpperCase();
    const memoTypeHex = Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase();

    // Create Payment transaction simulating MPT transfer via memo
    const paymentTx = {
      TransactionType: 'Payment',
      Account: issuerWallet.classicAddress,
      Destination: userAddress,
      Amount: (parseInt(amount) * 1000000).toString(), // Convert to drops (amount XRP)
      Memos: [{
        Memo: {
          MemoData: memoDataHex,
          MemoType: memoTypeHex,
          MemoFormat: Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase()
        }
      }]
    } as xrpl.SubmittableTransaction;

    console.log('Submitting MPT Payment transaction:', paymentTx);

    // Prepare the transaction
    const prepared = await client.autofill(paymentTx);
    console.log('Prepared payment:', prepared);

    // Sign and submit the transaction
    const signed = issuerWallet.sign(prepared);
    console.log('Signed payment:', signed.tx_blob);

    // Submit to ledger
    const result = await client.submitAndWait(signed.tx_blob);
    console.log('Payment result:', result);

    // Check if transaction was successful
    const meta = result.result.meta;
    const txResult = (meta as any)?.TransactionResult;

    if (txResult === 'tesSUCCESS') {
      return NextResponse.json({
        success: true,
        message: `Successfully sent ${amount} ${tokenSymbol} tokens to ${userAddress}`,
        txHash: result.result.hash,
        explorerLink: `https://testnet.xrpl.org/transactions/${result.result.hash}`,
        amount,
        mptTokenId,
        tokenSymbol,
        recipient: userAddress,
        farmName,
        plotDetails,
        ledgerIndex: result.result.ledger_index,
        transactionIndex: result.result.transaction_index,
        memo: memoData
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `Payment failed with code: ${txResult}`,
        txHash: result.result.hash,
        explorerLink: `https://testnet.xrpl.org/transactions/${result.result.hash}`
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Real MPT Payment error:', error);

    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.stack : String(error)
    }, { status: 500 });
  }
}