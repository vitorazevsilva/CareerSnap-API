const app = require('./app');

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
    app.services.user.save(user)
        .then((result) => {
            if (result.message) throw app.services.user.update(1, user)
        })
} catch (err) {
    console.error(err)
}

app.listen(3001, () => {
    console.log('Server started on port 3001');
});