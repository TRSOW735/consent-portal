const { Connection, PublicKey, LAMPORTS_PER_SOL, clusterApiUrl } = require("@solana/web3.js");

async function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function main() {
  const address = process.argv[2];
  const sol = Number(process.argv[3] || "1");
  if (!address) throw new Error("Uso: node tools/airdrop-devnet.js <address> [sol]");

  const rpc = process.env.SOLANA_RPC_URL || clusterApiUrl("devnet");
  const conn = new Connection(rpc, "confirmed");
  const pk = new PublicKey(address);

  console.log("RPC:", rpc);
  const before = await conn.getBalance(pk, "confirmed");
  console.log("Balance antes:", (before / LAMPORTS_PER_SOL).toFixed(4), "SOL");

  const lamports = Math.round(sol * LAMPORTS_PER_SOL);

  const delays = [1000, 2500, 6000, 12000];
  let sig = null;

  for (let i=0; i<delays.length; i++) {
    try {
      sig = await conn.requestAirdrop(pk, lamports);
      console.log("Airdrop tx:", sig);
      await conn.confirmTransaction(sig, "confirmed");
      break;
    } catch (e) {
      console.log("Airdrop falló:", e?.message || e);
      console.log("Reintento en", delays[i], "ms...");
      await sleep(delays[i]);
    }
  }

  if (!sig) throw new Error("No se pudo hacer airdrop (rate limit). Reintenta luego o usa faucet web.");

  const after = await conn.getBalance(pk, "confirmed");
  console.log("Balance después:", (after / LAMPORTS_PER_SOL).toFixed(4), "SOL");
}

main().catch(e => { console.error("ERROR:", e.message || e); process.exit(1); });