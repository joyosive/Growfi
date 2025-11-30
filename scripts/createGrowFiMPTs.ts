/**
 * GrowFi MPT Token Creation Script
 * Creates Multi-Purpose Tokens for farm ownership and impact credits
 *
 * Usage: npx tsx scripts/createGrowFiMPTs.ts
 */

import * as xrpl from "xrpl";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// GrowFi Token Configuration
const FARM_TOKENS = {
  FRSH: {
    name: "Fresh City Farms Token",
    symbol: "FRSH",
    description: "Fractional ownership of Fresh City Farms hydroponic plots",
    assetScale: 0, // Whole units only
    maxAmount: "150", // 150 total plots
    transferFee: 0,
    flags: {
      canLock: false,
      requireAuth: true, // Users must be authorized to hold
      canEscrow: true,
      canTrade: true,
      transferable: true,
    },
    farmName: "Fresh City Farms",
    location: "Toronto, ON",
  },
  CREEK: {
    name: "Black Creek Community Token",
    symbol: "CREEK",
    description: "Fractional ownership of Black Creek Community Farm plots",
    assetScale: 0,
    maxAmount: "78",
    transferFee: 0,
    flags: {
      canLock: false,
      requireAuth: true,
      canEscrow: true,
      canTrade: true,
      transferable: true,
    },
    farmName: "Black Creek Community Farm",
    location: "Toronto, ON",
  },
  GROW: {
    name: "Toronto Urban Growers Token",
    symbol: "GROW",
    description: "Fractional ownership of Toronto Urban Growers plots",
    assetScale: 0,
    maxAmount: "200",
    transferFee: 0,
    flags: {
      canLock: false,
      requireAuth: true,
      canEscrow: true,
      canTrade: true,
      transferable: true,
    },
    farmName: "Toronto Urban Growers",
    location: "Toronto, ON",
  },
  RIVER: {
    name: "Riverdale Farm Token",
    symbol: "RIVER",
    description: "Fractional ownership of Riverdale Farm plots",
    assetScale: 0,
    maxAmount: "95",
    transferFee: 0,
    flags: {
      canLock: false,
      requireAuth: true,
      canEscrow: true,
      canTrade: true,
      transferable: true,
    },
    farmName: "Riverdale Farm",
    location: "Toronto, ON",
  },
  SHARE: {
    name: "FoodShare Toronto Token",
    symbol: "SHARE",
    description: "Fractional ownership of FoodShare Toronto plots",
    assetScale: 0,
    maxAmount: "87",
    transferFee: 0,
    flags: {
      canLock: false,
      requireAuth: true,
      canEscrow: true,
      canTrade: true,
      transferable: true,
    },
    farmName: "FoodShare Toronto",
    location: "Toronto, ON",
  },
};

const IMPACT_TOKEN = {
  SPROUT: {
    name: "SPROUT Impact Credits",
    symbol: "SPROUT",
    description: "Environmental and social impact credits from sustainable farming",
    assetScale: 2, // 2 decimal places for precise impact tracking
    maxAmount: undefined, // Unlimited - minted on harvest
    transferFee: 0,
    flags: {
      canLock: false,
      requireAuth: false, // Anyone can hold impact credits
      canEscrow: true,
      canTrade: true,
      transferable: true,
    },
    impactCategories: ["water_saved", "co2_reduced", "food_produced"],
    unit: "credits",
  },
};

const ALL_TOKENS = { ...FARM_TOKENS, ...IMPACT_TOKEN };

// XRPL Network Configuration
const NETWORKS = {
  devnet: "wss://s.devnet.rippletest.net:51233",
  testnet: "wss://s.altnet.rippletest.net:51233",
  mainnet: "wss://xrplcluster.com",
};

type NetworkType = keyof typeof NETWORKS;

function getNetwork(): NetworkType {
  const network = process.env.NEXT_PUBLIC_XRPL_NETWORK || "testnet";
  if (network in NETWORKS) {
    return network as NetworkType;
  }
  console.warn(`Invalid network "${network}", defaulting to testnet`);
  return "testnet";
}

