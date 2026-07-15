#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol};

#[contracttype]
#[derive(Clone, Debug)]
pub struct ReputationScore {
    pub total_transactions: u64,
    pub successful_payments: u64,
    pub escrows_completed: u64,
    pub trust_score: u32,  // 0-100
}

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    pub fn initialize_reputation(env: Env, user: Address) {
        user.require_auth();
        let key = user.clone();
        let score = ReputationScore {
            total_transactions: 0,
            successful_payments: 0,
            escrows_completed: 0,
            trust_score: 100,
        };
        env.storage().instance().set(&key, &score);
    }

    pub fn record_transaction(env: Env, user: Address, success: bool) {
        // Only callable by authorized protocol contracts (simplified for MVP)
        let mut score: ReputationScore = env.storage().instance().get(&user).unwrap_or(ReputationScore {
            total_transactions: 0,
            successful_payments: 0,
            escrows_completed: 0,
            trust_score: 100,
        });

        score.total_transactions += 1;
        if success {
            score.successful_payments += 1;
        }

        // Recalculate trust score
        if score.total_transactions > 0 {
            let success_rate = (score.successful_payments * 100) / score.total_transactions;
            score.trust_score = success_rate as u32;
        }

        env.storage().instance().set(&user, &score);
    }

    pub fn record_escrow_completion(env: Env, user: Address) {
        let mut score: ReputationScore = env.storage().instance().get(&user).unwrap_or(ReputationScore {
            total_transactions: 0,
            successful_payments: 0,
            escrows_completed: 0,
            trust_score: 100,
        });

        score.escrows_completed += 1;
        score.total_transactions += 1;
        score.successful_payments += 1;

        // Bonus for escrow completion
        if score.trust_score < 100 {
            score.trust_score = (score.trust_score + 1).min(100);
        }

        env.storage().instance().set(&user, &score);
    }

    pub fn get_reputation(env: Env, user: Address) -> ReputationScore {
        env.storage().instance().get(&user).unwrap_or(ReputationScore {
            total_transactions: 0,
            successful_payments: 0,
            escrows_completed: 0,
            trust_score: 100,
        })
    }
}
