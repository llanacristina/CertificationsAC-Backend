const { Wallets } = require('fabric-network');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { connectToNetwork } = require('../config/fabricConfig');

// Função para assinar o documento
const signDocument = async (data, privateKey) => {
    const signer = crypto.createSign('SHA256');
    signer.update(data);
    signer.end();
    
    const signature = signer.sign(privateKey, 'hex');
    return signature;
};

// Função para verificar a assinatura
const verifySignature = (data, signature, publicKey) => {
    const verifier = crypto.createVerify('SHA256');
    verifier.update(data);
    verifier.end();

    const isValid = verifier.verify(publicKey, signature, 'hex');
    return isValid;
};

// Função para salvar a assinatura em um arquivo
const saveSignature = (userId, signature) => {
    const dirPath = path.join(process.cwd(), 'signatures');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    const filePath = path.join(dirPath, `${userId}-signature.txt`);
    fs.writeFileSync(filePath, signature, 'utf8');
};

// Função para assinar um documento
const sign = async (req, res) => {
    try {
        const { userId, certificateData } = req.body;
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const userIdentity = await wallet.get(userId);
        if (!userIdentity) {
            throw new Error(`Usuário com ID ${userId} não encontrado.`);
        }

        const privateKey = userIdentity.credentials.privateKey;
        const signature = await signDocument(certificateData, privateKey);

        saveSignature(userId, signature);

        res.status(200).json({ signature });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Função para verificar certificado
const verifyCertificate = async (req, res) => {
    try {
        const { userId, certificateData, signature } = req.body;
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const userIdentity = await wallet.get(userId);
        if (!userIdentity) {
            throw new Error(`Usuário com ID ${userId} não encontrado.`);
        }

        const publicKey = userIdentity.credentials.certificate;

        const isValid = verifySignature(certificateData, signature, publicKey);

        if (!isValid) {
            return res.status(400).json({ message: "Certificado não é autêntico." });
        }

        res.status(200).json({ message: "Certificado é válido e autêntico." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Função para revogar um certificado
const revokeCertificate = async (req, res) => {
    try {
        const { userId } = req.body;
        const { contract, gateway } = await connectToNetwork(userId);

        await contract.submitTransaction('revokeCertificate', userId);

        await gateway.disconnect();

        res.status(200).json({ message: "Certificado revogado com sucesso." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    sign,
    signDocument,
    verifySignature,
    verifyCertificate,
    revokeCertificate
};
