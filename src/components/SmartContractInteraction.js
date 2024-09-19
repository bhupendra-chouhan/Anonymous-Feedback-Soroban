import {Contract, SorobanRpc, TransactionBuilder, nativeToScVal, scValToNative, xdr, Networks, BASE_FEE,  } from "@stellar/stellar-sdk";
import { userSignTransaction } from "./Freighter";

// function smartContractInteraction(caller, functName, values) {
  // const { activeChain, server, address } = useSorobanReact();

  let rpcUrl = "https://soroban-testnet.stellar.org";

  let contractAddress =
    "CBG7QFA5CWUIJ6QQQSCWS33UNV6TN3EVQHRZLR5VYJWT5X73J6Y46U7A";

  // coverting String to ScVal form
  const stringToScValString = (value) => {
    return nativeToScVal(value); // XDR format conversion
  };

  const numberToU64 = (value) => {
    return nativeToScVal(value, { type: "u64" });
  };

  let params = {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  };

  const contractInt = async (caller, functName, values) => {
    // try {
      const server = new SorobanRpc.Server(rpcUrl, { allowHttp: true });
      const sourceAccount = await server.getAccount(caller);

      // Create a contract instance
      const contract = new Contract(contractAddress);

      let transaction;

      // Prepare the transaction
      if (values == null) {
        transaction = new TransactionBuilder(sourceAccount, params)
          .addOperation(contract.call(functName))
          .setTimeout(30)
          .build();
      } else if (Array.isArray(values)) {
        transaction = new TransactionBuilder(sourceAccount, params)
          .addOperation(contract.call(functName, ...values))
          .setTimeout(30)
          .build();
      } else {
        transaction = new TransactionBuilder(sourceAccount, params)
          .addOperation(contract.call(functName, values))
          .setTimeout(30)
          .build();
      }

      // Sign and submit the transaction
      const _buildTx = await server.prepareTransaction(transaction);


      let prepareTx = _buildTx.toXDR(); // pre-encoding (converting it to XDR format)

      let signedTx = await userSignTransaction(prepareTx, "TESTNET", caller);

      let tx = TransactionBuilder.fromXDR(signedTx, Networks.TESTNET);

      const txResult = await server.sendTransaction(tx);

      
      
      // Wait for the transaction to be confirmed
      let txResponse = await server.getTransaction(txResult.hash);
      console.log(txResult.hash);

      while (txResponse.status === "NOT_FOUND") {
        txResponse = await server.getTransaction(txResult.hash);
        console.log(txResponse.hash); // undefined value
        console.log(txResponse.status); // notfound
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      if (txResponse.status === "SUCCESS") {
        // Extract and convert the result
        const scVal = xdr.ScVal.fromXDR(
          txResponse.returnValue,
          "base64"
        );
        const nativeValue = scValToNative(scVal);
        console.log(nativeValue);
  
        let result = nativeValue;
        return result;
      }


    // } catch (error) {
    //   console.error("Error invoking smart contract:", error);
    // }
  };
// }

async function sendFeedback(caller, fb_string) {
  let value = stringToScValString(fb_string); //XDR format  let result;

  try {
    let result = await contractInt(caller, "send_feedback", value);
    console.log("Your Feedback ID is: ", result); // ⚠️ 'result' should be an object, but getting 'undefined'
  } catch (error) {
    console.log("Unable to create Feedback!!, ", error);
  }
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
}

export { sendFeedback, fetchFeedback };

