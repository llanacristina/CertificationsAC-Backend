const express = require('express');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser'); 
const userRoutes = require('./routes/userRoutes');
const certificateRoutes = require('./routes/certificateRoutes')

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());


app.use('/api/users', userRoutes);
app.use('/api/certificates', certificateRoutes)


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
