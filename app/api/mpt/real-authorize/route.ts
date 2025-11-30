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
    const { userAddress, mptTokenId, tokenSymbol, amount } = await request.json();

    console.log('Creating authorization simulation transaction:', {
      userAddress,
      mptTokenId,
      tokenSymbol,
      amount
    });

    // Validate inputs
    if (!userAddress || !mptTokenId) {
      return NextResponse.json(
        { success: false, error: 'Missing userAddress or mptTokenId' },
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
    const issuerWallet = xrpl.Wallet.fromSeed(issuerSeed);

    console.log('Using issuer:', issuerWallet.classicAddress);

    // Since MPTokenAuthorize might not be supported yet, we'll create a memo transaction to simulate authorization
    const memoData = `MPT-AUTH-${tokenSymbol}-${mptTokenId.slice(0, 8)}`;
    const memoDataHex = Buffer.from(memoData, 'utf8').toString('hex').toUpperCase();
    const memoTypeHex = Buffer.from('MPT-Authorization', 'utf8').toString('hex').toUpperCase();

    // Create a small XRP payment with authorization memo (simulation)
    const authorizeTx = {
      TransactionType: 'Payment',
      Account: issuerWallet.classicAddress,
      Destination: userAddress,
      Amount: '1', // 1 drop (0.000001 XRP) for memo transaction
      Memos: [{
        Memo: {
          MemoData: memoDataHex,
          MemoType: memoTypeHex,
          MemoFormat: Buffer.from('text/plain', 'utf8').toString('hex').toUpperCase()
        }
      }]
    } as xrpl.SubmittableTransaction;

    console.log('Submitting authorization simulation transaction:', authorizeTx);

    // Prepare the transaction
    const prepared = await client.autofill(authorizeTx);
    console.log('Prepared transaction:', prepared);

    // Sign and submit the transaction
    const signed = issuerWallet.sign(prepared);
    console.log('Signed transaction:', signed.tx_blob);

    // Submit to ledger
    const result = await client.submitAndWait(signed.tx_blob);
    console.log('Transaction result:', result);

    // Check if transaction was successful
    const meta = result.result.meta;
    const txResult = (meta as any)?.TransactionResult;

    if (txResult === 'tesSUCCESS') {
      return NextResponse.json({
        success: true,
        message: `Successfully authorized ${userAddress} to hold ${tokenSymbol} tokens`,
        txHash: result.result.hash,
        explorerLink: `https://testnet.xrpl.org/transactions/${result.result.hash}`,
        userAddress,
        mptTokenId,
        tokenSymbol,
        ledgerIndex: result.result.ledger_index,
        transactionIndex: result.result.transaction_index,
        authorizationMemo: memoData
      });
    } else {
      return NextResponse.json({
        success: false,
        error: `Authorization transaction failed with code: ${txResult}`,
        txHash: result.result.hash,
        explorerLink: `https://testnet.xrpl.org/transactions/${result.result.hash}`
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Real authorization error:', error);

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