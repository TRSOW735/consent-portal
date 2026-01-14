const fs = require("fs");
const { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, SystemProgram, Transaction, TransactionInstruction } = require("@solana/web3.js");

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

async function main() {
  const payerKeyPath = process.argv[2];
  const recipientStr = process.argv[3];
  const amountSolStr = process.argv[4];
  const referenceStr = process.argv[5];
  const memo = process.argv[6] || "";

  if (!payerKeyPath || !recipientStr || !amountSolStr || !referenceStr) {
    console.error("Uso: node tools/pay-intent.js <payerKeyPath> <recipient> <amountSol> <reference> [memo]");
    process.exit(1);
  }

  const secret = Uint8Array.from(JSON.parse(fs.readFileSync(payerKeyPath, "utf8")));
  const payer = Keypair.fromSecretKey(secret);

  const rpc = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const conn = new Connection(rpc, "confirmed");

  const recipient = new PublicKey(recipientStr);
  const reference = new PublicKey(referenceStr);
  const lamports = Math.round(Number(amountSolStr) * LAMPORTS_PER_SOL);

  console.log("RPC:", rpc);
  console.log("Payer:", payer.publicKey.toBase58());
  console.log("Recipient:", recipient.toBase58());
  console.log("Amount SOL:", amountSolStr);
  console.log("Reference:", reference.toBase58());
  if (memo) console.log("Memo:", memo);

  const tx = new Transaction();

  // Memo opcional (si el intent tenía memo, conviene incluirlo para que validateTransfer cuadre)
  if (memo) {
    tx.add(new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [],
      data: Buffer.from(memo, "utf8"),
    }));
  }

  const ix = SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: recipient,
    lamports,
  });

  // Añadir reference como key extra en la instrucción
  ix.keys.push({ pubkey: reference, isSigner: false, isWritable: false });

  tx.add(ix);

  tx.feePayer = payer.publicKey;
  const { blockhash } = await conn.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.sign(payer);

  const sig = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false });
  await conn.confirmTransaction(sig, "confirmed");

  console.log("✅ Pago enviado. Signature:", sig);
}

main().catch(e => { console.error("ERROR:", e?.message || e); process.exit(1); });