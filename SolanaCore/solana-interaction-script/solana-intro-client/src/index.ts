import * as Web3 from "@solana/web3.js";
import * as fs from "fs";
import { pingProgram } from "./pingExternalProgram";
import { transferSol } from "./transferSol";
import dotenv from "dotenv";
dotenv.config();

async function airdropSol(signer: Web3.Keypair, connection: Web3.Connection) {
  const balance = await connection.getBalance(signer.publicKey);
  console.log("Current balance is:", balance / Web3.LAMPORTS_PER_SOL), "SOL";

  if (balance / Web3.LAMPORTS_PER_SOL < 1) {
    console.log("Airdropping 1 SOL");
    const airdropSig = await connection.requestAirdrop(
      signer.publicKey,
      Web3.LAMPORTS_PER_SOL,
    );

    const latestBlockhash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      signature: airdropSig,
    });

    const newBalance = await connection.getBalance(signer.publicKey);
    console.log("New balance is:", newBalance / Web3.LAMPORTS_PER_SOL, "SOL");
    return balance;
  }

  console.log("Did not airdrop SOL, current balance is >= 1 SOL. Skipping...");
  return balance;
}

export async function initializeKeypairs(
  connection: Web3.Connection,
): Promise<Web3.Keypair> {
  if (!process.env.PRIVATE_KEY) {
    console.log("Generating new keypair... 🗝️");
    const signer = Web3.Keypair.generate();

    console.log("Creating .env file... 📁");
    fs.writeFileSync(".env", `PRIVATE_KEY=[${signer.secretKey.toString()}]`);

    await airdropSol(signer, connection);

    return signer;
  }

  if (!process.env.PRIVATE_KEY2) {
    console.log("Generating 2nd keypair... 🗝️");
    const signer = Web3.Keypair.generate();

    console.log("Updating .env file... 📁");
    fs.appendFileSync(
      ".env",
      `PRIVATE_KEY2=[${signer.secretKey.toString()}]\n`,
    );

    return signer;
  }

  console.log("Using existing keypairs... 🗝️");
  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[];
  const secret2 = JSON.parse(process.env.PRIVATE_KEY2 ?? "") as number[];
  const secretKey = Uint8Array.from(secret);
  const secretKey2 = Uint8Array.from(secret2);
  const signer = Web3.Keypair.fromSecretKey(secretKey);
  const signer2 = Web3.Keypair.fromSecretKey(secretKey2);
  await airdropSol(signer, connection);
  return signer;
}

async function main() {
  const connection = new Web3.Connection(Web3.clusterApiUrl("devnet"));
  const signer = await initializeKeypairs(connection);
  console.log("Your public key is: ", signer.publicKey.toBase58());
  await pingProgram(connection, signer);
  await transferSol(connection, signer, 0.01);
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
