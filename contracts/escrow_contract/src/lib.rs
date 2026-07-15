#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Symbol, token};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowStatus {
    Created,
    Funded,
    Approved,
    Released,
    Refunded,
}

#[contracttype]
#[derive(Clone)]
pub struct Escrow {
    pub client: Address,
    pub freelancer: Address,
    pub token: Address,
    pub amount: i128,
    pub status: EscrowStatus,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn create_escrow(
        env: Env,
        client: Address,
        freelancer: Address,
        token: Address,
        amount: i128,
    ) -> Symbol {
        client.require_auth();

        let escrow_id = Symbol::new(&env, "ESCROW_1"); // Simplified ID generation for MVP

        let escrow = Escrow {
            client: client.clone(),
            freelancer,
            token,
            amount,
            status: EscrowStatus::Created,
        };

        env.storage().instance().set(&escrow_id, &escrow);

        escrow_id
    }

    pub fn deposit_payment(env: Env, escrow_id: Symbol) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.client.require_auth();

        if escrow.status != EscrowStatus::Created {
            panic!("Escrow is already funded or in another state");
        }

        // Transfer funds from client to the contract
        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(&escrow.client, &env.current_contract_address(), &escrow.amount);

        escrow.status = EscrowStatus::Funded;
        env.storage().instance().set(&escrow_id, &escrow);
    }

    pub fn approve_release(env: Env, escrow_id: Symbol) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.client.require_auth();

        if escrow.status != EscrowStatus::Funded {
            panic!("Escrow is not funded");
        }

        escrow.status = EscrowStatus::Approved;
        env.storage().instance().set(&escrow_id, &escrow);
    }

    pub fn release_payment(env: Env, escrow_id: Symbol) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        // Allow either client or approved status to release
        if escrow.status != EscrowStatus::Approved {
            panic!("Escrow must be approved first");
        }

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.freelancer,
            &escrow.amount,
        );

        escrow.status = EscrowStatus::Released;
        env.storage().instance().set(&escrow_id, &escrow);
    }

    pub fn refund_payment(env: Env, escrow_id: Symbol) {
        let mut escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.freelancer.require_auth(); // Only freelancer can explicitly refund back to client in this flow for safety

        if escrow.status != EscrowStatus::Funded {
            panic!("Escrow must be funded to refund");
        }

        let token_client = token::Client::new(&env, &escrow.token);
        token_client.transfer(
            &env.current_contract_address(),
            &escrow.client,
            &escrow.amount,
        );

        escrow.status = EscrowStatus::Refunded;
        env.storage().instance().set(&escrow_id, &escrow);
    }

    pub fn get_escrow_status(env: Env, escrow_id: Symbol) -> EscrowStatus {
        let escrow: Escrow = env.storage().instance().get(&escrow_id).unwrap();
        escrow.status
    }
}
