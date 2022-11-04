import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

const getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            5: "https://goerli.infura.io/v3/ea95b0776037479abf7a62fc14b55188",
            1: "https://mainnet.infura.io/v3/ea95b0776037479abf7a62fc14b55188"
          }
        }
      }
    }
 
    return providerOptions;
}

const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: getProviderOptions() // required
});


const initialState = {
    loading: false,
    address: "",
    connected: false,
    web3: null,
    provider: null,
    staking: null,
    errorMsg: null,
    token: null,
    wallet: null,
    web3Modal
}

const walletConnectReducer = (state = initialState, action) => {
    switch (action.type) {
        case "CONNECTION_REQUEST":
            return {
                ...initialState,
                loading: true,
            };
        case "CONNECTION_SUCCESS":
            return {
                ...state,
                loading: false,
                address: action.payload.address,
                staking: action.payload.staking,
                web3: action.payload.web3,
                token: action.payload.token,
                wallet: action.payload.wallet,
                provider: action.payload.provider,
                connected: action.payload.connected
            };
        case "CONNECTION_FAILED":
            return {
                ...initialState,
                loading: false,
                errorMsg: action.payload,
            };
        case "UPDATE_ADDRESS":
            console.log(action.payload.address);
            return {
                ...state,
                address: action.payload.address,
            };
        case "DISCONNECT":
            console.log('disconnect');
            return {
                ...initialState
            };
        default:
            return state;
    }
};

export default walletConnectReducer;
  