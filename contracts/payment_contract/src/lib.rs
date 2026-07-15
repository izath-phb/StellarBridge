#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, token};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum PaymentStatus {
    Success,
    Failed,
}

#[contracttype]
#[derive(Clone)]
pub struct Payment {
    pub sender: Address,
    pub receiver: Address,
    pub token: Address,
    pub amount: i128,
    pub memo: String,
    pub status: PaymentStatus,
}

#[contract]
pub struct PaymentContract;

#[contractimpl]
impl PaymentContract {
    /// Send a direct Stellar payment via Soroban
    pub fn send_payment(
        env: Env,
        sender: Address,
        receiver: Address,
        token: Address,
        amount: i128,
        memo: String,
    ) -> PaymentStatus {
        sender.require_auth();

        if amount <= 0 {
            panic!("Amount must be positive");
        }

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&sender, &receiver, &amount);

        let payment = Payment {
            sender: sender.clone(),
            receiver: receiver.clone(),
            token,
            amount,
            memo,
            status: PaymentStatus::Success,
        };

        // Store latest payment for sender (simplified)
        env.storage().instance().set(&sender, &payment);

        PaymentStatus::Success
    }

    pub fn get_last_payment(env: Env, sender: Address) -> Option<Payment> {
        env.storage().instance().get(&sender)
    }
}
