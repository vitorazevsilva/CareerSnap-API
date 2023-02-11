
module.exports = {
    test: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'vsdev.mailer@gmail.com',
            pass: 'nfhggocboewmqwhk'
        },
        from: {
            name: 'Test Sender',
            address: 'vsdev.mailer@gmail.com'
        }
    },
    prod: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'vsdev.mailer@gmail.com',
            pass: 'nfhggocboewmqwhk'
        },
        from: {
            name: 'Test Sender',
            address: 'vsdev.mailer@gmail.com'
        }
    },
};

