const app = require('./app');
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync(`${__dirname}/private.key`),
    cert: fs.readFileSync(`${__dirname}/certificate.pem`)
};

try {
    const user = {
        email: 'alguem@exemplo.com',
        password: 'myP4s$W0rd',
        full_name: `User For Test`,
        birth_date: "2000/01/01",
        address: {
            street: "R. Exemplo n45",
            city: "Lisboa",
            state: "Lisboa",
            zipCode: "4777-854"
        },
        country: 'Portugal',
        nationality: 'Portuguese',
        phone: "+351 960123456"
    }
    const result = await app.services.user.save(user);
    if (result.message) throw app.services.user.update(1, user)
} catch (err) {
    console.error(err)
}

https.createServer(options, app).listen(3001, () => {
    console.log('Server started on port 3001');
});