import * as Web3 from "@solana/web3.js";
import dotenv from "dotenv";
dotenv.config();

export async function transferSol(
  connection: Web3.Connection,
  payer: Web3.Keypair,
  amount: number,
) {
  const secret = JSON.parse(process.env.PRIVATE_KEY2 ?? "") as number[];
  const secretKey = Uint8Array.from(secret);
  const receiver = Web3.Keypair.fromSecretKey(secretKey);

  console.log("Transferring SOL to", receiver.publicKey.toBase58());

  const transaction = new Web3.Transaction();
  const instruction = Web3.SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    lamports: amount * Web3.LAMPORTS_PER_SOL,
    toPubkey: receiver.publicKey,
  });

  transaction.add(instruction);

  const transactionSignature = await Web3.sendAndConfirmTransaction(
    connection,
    transaction,
    [payer],
  );
  console.log(
    `Transaction URL: https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
  );
}
