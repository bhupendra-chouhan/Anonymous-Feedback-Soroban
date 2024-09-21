// Working
#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, Env, String, Symbol, symbol_short};

const COUNT_FB : Symbol = symbol_short!("COUNT_FB");

#[contracttype]
pub enum FBbook {   
    Feedback(u64)
}


#[contracttype]
#[derive(Clone, Debug)]
pub struct Feedback {
    fb_id: u64,
    message: String,
}


#[contract]
pub struct Anonymousfeedback;


#[contractimpl]
impl Anonymousfeedback {
    pub fn send_feedback(env: Env, feedback_msg: String) -> u64 {
        let mut fb_count: u64 = env.storage().instance().get(&COUNT_FB).unwrap_or(0);
            fb_count += 1;

        let mut fb_details = Self::fetch_feedback(env.clone(), fb_count.clone());

        fb_details.fb_id = fb_count;
        fb_details.message = feedback_msg;

        env.storage().instance().set(&FBbook:: Feedback(fb_details.fb_id.clone()), &fb_details);
        env.storage().instance().set(&COUNT_FB, &fb_details.fb_id.clone());
        env.storage().instance().extend_ttl(5000, 5000);

        return fb_details.fb_id;        
    }


    pub fn fetch_feedback(env: Env, fb_id: u64) -> Feedback {
        let key = FBbook::Feedback(fb_id.clone());

        env.storage().instance().get(&key).unwrap_or(Feedback {
            fb_id: 0,
            message: String::from_str(&env, "Invalid feedback ID!")
        })
    }
}


mod test;