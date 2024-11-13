const { Wallets } = require('fabric-network');
const getCAClient = require('./getCAClient');
const path = require('path');

const registerUser = async (userId, username, password) => {
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    //console.log(`Verificando se o username ${username} já existe no wallet.`);
    const userExists = await wallet.get(username);

    if (userExists) {
        throw new Error(`Usuário com username "${username}" já está registrado.`);
    }

    const adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
        throw new Error('Admin não encontrado no wallet. Execute primeiro o registro do administrador.');
    }

    const ca = getCAClient();
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

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
        metadata: { userId },
    };

    //console.log(`Armazenando a identidade do usuário ${username} (userId: ${userId}) no wallet.`);
    await wallet.put(username, userIdentity); 

    return userIdentity;
};

module.exports = { registerUser };
