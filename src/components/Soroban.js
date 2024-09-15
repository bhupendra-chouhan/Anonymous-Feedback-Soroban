import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import { userSignTransaction } from "./Freighter";

let rpcUrl = "https://soroban-testnet.stellar.org";

let contractAddress =
  "CDAN4KQKD633XF6MCOHI7Q3DJQX4E7ENCGKUBHGQKIKJWI6DVDPX54XW";

// coverting String to ScVal form
const stringToScValString = (value) => {
  return nativeToScVal(value);
};

const numberToU64 = (value) => {
  return nativeToScVal(value, { type: "u64" });
};

let params = {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
};

// Transaction Builder Function:
async function contractInt(caller, functName, values) {
  const server = new SorobanRpc.Server(rpcUrl, { allowHttp: true });
  const sourceAccount = await server.getAccount(caller);
  const contract = new Contract(contractAddress);
  let builtTransaction;

  if (values == null) {
    builtTransaction = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functName))
      .setTimeout(30)
      .build();
  } else if (Array.isArray(values)) {
    builtTransaction = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functName, ...values))
      .setTimeout(30)
      .build();
  } else {
    builtTransaction = new TransactionBuilder(sourceAccount, params)
      .addOperation(contract.call(functName, values))
      .setTimeout(30)
      .build();
  }

  let _buildTx = await server.prepareTransaction(builtTransaction);

  let prepareTx = _buildTx.toXDR(); // pre-encoding (converting it to XDR format)

  let signedTx = await userSignTransaction(prepareTx, "TESTNET", caller);

  let tx = TransactionBuilder.fromXDR(signedTx, Networks.TESTNET);

  try {
    let sendResponse = await server.sendTransaction(tx).catch(function (err) {
      console.error("Catch-1", err);
      return err;
    });
    if (sendResponse.errorResult) {
      throw new Error("Unable to submit transaction");
    }
    if (sendResponse.status === "PENDING") {
      let getResponse = await server.getTransaction(sendResponse.hash);
      //   we will continously checking the transaction status until it gets successfull added to the blockchain ledger or it gets rejected
      while (getResponse.status === "NOT_FOUND") {
        getResponse = await server.getTransaction(sendResponse.hash);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        
        console.log(`getTransaction response: ${JSON.stringify(getResponse)}`);

      if (getResponse.status === "SUCCESS") {
        // Make sure the transaction's resultMetaXDR is not empty
        if (!getResponse.resultMetaXdr) {
          throw "Empty resultMetaXDR in getTransaction response";
        }
        // Find the return value from the contract and return it
        let transactionMeta = getResponse.resultMetaXdr;
        let returnValue = transactionMeta.v3().sorobanMeta().returnValue();
        console.log(`Transaction result: ${returnValue.value()}`);
      } else {
        throw `Transaction failed: ${getResponse.resultXdr}`;
      }
    } else {
        throw sendResponse.errorResultXdr;
    }
  } catch (err) {
    // Catch and report any errors we've thrown
    console.log("Sending transaction failed");
    console.log(JSON.stringify(err));
  }
}


// Interaction Functions: Built To interact with it's respective smart contract functions:

async function sendFeedback(caller, fbData) {  
  let value = stringToScValString(fbData);
  let result;

  try {
    result = await contractInt(caller, "send_feedback", value);
    console.log("Your Feedback ID is: ", result); // ⚠️ 'result' should be an object, but getting 'undefined'
  } catch (error) {
    console.log("Unable to create Feedback!!, ", error);
  }

  //  Converting to regular Number type:
  // let fbId = Number(result?._value?._attributes?.val?._value)
  // return fbId;
}
async function fetchFeedback(caller, fb_id) {
  let value = numberToU64(fb_id);
  let result;

    try {
        result = await contractInt(caller, "fetch_feedback", value);
        console.log(`Fetched Feedback for the feedback-Id ${fb_id} is : ${result}`); // ⚠️ 'result' should be an object, but getting 'undefined'
    } catch (error) {
        console.log("Unable to fetch Feedback!!, ", error);
    }

    //  Converting to regular string type:
    // let feedback = result?._value?._attributes?.val?._value?.toString();
    // return feedback;
}

export {
    sendFeedback,
    fetchFeedback
};
