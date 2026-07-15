$ErrorActionPreference = "Stop"

$escrow = stellar contract deploy --wasm target\wasm32v1-none\release\escrow_contract.wasm --source deployer --network testnet
Write-Host "Escrow: $escrow"

$payment = stellar contract deploy --wasm target\wasm32v1-none\release\payment_contract.wasm --source deployer --network testnet
Write-Host "Payment: $payment"

$invoice = stellar contract deploy --wasm target\wasm32v1-none\release\invoice_contract.wasm --source deployer --network testnet
Write-Host "Invoice: $invoice"

$community = stellar contract deploy --wasm target\wasm32v1-none\release\community_contract.wasm --source deployer --network testnet
Write-Host "Community: $community"

$reputation = stellar contract deploy --wasm target\wasm32v1-none\release\reputation_contract.wasm --source deployer --network testnet
Write-Host "Reputation: $reputation"

"ESCROW=$escrow" > deployed_addresses.txt
"PAYMENT=$payment" >> deployed_addresses.txt
"INVOICE=$invoice" >> deployed_addresses.txt
"COMMUNITY=$community" >> deployed_addresses.txt
"REPUTATION=$reputation" >> deployed_addresses.txt
