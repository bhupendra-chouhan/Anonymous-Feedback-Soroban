// Working
#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, String, Symbol};

const COUNT_FB: Symbol = symbol_short!("COUNT_FB");

#[contracttype]
pub enum FBbook {
    Feedback(u64),
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Feedback {
    fb_id: u64,
    message: String,
}

impl Feedback {
    pub fn new(fb_id: u64, message: String) -> Feedback {
        Feedback { fb_id, message }
    }
}

#[contract]
pub struct Anonymousfeedback;

#[contractimpl]
impl Anonymousfeedback {
    pub fn send_feedback(env: Env, feedback_msg: String) -> u64 {
        let mut fb_count: u64 = env.storage().instance().get(&COUNT_FB).unwrap_or(0);
        fb_count += 1;

        let fb_details = Feedback::new(fb_count.clone(), feedback_msg.clone());

        env.storage()
            .instance()
            .set(&FBbook::Feedback(fb_details.fb_id.clone()), &fb_details);
        env.storage()
            .instance()
            .set(&COUNT_FB, &fb_details.fb_id.clone());
        env.storage().instance().extend_ttl(5000, 5000);

        return fb_details.fb_id;
    }
}

mod test;
