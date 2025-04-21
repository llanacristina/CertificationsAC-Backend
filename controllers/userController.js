const { registerUser } = require('../config/wallet');
const { Wallets } = require('fabric-network');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const jwt = require('jsonwebtoken');


const walletPath = path.join(process.cwd(), 'wallet');
const SECRET_KEY = process.env.SECRET_KEY

const generateToken = (userId, email, role) => {
    return jwt.sign({ userId, email, role }, SECRET_KEY, { expiresIn: '2h' });
  };

// Função de Registro
const register = async (req, res) => {
    try {
        const { username, password, name, email } = req.body; 
        const userId = uuidv4();

        const userIdentity = await registerUser(userId, username, password, name, email);

        const token = generateToken(userId);

        res.status(200).json({
            message: 'Usuário registrado com sucesso!',
            token,
            userId, 
            certificate: userIdentity.credentials.certificate,
            privateKey: userIdentity.credentials.privateKey,
            name,
            email, 
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ error: error.message });
    }
};

// Função de Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body; 
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        if (email === 'admin' && password === process.env.ADMIN_PASSWORD) {
            const token = generateToken('admin', 'admin', 'admin');
            return res.status(200).json({
                message: 'Login bem-sucedido!',
                token,
            });
        }

        const userExists = await wallet.get(email);
        if (!userExists) {
            return res.status(404).json({ message: 'Usuário não encontrado. Por favor, registre-se.' });
        }

        const token = generateToken(email, email, 'user'); 

        res.status(200).json({
            message: 'Login bem-sucedido!',
            token, 
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: error.message });
    }
};

// Função para listar usuários com status do certificado
// const checkCertificateStatus = (certificateData) => {
//       if (certificateData.includes("Certificado revogado")) {
//         return 'Certificado revogado';
//     }

//     // Se não foi revogado, então o certificado é considerado válido
//     return 'Certificado válido';
// };

// Função para listar usuários com status do certificado
const listUsers = async (req, res) => {
    try {
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        const identities = await wallet.list();

        const users = await Promise.all(identities.map(async (identity) => {
            const userIdentity = await wallet.get(identity);
            const certificate = userIdentity.credentials.certificate; 
            let status = 'Certificado válido'; 

            if (certificate.includes("Certificado revogado")) {
                status = 'Certificado revogado';
            }
            return {
                id: identity,
                certificate: certificate,  
                status: status, 
            };
        }));
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    register, 
    login,
    listUsers,
};