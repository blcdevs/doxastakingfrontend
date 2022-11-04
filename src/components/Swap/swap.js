import React, { Component } from "react";
import eth from "../../assets/eth.png";
import transfer from "../../assets/transfer.png";
import buyLoader from "../../assets/doxa-ico-loader.gif";
import { connect } from "react-redux";
import { connectWallet } from '../../redux/WalletAction';
import miniLogo from "../../assets/logo.png";
import "./scss/bs.css";

class Buydoxa extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '0',
      doxaValue: 0
    }
  }

  componentDidMount() {
    const { web3Modal } = this.props.wallet
    if (web3Modal.cachedProvider) {
      this.props.connectWallet();
    }
  }

  connectToWallet = async () => {
    await this.props.connectWallet();
  }

  buyToken = async () => {
        const queryParams = new URLSearchParams(window.location.search);
        const id = queryParams.get('email');

    let inputValue = parseFloat(this.state.inputValue);
  
    if (inputValue >= 0.00001 && inputValue <= 10) {
      const { web3, doxa, wallet, address } = this.props.wallet;
      const value = this.state.inputValue.toString();
      const buyValue = web3.utils.toWei(value, 'ether');
      const tokenPrice = web3.utils.toWei('0.00001', 'ether');
      const totalTokens = (web3.utils.toBN(buyValue).div(web3.utils.toBN(tokenPrice))).toString();
      try {
        this.setState({ loading: true })
       
        const res = await wallet.methods.swapEthToDoxa(id).send({ from: address, value: buyValue });

      
        this.setState({ loading: false })

      } catch (err) {
        this.setState({ loading: false })

        if (err.message) {
          alert(err.message)
        } else {
          alert("Something went wrong!")
        }
      }
    } else {
      alert("ETH should be between 0.00001 and 10");
      return
    }
  }

  updateInputValue = async (e) => {
    let totalTokens;
    if (e.target.value != '') {
      totalTokens = parseFloat(e.target.value) / 0.00001;
    }
    this.setState({
      inputValue: e.target.value,
      doxaValue: totalTokens
    });
  }

  render() {
    return (
      <div className="bs-container h-100">
        <div className="bs-main">
          <h2>swap your crypto</h2>
          <div className="bs-input">
            <div className="inpt-cont center mb-3">
              <label>Enter ETH</label>
              <input type="number" value={this.state.inputValue} onChange={e => this.updateInputValue(e)} />
            </div>
            <div className="img-cont">
              <img src={eth} alt="eth" />
              <p>ETH</p>
            </div>
          </div>
          {/* image */}
          <img src={transfer} className="transfer" alt="transfer" />
          <div className="bs-input">
            <div className="inpt-cont center">
              <p>{this.state.doxaValue}</p>
            </div>
            <div className="img-cont">
              <img src={miniLogo} alt="miniLogo" />
              <p>DOXAZO</p>
            </div>
          </div>
          {/* btn */}
          <button className="bs-btn" disabled={this.state.loading} onClick={() => this.props.wallet.connected ? this.buyToken() : this.connectToWallet()}>{this.props.wallet.connected ? this.state.loading ? 
            <span>Processing <img src={buyLoader}></img></span>
          : 'Buy' : 'PROCEED TO SWAP'}</button>
        </div>

       
      </div>
    );
  }
}

const mapStateToProps = state => ({
  wallet: state.walletConnect
});



export default connect(mapStateToProps, { connectWallet })(Buydoxa);
