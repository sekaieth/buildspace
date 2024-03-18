import * as Web3 from "@solana/web3.js";

const PROGRAM_ID = new Web3.PublicKey(
  "ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa",
);
const PROGRAM_DATA_PUBLIC_KEY = new Web3.PublicKey(
  "Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod",
);

export async function pingProgram(
  connection: Web3.Connection,
  payer: Web3.Keypair,
) {
  const transaction = new Web3.Transaction();
  const instruction = new Web3.TransactionInstruction({
    keys: [
      {
        pubkey: PROGRAM_DATA_PUBLIC_KEY,
        isSigner: false,
        isWritable: true,
      },
    ],
    programId: PROGRAM_ID,
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
