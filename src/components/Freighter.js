import {
    getAddress,
  setAllowed,
  signTransaction
} from "@stellar/freighter-api";
import { Networks } from "@stellar/stellar-sdk";

async function checkConnection() {
  const isAllowed = await setAllowed();
  if (isAllowed) {
    return isAllowed;
  }
}

const retrievePublicKey = async () => {
  const { address } = await getAddress();
  return address;
};

const userSignTransaction = async (xdr, signWith) => {
  let signedTransaction = "";
  let error = "";

  try {
    signedTransaction = await signTransaction(xdr, {
      networkPassphrase: Networks.TESTNET,
    });
  } catch (e) {
    error = e;
  }

  if (error) {
    return error;
  }

  return signedTransaction;
};

export { checkConnection, retrievePublicKey, userSignTransaction };
