import * as StellarSdk from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";

export const rpcServer = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org");
export const horizonServer = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

export const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
export const XLM_CONTRACT_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
export const ESCROW_CONTRACT_ID = "CCSHPTGDATNG4RIPNAJ4JD5F43KNN3ZLA3ENPIZDS7C2UVT4VJK5AIVG";
export const INVOICE_CONTRACT_ID = "CDMWL3Y7JMEZ2RZM2JD6MW5ZY2DHLARQT7YU5OAYPWZGDEFQXHSFKJH6";
export const COMMUNITY_CONTRACT_ID = "CC5CE6IUUID5ZOACSNB6GB7D3TFHKZAWYEBQOUA47XOIH727RBYM5AWC";
export const PAYMENT_CONTRACT_ID = "CCNNUKX6IU4JFHP2NYHOAZ3Q7EJHPSUDJDZDZ5R3AP2SYCHIF7Z5C6XI";

export async function readSorobanContract(publicKey: string, contractId: string, method: string, args: StellarSdk.xdr.ScVal[]) {
  const account = await horizonServer.loadAccount(publicKey);
  const contract = new StellarSdk.Contract(contractId);
  const op = contract.call(method, ...args);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(300)
    .build();

  const simulatedTx = await rpcServer.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(simulatedTx)) {
    throw new Error(`Simulation failed: ${simulatedTx.error}`);
  }
  return simulatedTx.result?.retval;
}

export async function submitSorobanTransaction(publicKey: string, contractId: string, method: string, args: StellarSdk.xdr.ScVal[]) {
  const account = await horizonServer.loadAccount(publicKey);
  
  const contract = new StellarSdk.Contract(contractId);
  const op = contract.call(method, ...args);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(op)
    .setTimeout(300)
    .build();

  // Simulate the transaction
  const simulatedTx = await rpcServer.simulateTransaction(tx);
  
  if (StellarSdk.rpc.Api.isSimulationError(simulatedTx)) {
    throw new Error(`Simulation failed: ${simulatedTx.error}`);
  }

  // Assemble the transaction (adds resources and fee from simulation)
  const assembledTx = StellarSdk.rpc.assembleTransaction(tx, simulatedTx);
  
  // Sign with Freighter
  const xdr = assembledTx.build().toXDR();
  const signedResponse = await signTransaction(xdr, { networkPassphrase: NETWORK_PASSPHRASE });
  
  if (signedResponse.error) {
    throw new Error(signedResponse.error.toString());
  }

  const signedTx = StellarSdk.TransactionBuilder.fromXDR(
    signedResponse.signedTxXdr,
    NETWORK_PASSPHRASE
  ) as StellarSdk.Transaction;

  // Submit to Soroban RPC
  const sendRes = await rpcServer.sendTransaction(signedTx);
  
  if (sendRes.status === "ERROR") {
    throw new Error(`Send failed: ${JSON.stringify(sendRes)}`);
  }

  // Wait for result
  let status: string = sendRes.status;
  let txResult;
  let attempts = 0;
  
  while ((status === "PENDING" || status === "NOT_FOUND") && attempts < 20) {
    await new Promise(r => setTimeout(r, 2000));
    txResult = await rpcServer.getTransaction(sendRes.hash);
    status = txResult.status;
    attempts++;
  }
  
  if (status !== "SUCCESS") {
    throw new Error(`Transaction failed or timed out. Status: ${status}`);
  }

  return txResult;
}
