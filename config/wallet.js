const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');

const getCAClient = require('./getCAClient');

const registerUser = async (userId, username, password, name, email) => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const userExists = await wallet.get(username);
        if (userExists) {
            throw new Error(`Usuário com username "${username}" já está registrado.`);
        }

        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            throw new Error('Admin não encontrado na wallet. Execute primeiro o registro do administrador.');
        }

        const ca = getCAClient(); // Obtemos a CA client
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Verifica se o admin tem permissão para registrar
        const enrollmentSecret = await ca.register(
            { enrollmentID: userId, role: 'client' }, 
            adminUser
        );

        const enrollment = await ca.enroll({
            enrollmentID: userId,
            enrollmentSecret,
        });

        const userIdentity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
            metadata: { userId, username, email, name, password }, 
        };

        // Salvando a identidade do usuário na wallet
        await wallet.put(userId, userIdentity);
        await wallet.put(email, userIdentity);

        return userIdentity;

    } catch (error) {
        console.error(`Erro ao registrar usuário: ${error.message}`);
        throw error;
    }
};

module.exports = { registerUser };
