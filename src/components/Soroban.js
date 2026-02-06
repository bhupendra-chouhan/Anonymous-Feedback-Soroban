/* Soroban.js */

import {
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  rpc as StellarRpc,
} from "@stellar/stellar-sdk";

import { userSignTransaction } from "./Freighter";

/* ================= Config ================= */

const RPC_URL = "https://soroban-testnet.stellar.org:443";
const NETWORK = Networks.TESTNET;

const CONTRACT_ADDRESS =
  "CBK6DMOHM7I7G3IDNQS7JAJOCJ4XVO5SLXP6KHQAWNVTKW5YHETSE5UA";

const server = new StellarRpc.Server(RPC_URL);

const TX_PARAMS = {
  fee: BASE_FEE,
  networkPassphrase: NETWORK,
};

/* ================= Helpers ================= */

const stringToScVal = (value) => nativeToScVal(value);
const numberToU64 = (value) => nativeToScVal(value, { type: "u64" });

/* ================= Core Contract Interaction ================= */

async function contractInt(caller, fnName, values) {
  // 1 Load account
  const sourceAccount = await server.getAccount(caller);
  const contract = new Contract(CONTRACT_ADDRESS);

  // 2 Build tx
  const builder = new TransactionBuilder(sourceAccount, TX_PARAMS);

  if (Array.isArray(values)) {
    builder.addOperation(contract.call(fnName, ...values));
  } else if (values !== undefined && values !== null) {
    builder.addOperation(contract.call(fnName, values));
  } else {
    builder.addOperation(contract.call(fnName));
  }

  const tx = builder.setTimeout(30).build();

  // 3 Prepare transaction (legacy Soroban flow)
  const preparedTx = await server.prepareTransaction(tx);

  // 4 Convert to XDR
  const xdr = preparedTx.toXDR();

  // 5 Sign with Freighter
  const signed = await userSignTransaction(xdr, caller);


  const signedTx = TransactionBuilder.fromXDR(signed.signedTxXdr, NETWORK);

  // 6 Send tx
  const send = await server.sendTransaction(signedTx);

  // 7 Poll
  for (let i = 0; i < 10; i++) {
    const res = await server.getTransaction(send.hash);

    if (res.status === "SUCCESS") {
      if (res.returnValue) {
        return scValToNative(res.returnValue);
      }
      return null;
    }

    if (res.status === "FAILED") {
      throw new Error("Transaction failed");
    }

    await new Promise((r) => setTimeout(r, 1000));
  }

  throw new Error("Transaction timeout");
}

/* ================= Contract Functions ================= */

async function sendFeedback(caller, feedbackText) {
  try {
    const value = stringToScVal(feedbackText);
    const result = await contractInt(caller, "send_feedback", value);

    console.log("Feedback ID:", Number(result));
    return Number(result);
  } catch (error) {
    console.error("sendFeedback failed:", error);
    throw error;
  }
}

async function fetchFeedback(caller, feedbackId) {
  try {
    const value = numberToU64(feedbackId);
    const result = await contractInt(caller, "fetch_feedback", value);

    console.log("Fetched feedback:", result.message.toString());
    return result.message.toString();
  } catch (error) {
    console.error("fetchFeedback failed:", error);
    throw error;
  }
}

/* ================= Exports ================= */

export { sendFeedback, fetchFeedback };
