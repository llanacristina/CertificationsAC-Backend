require('dotenv').config();
const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');

const enrollAdmin = async () => {
    try {
        const caURL = 'https://localhost:7054';
        const ca = new FabricCAServices(caURL);

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const adminExists = await wallet.get('admin');
        if (adminExists) {
            console.log('Admin já existe no wallet.');
            return;
        }

        const enrollmentID = 'admin';
        const enrollmentSecret = process.env.ADMIN_PASSWORD;

        if (!enrollmentSecret) {
            throw new Error('A senha do admin não foi definida. Verifique o arquivo .env.');
        }

        const enrollment = await ca.enroll({ enrollmentID, enrollmentSecret });

        const identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        await wallet.put('admin', identity);
        console.log('Admin registrado com sucesso e adicionado ao wallet.');
    } catch (error) {
        console.error(`Erro ao registrar admin: ${error}`);
    }
};

enrollAdmin();
