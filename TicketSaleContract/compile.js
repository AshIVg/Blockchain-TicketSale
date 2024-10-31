const path = require('path');
const fs = require('fs');
const solc = require('solc');

// Load the contract file
const contractPath = path.resolve(__dirname, 'contracts/TicketSale.sol');
const source = fs.readFileSync(contractPath, 'utf8');

// Set up the input structure for solc
const input = {
    language: 'Solidity',
    sources: {
        'TicketSale.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['abi', 'evm.bytecode'],
            },
        },
    },
};

// Compile the contract
const output = JSON.parse(solc.compile(JSON.stringify(input)));

// Extract ABI and Bytecode
const contract = output.contracts['TicketSale.sol'].TicketSale;
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

// Save ABI and Bytecode to files
fs.writeFileSync('TicketSaleABI.json', JSON.stringify(abi, null, 2));
fs.writeFileSync('TicketSaleBytecode.txt', bytecode);

console.log('ABI and Bytecode generated successfully!');
module.exports = { abi, bytecode };