// Convert flags to MPTokenIssuanceCreate flag integer
function calculateMPTFlags(flags: typeof FARM_TOKENS.FRSH.flags): number {
  let flagValue = 0;

  // MPTokenIssuanceCreate flags (from XRPL docs)
  if (flags.canLock) flagValue |= 0x0002;
  if (flags.requireAuth) flagValue |= 0x0004;
  if (flags.canEscrow) flagValue |= 0x0008;
  if (flags.canTrade) flagValue |= 0x0010;
  if (flags.transferable) flagValue |= 0x0020;

  return flagValue;
}

// Convert string to hex for MPTokenMetadata
function stringToHex(str: string): string {
  return Buffer.from(str, "utf8").toString("hex").toUpperCase();
}

async function createMPToken(
  client: xrpl.Client,
  wallet: xrpl.Wallet,
  tokenConfig: any,
  symbol: string
): Promise<{ success: boolean; mptIssuanceId?: string; error?: string }> {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`🌱 Creating ${symbol} Token: ${tokenConfig.name}`);
  console.log(`${"=".repeat(50)}`);

  try {
    // Build enhanced metadata for GrowFi
    const metadata = JSON.stringify({
      name: tokenConfig.name,
      symbol: symbol,
      description: tokenConfig.description,
      issuer: wallet.classicAddress,
      decimals: tokenConfig.assetScale,
      platform: "GrowFi",
      version: "1.0",
      ...(tokenConfig.farmName && {
        farm: {
          name: tokenConfig.farmName,
          location: tokenConfig.location,
          type: "hydroponic_urban_farm",
        },
      }),
      ...(tokenConfig.impactCategories && {
        impact: {
          categories: tokenConfig.impactCategories,
          unit: tokenConfig.unit,
        },
      }),
      website: "https://growfi.app",
      created: new Date().toISOString(),
    });

    const tx: xrpl.SubmittableTransaction = {
      TransactionType: "MPTokenIssuanceCreate",
      Account: wallet.classicAddress,
      AssetScale: tokenConfig.assetScale,
      TransferFee: tokenConfig.transferFee,
      Flags: calculateMPTFlags(tokenConfig.flags),
      MPTokenMetadata: stringToHex(metadata),
      ...(tokenConfig.maxAmount && { MaximumAmount: tokenConfig.maxAmount }),
    };

    console.log(`📋 Symbol: ${symbol}`);
    console.log(`🏗️  Max Supply: ${tokenConfig.maxAmount || "Unlimited"}`);
    console.log(`🔐 Requires Auth: ${tokenConfig.flags.requireAuth ? "Yes" : "No"}`);
    console.log(`\n⏳ Submitting transaction...`);

    const response = await client.submitAndWait(tx, { wallet });
    const result = response.result;
    const engineResult =
      result.meta &&
      typeof result.meta === "object" &&
      "TransactionResult" in result.meta
        ? result.meta.TransactionResult
        : "unknown";

    if (engineResult === "tesSUCCESS") {
      const meta = result.meta as any;
      let mptIssuanceId: string | undefined;

      if (meta?.AffectedNodes) {
        for (const node of meta.AffectedNodes) {
          if (node.CreatedNode?.LedgerEntryType === "MPTokenIssuance") {
            mptIssuanceId = node.CreatedNode.LedgerIndex;
            break;
          }
        }
      }

      console.log(`\n✅ [SUCCESS] ${symbol} Token Created!`);
      console.log(`🆔 MPT Issuance ID: ${mptIssuanceId || "Check transaction on explorer"}`);
      console.log(`💳 Issuer Address: ${wallet.classicAddress}`);
      console.log(`📄 TX Hash: ${result.hash}`);
      console.log(`🌐 View on: https://testnet.xrpl.org/transactions/${result.hash}`);

      return { success: true, mptIssuanceId };
    } else {
      console.error(`\n❌ [FAILED] ${symbol} Token Creation Failed`);
      console.error(`📋 Result: ${engineResult}`);
      return { success: false, error: engineResult };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`\n🚨 [ERROR] ${symbol} Token Creation Error:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

async function main() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`🌱 GrowFi MPT Creation Script - Sustainable Farming Tokens`);
  console.log(`${"=".repeat(60)}`);

  // Validate environment
  const issuerSeed = process.env.ISSUER_WALLET_SEED;
  if (!issuerSeed) {
    console.error("\n❌ [ERROR] ISSUER_WALLET_SEED not found in .env file");
    console.error("Please set ISSUER_WALLET_SEED in your .env.local file");
    process.exit(1);
  }

  const network = getNetwork();
  const wssUrl = NETWORKS[network];

  console.log(`🌐 Network: ${network.toUpperCase()}`);
  console.log(`🔗 WebSocket: ${wssUrl}`);

  // Create wallet from seed using ED25519 algorithm (GemWallet compatible)
  const wallet = xrpl.Wallet.fromSeed(issuerSeed, { algorithm: 'ed25519' });
  console.log(`💰 Issuer Wallet: ${wallet.classicAddress}`);

  // Connect to XRPL
  const client = new xrpl.Client(wssUrl);

  try {
    console.log("\n🔌 Connecting to XRPL...");
    await client.connect();
    console.log("✅ Connected!");

    // Check wallet balance
    try {
      const balance = await client.getXrpBalance(wallet.classicAddress);
      console.log(`💵 Wallet Balance: ${balance} XRP`);

      if (parseFloat(String(balance)) < 100) {
        console.warn("\n⚠️  [WARNING] Low balance! You need XRP for reserves and fees.");
        console.warn("🚰 Get testnet XRP from: https://faucet.altnet.rippletest.net/");
      }
    } catch (e) {
      console.error("\n❌ [ERROR] Could not fetch wallet balance. Account may not be funded.");
      console.error("🚰 Get testnet XRP from: https://faucet.altnet.rippletest.net/");
      process.exit(1);
    }

    // Create farm tokens first
    console.log(`\n🏠 Creating Farm Ownership Tokens...`);
    const farmResults: Record<string, any> = {};

    for (const [symbol, config] of Object.entries(FARM_TOKENS)) {
      farmResults[symbol] = await createMPToken(client, wallet, config, symbol);

      // Small delay between transactions
      console.log("\n⏳ Waiting 3 seconds before next token...");
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Create impact token
    console.log(`\n🌱 Creating Impact Credits Token...`);
    const impactResults: Record<string, any> = {};

    for (const [symbol, config] of Object.entries(IMPACT_TOKEN)) {
      impactResults[symbol] = await createMPToken(client, wallet, config, symbol);
    }

    const allResults = { ...farmResults, ...impactResults };

    // Generate .env update instructions
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📋 SUMMARY - GrowFi MPT Creation Results`);
    console.log(`${"=".repeat(60)}`);

    let envUpdates = "\n# Add these to your .env.local file:\n";

    for (const [symbol, result] of Object.entries(allResults)) {
      if (result.success) {
        console.log(`\n✅ ${symbol}: SUCCESS`);
        console.log(`   🆔 MPT ID: ${result.mptIssuanceId}`);
        envUpdates += `${symbol}_TOKEN_ID=${result.mptIssuanceId}\n`;
      } else {
        console.log(`\n❌ ${symbol}: FAILED - ${result.error}`);
      }
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🔧 NEXT STEPS`);
    console.log(`${"=".repeat(60)}`);
    console.log(envUpdates);
    console.log(`🌐 View transactions on: https://testnet.xrpl.org/accounts/${wallet.classicAddress}`);
    console.log(`${"=".repeat(60)}\n`);

  } catch (error) {
    console.error("\n💥 Fatal error:", error);
    process.exit(1);
  } finally {
    await client.disconnect();
    console.log("🔌 Disconnected from XRPL");
  }
}

main();