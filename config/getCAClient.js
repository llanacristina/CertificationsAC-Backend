const FabricCAServices = require('fabric-ca-client');
const https = require('https');

const getCAClient = () => {
    const caURL = 'https://localhost:7054'; 

    const tlsOptions = {
        trustedRoots: [],
        verify: false, // Ignorar verificação de certificado
        rejectUnauthorized: false,
        agent: new https.Agent({
            rejectUnauthorized: false
        })
    };

    const ca = new FabricCAServices(caURL, tlsOptions);
    return ca;
};

module.exports = getCAClient;
