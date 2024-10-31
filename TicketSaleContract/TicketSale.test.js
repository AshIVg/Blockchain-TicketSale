const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { abi, bytecode } = require('../compile');  // Ensure ABI and bytecode paths are correct
let accounts;
let ticketSale;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  //console.log("ABI:", abi); // Should log the ABI array

  // Deploy TicketSale with 100 tickets priced at 0.01 ether
  ticketSale = await new web3.eth.Contract(abi)
    .deploy({ data: bytecode, arguments: [100, web3.utils.toWei('0.01', 'ether')] })
    .send({ from: accounts[0], gas: '2000000' });
});

describe("TicketSale Contract", () => {
  
  it("allows a user to buy a ticket", async () => {
    await ticketSale.methods.buyTicket(1).send({
      from: accounts[1],
      value: web3.utils.toWei('0.01', 'ether'),
      gas: '1000000',
    });

    const ticketId = await ticketSale.methods.getTicketOf(accounts[1]).call();
    assert.equal(ticketId, 1, "Ticket ownership was not assigned correctly.");
  });

  it("allows a user to offer and accept a swap", async () => {
    await ticketSale.methods.buyTicket(1).send({
      from: accounts[1],
      value: web3.utils.toWei('0.01', 'ether'),
      gas: '1000000',
    });
    await ticketSale.methods.buyTicket(2).send({
      from: accounts[2],
      value: web3.utils.toWei('0.01', 'ether'),
      gas: '1000000',
    });

    await ticketSale.methods.offerSwap(1).send({ from: accounts[1], gas: '1000000' });
    await ticketSale.methods.acceptSwap(accounts[1]).send({ from: accounts[2], gas: '1000000' });

    const ownerTicket1 = await ticketSale.methods.getTicketOf(accounts[1]).call();
    const ownerTicket2 = await ticketSale.methods.getTicketOf(accounts[2]).call();

    assert.equal(ownerTicket1, 2, "Ticket was not correctly swapped for account 1.");
    assert.equal(ownerTicket2, 1, "Ticket was not correctly swapped for account 2.");
  });

  it("allows a user to resell a ticket and another to purchase it", async () => {
    await ticketSale.methods.buyTicket(3).send({
      from: accounts[1],
      value: web3.utils.toWei('0.01', 'ether'),
      gas: '1000000',
    });
    
    await ticketSale.methods.resaleTicket(web3.utils.toWei('0.009', 'ether')).send({
      from: accounts[1],
      gas: '1000000',
    });

    await ticketSale.methods.acceptResale(3).send({
      from: accounts[2],
      value: web3.utils.toWei('0.009', 'ether'),
      gas: '1000000',
    });

    const newOwner = await ticketSale.methods.getTicketOf(accounts[2]).call();
    assert.equal(newOwner, 3, "Ticket ownership did not transfer correctly on resale.");
  });

  it("lists tickets available for resale", async () => {
    await ticketSale.methods.buyTicket(4).send({
      from: accounts[1],
      value: web3.utils.toWei('0.01', 'ether'),
      gas: '1000000',
    });
    
    await ticketSale.methods.resaleTicket(web3.utils.toWei('0.009', 'ether')).send({
      from: accounts[1],
      gas: '1000000',
    });

    const resaleList = await ticketSale.methods.checkResale().call();
    assert(resaleList.includes('4'), "Resale ticket list does not contain the correct ticket ID.");
  });
});
