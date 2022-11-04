// constants
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import contract from "../contracts/staking.json";
import tokenContract from "../contracts/token.json";
import walletContract from "../contracts/wallet.json";
import store from './store';


const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

export const disconnectRequest = () => {
  return {
    type: "DISCONNECT"
  };
}

export const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

export const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ADDRESS",
    payload: payload,
  };
};

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
      },
    }
    return providerOptions;
}
 
export const connectWallet = () => {
    return async(dispatch) => {
        dispatch(connectRequest());
        try {
            const web3Modal = new Web3Modal({
              cacheProvider: true,
                providerOptions: getProviderOptions() // required
            });
    
            const provider = await web3Modal.connect();
            const stakingContractAddress = process.env.REACT_APP_DOXACONTRACT_ADDRESS;
            const internalWalletAddress = process.env.REACT_APP_WALLET_ADDRESS;
            const TokencontractAddress = process.env.REACT_APP_TOKEN_ADDRESS;
           
    
            await subscribeProvider(provider, dispatch);
            
            const web3 = new Web3(provider);

            web3.eth.extend({
              methods: [
                {
                  name: "chainId",
                  call: "eth_chainId",
                  outputFormatter: web3.utils.hexToNumber
                }
              ]
            });
        
            const accounts = await web3.eth.getAccounts();
            const address = accounts[0];
        
            const instance = new web3.eth.Contract(
              contract,
              stakingContractAddress
            );
            const tokenInstance = new web3.eth.Contract(
              tokenContract,
              TokencontractAddress
            )

            const walletInstance = new web3.eth.Contract(
              walletContract,
              internalWalletAddress
            )

            if(window.ethereum && window.ethereum.networkVersion !== '5') {
              await addNetwork(5);
            }
            dispatch(
              connectSuccess({
                  address,
                  web3,
                  staking: instance,
                  token: tokenInstance,
                  wallet: walletInstance,
                  provider,
                  connected: true,
                  web3Modal
              })
            );
        } catch (e) {
            dispatch(connectFailed(e));
        }
    }
}

export const disconnect = () => {
  return async(dispatch)=> {
    const { web3Modal } = store.getState().walletConnect;
    console.log(web3Modal);
    web3Modal.clearCachedProvider();
    dispatch(disconnectRequest());
  }
}

const subscribeProvider = async(provider) => {
  if (!provider.on) {
    return;
  }

  provider.on('connect', async(id) => {
    console.log(id);
  });

  provider.on("networkChanged", async (networkId) => {
    if(networkId !== '5') {
      console.log(networkId);
      await store.dispatch(connectFailed('Please switch to Binance mainnet'));
      addNetwork(5);
    } else {
      store.dispatch(connectWallet());
    }
  });
}

export async function addNetwork(id) {
let networkData;
switch (id) {
  //bsctestnet
  case 5:
    networkData = [
      {
        chainId: "0x4",
      },
    ];

    break;
  //bscmainet
  case 1:
    networkData = [
      {
        chainId: "0x1",
      },
    ];
    break;
  default:
    break;
}
return window.ethereum.request({
  method: "wallet_switchEthereumChain",
  params: networkData,
});
}

(() => {
if(window.ethereum) {
  window.ethereum.on('networkChanged', async function(networkId){
    console.log('network change', networkId);
    if(networkId !== '5') {
      console.log(networkId);
      await store.dispatch(connectFailed('Please switch to Binance mainnet'));
      addNetwork(5);
    } else {
      store.dispatch(connectWallet());
    }
  });
}
})();
