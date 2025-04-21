const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Caminho para o arquivo de configuração da rede
const ccpPath = path.resolve(__dirname, '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

const connectToNetwork = async (userId) => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Conectar ao gateway
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: userId,
            discovery: { enabled: true, asLocalhost: true }, 
        });

        // Obter a rede e o contrato
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('certContract');

        return { contract, gateway };

    } catch (error) {
        console.error(`Erro ao conectar à rede: ${error}`);
        throw error;
    }
};

module.exports = { connectToNetwork };