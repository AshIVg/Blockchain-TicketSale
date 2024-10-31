// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

contract TicketSale {
    address public owner;
    uint public ticketPrice;
    uint public totalTickets;

    mapping(uint => address) public ticketOwners;
    mapping(address => uint) public ownedTickets;
    mapping(uint => uint) public resaleTickets;
    mapping(address => uint) public swapOffers;

    constructor(uint numTickets, uint price) {
        owner = msg.sender;
        ticketPrice = price;
        totalTickets = numTickets;
    }

    function buyTicket(uint ticketId) public payable {
        require(ticketId > 0 && ticketId <= totalTickets, "Invalid ticket ID.");
        require(msg.value == ticketPrice, "Incorrect Ether sent.");
        require(ticketOwners[ticketId] == address(0), "Ticket already sold.");
        require(ownedTickets[msg.sender] == 0, "You already own a ticket.");

        ticketOwners[ticketId] = msg.sender;
        ownedTickets[msg.sender] = ticketId;
    }

    function getTicketOf(address person) public view returns (uint) {
        return ownedTickets[person];
    }

    function offerSwap(uint ticketId) public {
        require(ownedTickets[msg.sender] == ticketId, "You don't own this ticket.");
        swapOffers[msg.sender] = ticketId;
    }

    function acceptSwap(address partner) public {
        require(swapOffers[partner] != 0, "No swap offer from partner.");
        require(ownedTickets[msg.sender] != 0, "You don't own a ticket.");

        uint partnerTicket = swapOffers[partner];
        uint myTicket = ownedTickets[msg.sender];

        // Swap tickets
        ticketOwners[partnerTicket] = msg.sender;
        ticketOwners[myTicket] = partner;

        ownedTickets[msg.sender] = partnerTicket;
        ownedTickets[partner] = myTicket;

        delete swapOffers[partner];
    }

    function resaleTicket(uint price) public {
        uint ticketId = ownedTickets[msg.sender];
        require(ticketId != 0, "You don't own a ticket.");
        resaleTickets[ticketId] = price;
    }

    function acceptResale(uint ticketId) public payable {
        uint resalePrice = resaleTickets[ticketId];
        require(resalePrice > 0, "Ticket not for resale.");
        require(msg.value == resalePrice, "Incorrect Ether sent.");
        require(ownedTickets[msg.sender] == 0, "You already own a ticket.");

        address previousOwner = ticketOwners[ticketId];
        uint saleProceeds = (resalePrice * 90) / 100;
        payable(previousOwner).transfer(saleProceeds);
        payable(owner).transfer(resalePrice - saleProceeds);

        ticketOwners[ticketId] = msg.sender;
        ownedTickets[msg.sender] = ticketId;
        delete resaleTickets[ticketId];
        delete ownedTickets[previousOwner];
    }

    function checkResale() public view returns (uint[] memory) {
        uint resaleCount = 0;
        for (uint i = 1; i <= totalTickets; i++) {
            if (resaleTickets[i] > 0) resaleCount++;
        }

        uint[] memory ticketsForResale = new uint[](resaleCount);
        uint index = 0;
        for (uint i = 1; i <= totalTickets; i++) {
            if (resaleTickets[i] > 0) {
                ticketsForResale[index] = i;
                index++;
            }
        }
        return ticketsForResale;
    }
}
