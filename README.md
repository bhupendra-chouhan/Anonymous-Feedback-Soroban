## Project Name: Anonymous Feedback dApp

A full-stack decentralized application (dApp) built on the Stellar blockchain. Users can utilize this dApp to register anonymous feedback. The smart contract includes logic to automatically assign unique IDs to each newly created feedback, and these registered feedback entries can be accessed using their respective feedback IDs.

---
## Technologies Used:
- Smartcontract : Rust, Soroban-SDK
- Wallet : Freighter (available as a chrome-extension)
- Frontend : ReactJS, TailwindCSS
- Integeration : Stellar-SDK
---

## Smart-contract

- All the materials related to the smart contract can be found in the ```anonymous-feedback-smartcontract``` folder:

- The path to the smart contract is:  ```./anonymous-feedback-smartcontract/contracts/hello_world/src/lib.rs```


### Deployed smartcontract address: ```CDAN4KQKD633XF6MCOHI7Q3DJQX4E7ENCGKUBHGQKIKJWI6DVDPX54XW```

### Functions written inside the Anonymous Feedback Smartcontract: 

1. ```send_feedback(env: Env, feedback_msg: String) -> u64``` : Takes a feedback message (of type ```String```) as an argument, assigns a unique ID to each feedback, stores the feedback on the blockchain, and returns the feedback ID for the newly created entry. 

2. ```fetch_feedback(env: Env, fb_id: u64) -> Feedback``` : Takes a feedback ID (of type ```u64```) as an argument and returns the feedback associated with the specified ID.

---

## ⚠️ Issue:

### Title: 
Getting ```undefined``` When Fetching Data from the Blockchain Using Stellar-SDK

### Note:
Both setter (```send_feedback()```) and getter (```fetch_feedback()```) functions work as expected when invoked from the terminal using Stellar-CLI.

### Issue Description: 
The getter smart contract function (```fetch_feedback()```) returns undefined when invoked using the JavaScript interaction function (```fetchFeedback()```) built with Stellar-SDK (located in the Soroban.js file). This issue persists despite the function being correctly invoked.

Additionally, while I am able to store data on the blockchain using the setter smart contract function (```send_feedback()```) through the ```sendFeedback()``` interaction function, this function also returns undefined instead of the expected object.
 
The transaction builder function and all interaction functions are implemented in the Soroban.js file.
- Path to ```Soroban.js``` file: ```src/components/Soroban.js```

### NOTE: 
I have followed the Stellar documentation mentioned below to create the transaction builder function:
https://developers.stellar.org/docs/build/guides/transactions/invoke-contract-tx-sdk

---

## Screenshots of Issue:
1. Creating a Feedback and Storing it onchain by invoking the ```send_feedback()``` smartcontract function:
   ![image](https://github.com/user-attachments/assets/83bfebed-4b14-4ff9-b38d-575c9e89f9e2)

   Output:
   ![image](https://github.com/user-attachments/assets/e0623442-1a5f-4773-8a53-adb7ecf90f9d)

2. Fetching a feedback with feedback-id ```4``` by invoking the ```fetch_feedback()``` smartcontract function:
   ![image](https://github.com/user-attachments/assets/1baba311-3c23-425e-977f-da052c90af54)

   Output:
   ![image](https://github.com/user-attachments/assets/c33ae590-1a3a-44c2-9501-35b92b1f9dda)




