import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import TicketSale from './TicketSale';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      owner: '',
      ticketPrice: '',
      ticketId: '',
      offerTicketId: '',
      acceptTicketId: '',
      userTicketAddress: '',
      userTicketId: '',
      message: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  async componentDidMount() {
    const owner = await TicketSale.methods.ownerName().call();
    const ticketPrice = await TicketSale.methods.ticketPrice().call();
    this.setState({
      owner,
      ticketPrice: web3.utils.fromWei(ticketPrice, 'ether'),
    });
  }

  handleChange = async (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
    console.log(this.state);
  };

  handleSubmit = async (event) => {
    const buttonType = window.event.submitter.name;
    const { ticketId, offerTicketId, acceptTicketId, userTicketAddress } = this.state;

    if (buttonType === 'buyTicket') {
      event.preventDefault();
      this.setState({ message: 'Processing ticket purchase...' });

      alert(`
        ____Ticket Purchase Details____
        Ticket ID: ${ticketId}
        Price: ${this.state.ticketPrice} ETH
      `);

      try {
        const accounts = await web3.eth.getAccounts();
        await TicketSale.methods.buyTicket(ticketId).send({
          from: accounts[0],
          value: web3.utils.toWei(this.state.ticketPrice, 'ether'),
        });
        this.setState({ message: 'Ticket purchased successfully!' });
      } catch (error) {
        this.setState({ message: 'Error purchasing ticket.' });
      }
    } else if (buttonType === 'offerSwap') {
      event.preventDefault();
      this.setState({ message: 'Offering ticket swap...' });

      alert(`
        ____Ticket Swap Offer____
        Offering Ticket ID: ${offerTicketId}
      `);

      try {
        const accounts = await web3.eth.getAccounts();
        await TicketSale.methods.offerSwap(offerTicketId).send({
          from: accounts[0],
        });
        this.setState({ message: 'Swap offer is pending.' });
      } catch (error) {
        this.setState({ message: 'Error offering swap.' });
      }
    } else if (buttonType === 'acceptSwap') {
      event.preventDefault();
      this.setState({ message: 'Accepting swap offer...' });

      alert(`
        ____Accepting Ticket Swap____
        Accepting Ticket ID: ${acceptTicketId}
      `);

      try {
        const accounts = await web3.eth.getAccounts();
        await TicketSale.methods.acceptSwap(acceptTicketId).send({
          from: accounts[0],
        });
        this.setState({ message: 'Swap accepted successfully.' });
      } catch (error) {
        this.setState({ message: 'Error accepting swap.' });
      }
    } else if (buttonType === 'getTicketId') {
      event.preventDefault();
      this.setState({ message: 'Retrieving your ticket ID...' });

      try {
        const ticketId = await TicketSale.methods.getTicketOf(userTicketAddress).call();
        this.setState({ userTicketId: ticketId, message: `Your ticket ID is: ${ticketId}` });
      } catch (error) {
        this.setState({ message: 'Error retrieving ticket ID.' });
      }
    }
  };

  render() {
    return (
      <div>
        <h2>Ticket Sale Contract</h2>
        <p>
          This contract is owned by {this.state.owner}.
          <br />
          Ticket Price: {this.state.ticketPrice} ETH
        </p>
        <hr />
        {/* Buy Ticket Form */}
        <form onSubmit={this.handleSubmit}>
          <h4>Buy Ticket</h4>
          <div>
            <label>Enter Ticket ID</label>
            <input
              name="ticketId"
              placeholder="Enter Ticket ID"
              onChange={this.handleChange}
            />
          </div>
          <div>
            <button name="buyTicket">Buy Ticket</button>
          </div>
        </form>

        {/* Get Ticket ID Form */}
        <form onSubmit={this.handleSubmit}>
          <h4>Get Ticket ID (Enter Address)</h4>
          <div>
            <label>Enter Address</label>
            <input
              name="userTicketAddress"
              placeholder="Enter Address"
              onChange={this.handleChange}
            />
          </div>
          <div>
            <button name="getTicketId">Get Ticket ID</button>
          </div>
        </form>

        {/* Offer Swap Form */}
        <form onSubmit={this.handleSubmit}>
          <h4>Offer Swap</h4>
          <div>
            <label>Enter Ticket ID or Address</label>
            <input
              name="offerTicketId"
              placeholder="Enter Ticket ID or Address"
              onChange={this.handleChange}
            />
          </div>
          <div>
            <button name="offerSwap">Offer Swap</button>
          </div>
        </form>

        {/* Accept Swap Form */}
        <form onSubmit={this.handleSubmit}>
          <h4>Accept Swap</h4>
          <div>
            <label>Enter Ticket ID or Address</label>
            <input
              name="acceptTicketId"
              placeholder="Enter Ticket ID or Address"
              onChange={this.handleChange}
            />
          </div>
          <div>
            <button name="acceptSwap">Accept Swap</button>
          </div>
        </form>

        <hr />
        <p>{this.state.message}</p>
      </div>
    );
  }
}

export default App;
