const { registerUser } = require('../config/wallet');
const { Wallets } = require('fabric-network');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const jwt = require('jsonwebtoken');


const walletPath = path.join(process.cwd(), 'wallet');
const SECRET_KEY = process.env.SECRET_KEY

const generateToken = (userId) => {
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '2h' });
};

// Função de Registro
const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const userId = uuidv4();

        const userIdentity = await registerUser(userId, username, password);

        const token = generateToken(userId); 

        res.status(200).json({
            message: 'Usuário registrado com sucesso!',
            token, 
            userId,
            certificate: userIdentity.credentials.certificate,
            privateKey: userIdentity.credentials.privateKey,
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ error: error.message });
    }
};

// Função de Login
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const userExists = await wallet.get(username);
        if (!userExists) {
            return res.status(404).json({ message: 'Usuário não encontrado. Por favor, registre-se.' });
        }

        const token = generateToken(username); 

        res.status(200).json({
            message: 'Login bem-sucedido!',
            token, 
        });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ error: error.message });
    }
};

// Função para Listar Usuários (Protegida pelo middleware)
const listUsers = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }

        jwt.verify(token, SECRET_KEY, async (err) => {
            if (err) {
                return res.status(403).json({ message: 'Token inválido' });
            }

            const wallet = await Wallets.newFileSystemWallet(walletPath);
            const identities = await wallet.list();

            const users = await Promise.all(identities.map(async (identity) => {
                const userIdentity = await wallet.get(identity);
                return {
                    id: identity,
                    certificate: userIdentity.credentials.certificate,
                };
            }));

            res.status(200).json(users);
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    register, 
    login,
    listUsers,
};