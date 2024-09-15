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
    let sendTx = await server.sendTransaction(tx).catch(function (err) {
      console.error("Catch-1", err);
      return err;
    });
    if (sendTx.errorResult) {
      throw new Error("Unable to submit transaction");
    }
    if (sendTx.status === "PENDING") {
      let txResponse = await server.getTransaction(sendTx.hash);
      //   we will continously checking the transaction status until it gets successfull added to the blockchain ledger or it gets rejected
      while (txResponse.status === "NOT_FOUND") {
        txResponse = await server.getTransaction(sendTx.hash);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      if (txResponse.status === "SUCCESS") {
        let result = txResponse.returnValue;
        return result;
      }
    }
  } catch (err) {
    console.log("Catch-2", err);
    return;
  }
}


// function to interact with it's respective smart contract functions:

async function sendFeedback(caller, fbData) {  
  let value = stringToScValString(fbData);
  let result;

  try {
    result = await contractInt(caller, "send_feedback", value);
    console.log("Your Feedback ID is: ", result); // 'result' should be an object, but getting 'undefined'
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
        console.log(`Fetched Feedback for the feedback-Id ${fb_id} is : ${result}`); // 'result' should be an object, but getting 'undefined'
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
