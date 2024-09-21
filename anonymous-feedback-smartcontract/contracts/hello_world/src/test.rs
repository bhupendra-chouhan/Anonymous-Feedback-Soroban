#![cfg(test)]

use super::*;
use soroban_sdk::{contractfile, Env};

#[test]
fn test_fetch_feedback() {
    let env = Env::default();
    let contract_id = env.register_contract(None,Anonymousfeedback);
    let client = AnonymousfeedbackClient::new(&env, &contract_id);

    let fb_id = 1;
    let message = String::from_str(&env, "Feedback message");

    client.send_feedback( &message); // calling the send_feedback smartcontract function

    let feedback = client.fetch_feedback(&fb_id); //

    assert_eq!(feedback.fb_id, fb_id); // code doesnot break if "feedback.fb_id" is equals to "fb_id"
    assert!(feedback.message == message); // code doesnot break if "feedback.message" is equals to "message"
}

#[test]
fn test_send_feedback() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Anonymousfeedback);
    let client = AnonymousfeedbackClient::new(&env, &contract_id);

    let message = String::from_str(&env, "Feedback message");
    let new_feedback = client.send_feedback(&message);

    assert!(new_feedback == 1);   
}