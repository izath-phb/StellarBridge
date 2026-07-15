#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, String, token, vec, Vec};

#[contracttype]
#[derive(Clone)]
pub struct CommunityFund {
    pub name: String,
    pub admin: Address,
    pub token: Address,
    pub balance: i128,
    pub total_votes: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct Proposal {
    pub title: String,
    pub amount: i128,
    pub votes_for: u64,
    pub votes_against: u64,
    pub executed: bool,
}

#[contract]
pub struct CommunityContract;

#[contractimpl]
impl CommunityContract {
    pub fn create_fund(
        env: Env,
        name: String,
        admin: Address,
        token: Address,
    ) -> Symbol {
        admin.require_auth();
        let fund_key = Symbol::new(&env, "FUND");
        let fund = CommunityFund {
            name,
            admin,
            token,
            balance: 0,
            total_votes: 0,
        };
        env.storage().instance().set(&fund_key, &fund);
        fund_key
    }

    pub fn deposit(env: Env, fund_key: Symbol, depositor: Address, amount: i128) {
        depositor.require_auth();
        let mut fund: CommunityFund = env.storage().instance().get(&fund_key).unwrap();

        let token_client = token::Client::new(&env, &fund.token);
        token_client.transfer(&depositor, &env.current_contract_address(), &amount);

        fund.balance += amount;
        env.storage().instance().set(&fund_key, &fund);
    }

    pub fn vote(env: Env, fund_key: Symbol, proposal_key: Symbol, voter: Address, in_favor: bool) {
        voter.require_auth();
        let mut proposal: Proposal = env.storage().instance().get(&proposal_key).unwrap();

        if in_favor {
            proposal.votes_for += 1;
        } else {
            proposal.votes_against += 1;
        }

        env.storage().instance().set(&proposal_key, &proposal);
    }

    pub fn withdraw(env: Env, fund_key: Symbol, proposal_key: Symbol) {
        let mut fund: CommunityFund = env.storage().instance().get(&fund_key).unwrap();
        fund.admin.require_auth();

        let mut proposal: Proposal = env.storage().instance().get(&proposal_key).unwrap();

        if proposal.executed {
            panic!("Proposal already executed");
        }
        if proposal.votes_for <= proposal.votes_against {
            panic!("Proposal did not pass");
        }

        let token_client = token::Client::new(&env, &fund.token);
        token_client.transfer(&env.current_contract_address(), &fund.admin, &proposal.amount);

        fund.balance -= proposal.amount;
        proposal.executed = true;

        env.storage().instance().set(&fund_key, &fund);
        env.storage().instance().set(&proposal_key, &proposal);
    }
}
