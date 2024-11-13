const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const ccpPath = path.resolve(__dirname, '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

const connectToNetwork = async (userId) => {
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: userId,
        discovery: { enabled: true, asLocalhost: true },
    });

     // Carrega o arquivo de conexão
     const ccpPath =  process.env.CONNECTION_JSON_PATH;
     const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
 

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('certContract');

    return { contract, gateway };
}

module.exports = { connectToNetwork };
