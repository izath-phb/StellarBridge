const S = require('@stellar/stellar-sdk');
const k = S.Keypair.random();
console.log(k.publicKey());
console.log(k.secret());
