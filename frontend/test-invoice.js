const StellarSdk = require('@stellar/stellar-sdk');

const rpcServer = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org");
const horizonServer = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const INVOICE_CONTRACT_ID = "CDMWL3Y7JMEZ2RZM2JD6MW5ZY2DHLARQT7YU5OAYPWZGDEFQXHSFKJH6";
const XLM_CONTRACT_ID = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

async function main() {
  // Use a randomly generated account as merchant and client
  const pair = StellarSdk.Keypair.random();
  console.log('Testing with account:', pair.publicKey());

  // Fund account
  console.log('Funding account...');
  await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(pair.publicKey())}`);

  const account = await horizonServer.loadAccount(pair.publicKey());

  // 1. Create Invoice
  console.log('Creating invoice...');
  const contract = new StellarSdk.Contract(INVOICE_CONTRACT_ID);
  const invoiceId = "TEST-123";
  const createArgs = [
    StellarSdk.nativeToScVal(invoiceId, { type: 'string' }),
    new StellarSdk.Address(pair.publicKey()).toScVal(),
    new StellarSdk.Address(StellarSdk.Keypair.random().publicKey()).toScVal(),
    new StellarSdk.Address(XLM_CONTRACT_ID).toScVal(),
    StellarSdk.nativeToScVal(1000000000, { type: 'i128' })
  ];

  let op = contract.call("create_invoice", ...createArgs);
  let tx = new StellarSdk.TransactionBuilder(account, { fee: StellarSdk.BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(op)
    .setTimeout(300)
    .build();

  let sim = await rpcServer.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim)) {
    console.error('Create Sim Error:', sim.error);
    return;
  }
  
  tx = StellarSdk.rpc.assembleTransaction(tx, sim).build();
  tx.sign(pair);
  
  let send = await rpcServer.sendTransaction(tx);
  console.log('Create send status:', send.status);
  
  // Wait for create
  await new Promise(r => setTimeout(r, 4000));

  // 2. Pay Invoice
  console.log('Paying invoice...');
  const account2 = await horizonServer.loadAccount(pair.publicKey());
  const payArgs = [
    StellarSdk.nativeToScVal(invoiceId, { type: 'string' })
  ];
  
  op = contract.call("pay_invoice", ...payArgs);
  tx = new StellarSdk.TransactionBuilder(account2, { fee: StellarSdk.BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE })
    .addOperation(op)
    .setTimeout(300)
    .build();

  sim = await rpcServer.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(sim)) {
    console.error('Pay Sim Error:', sim.error);
    return;
  }
  console.log('Pay Sim Success. Min fee:', sim.minResourceFee);
  
  tx = StellarSdk.rpc.assembleTransaction(tx, sim).build();
  tx.sign(pair);
  
  send = await rpcServer.sendTransaction(tx);
  console.log('Pay send status:', send.status);
  
  let status = send.status;
  while (status === "PENDING" || status === "NOT_FOUND") {
    await new Promise(r => setTimeout(r, 2000));
    const txResult = await rpcServer.getTransaction(send.hash);
    status = txResult.status;
    console.log('Tx status:', status);
    if (status === "FAILED") {
      console.log('Result XDR:', txResult.resultXdr);
    }
  }
}
main();
