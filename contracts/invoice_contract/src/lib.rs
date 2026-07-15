#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, String, token};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum InvoiceStatus {
    Pending,
    Paid,
    Completed,
}

#[contracttype]
#[derive(Clone)]
pub struct Invoice {
    pub id: String,
    pub merchant: Address,
    pub client: Address,
    pub token: Address,
    pub amount: i128,
    pub status: InvoiceStatus,
}

#[contract]
pub struct InvoiceContract;

#[contractimpl]
impl InvoiceContract {
    pub fn create_invoice(
        env: Env,
        invoice_id: String,
        merchant: Address,
        client: Address,
        token: Address,
        amount: i128,
    ) -> Symbol {
        merchant.require_auth();

        let key = Symbol::new(&env, "INVOICE");
        let invoice = Invoice {
            id: invoice_id,
            merchant,
            client,
            token,
            amount,
            status: InvoiceStatus::Pending,
        };

        env.storage().instance().set(&key, &invoice);
        key
    }

    pub fn pay_invoice(env: Env, invoice_key: Symbol) {
        let mut invoice: Invoice = env.storage().instance().get(&invoice_key).unwrap();
        invoice.client.require_auth();

        if invoice.status != InvoiceStatus::Pending {
            panic!("Invoice already processed");
        }

        let token_client = token::Client::new(&env, &invoice.token);
        token_client.transfer(&invoice.client, &invoice.merchant, &invoice.amount);

        invoice.status = InvoiceStatus::Paid;
        env.storage().instance().set(&invoice_key, &invoice);
    }

    pub fn verify_invoice(env: Env, invoice_key: Symbol) -> InvoiceStatus {
        let invoice: Invoice = env.storage().instance().get(&invoice_key).unwrap();
        invoice.status
    }
}
