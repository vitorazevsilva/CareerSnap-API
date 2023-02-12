const app = require('./app');
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync(`${__dirname}/private.key`),
    cert: fs.readFileSync(`${__dirname}/certificate.pem`)
};

https.createServer(options, app).listen(3001, () => {
    console.log('Server started on port 3001');
});