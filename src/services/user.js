const bcrypt = require('bcrypt-nodejs');
const { assign } = require('nodemailer/lib/shared');
const validator = require('validator');


module.exports = (app) => {
    let _mainUrl = `${app._frontEndUrl}/auth.html`
    const expectedProperties = ['email', 'password', 'full_name', 'birth_date', 'address', 'country', 'nationality', 'phone'];


    const findOne = (filter = {}) => {
        return app.db('users').where(filter).first();
    };

    const findAll = async(filter = {}) => {
        return app.db('users').where(filter).select(['id', 'email', 'full_name', 'birth_date', 'address', 'country', 'nationality', 'phone']);
    };

    const save = async(user) => {
        if (!user.full_name) return { message: 'Name is a mandatory attribute' }
        if (!user.email) return { message: 'Email is a mandatory attribute' }
        if (!user.password) return { message: 'Password is a mandatory attribute' }
        if (!user.birth_date) return { message: 'Date of birth is a mandatory attribute' }
        if (!user.address) return { message: 'Address is a mandatory attribute' }
        if (!user.country) return { message: 'Country is a mandatory attribute' }
        if (!user.nationality) return { message: 'Nationality is a mandatory attribute' }
        if (!user.phone) return { message: 'Phone is a mandatory attribute' }

        user.phone = user.phone.replace(' ', '')

        if (!checkNameCount(user.full_name)) return { message: 'Full name is not valid' }
        if (!validator.isEmail(user.email)) return { message: 'Email is not valid' }
        if (!isStrongPwd(user.password)) return { message: 'Password is not secure' }
        if (!checkDate(user.birth_date)) return { message: 'Date of birth is not valid' }
        if (!validator.isMobilePhone(user.phone, 'any', { strictMode: true })) return { message: 'Phone is not valid' };
        if (!verifyProperties(user, expectedProperties)) return { message: 'Invalid parameter received' }
        const userDb_email = await findAll({ email: user.email });
        if (userDb_email && userDb_email.length > 0) return { message: 'Email is already registered' }

        const userDb_phone = await findAll({ phone: user.phone });
        if (userDb_phone && userDb_phone.length > 0) return { message: 'Phone is already registered' }

        const newUser = {...user };
        newUser.password = getPasswordHash(user.password);
        newUser.address = JSON.stringify(user.address);


        return await app.db('users').insert(newUser, ['id', 'email', 'full_name', 'birth_date', 'address', 'country', 'nationality', 'phone']);
    }
    const genRecovery = async(email, test = false) => {
        let recovery_key = "";
        await findOne({ email: email })
            .then(async(user) => {
                if (user) {
                    const data = await app.db('account_recovery').where({ email: user.email, used: false }).andWhere('expires_at', '>', new Date()).first();
                    if (data) {
                        recovery_key = data.recovery_key
                    } else {
                        recovery_key = generateKey(50)
                        await app.db('account_recovery').insert({ email: user.email, recovery_key: recovery_key, expires_at: addMinutes(15) })
                    }
                    if (!test) await app.services.mailer.sendEmailUsingTemplate(user.email, 'CareerSnap Password Recovery Request', 'recovery', { recoveryLink: `${_mainUrl}?email=${user.email}&recovery_key=${recovery_key}`, fullName: user.full_name })
                }
            })
        return recovery_key
    }

    const proceedRecovery = async(res) => {
        if (!res.email) return { message: 'Email is a mandatory attribute' }
        if (!res.recovery_key) return { message: 'Recovery Key is a mandatory attribute' }
        if (!res.password) return { message: 'Password is a mandatory attribute' }
        if (!isStrongPwd(res.password)) return { message: 'Password is not secure' }

        const recovery = await app.db('account_recovery').where({ email: res.email, recovery_key: res.recovery_key, used: false }).andWhere('expires_at', '>', new Date()).first()

        if (!recovery) return { message2: 'Invalid Attributes, Recovery Key already used or expired' }
        await app.db('account_recovery').where({ recovery_key: res.recovery_key }).update({ used: true })
        await app.db('users').where({ email: res.email }).update({ password: getPasswordHash(res.password) })

        return {}
    }

    const update = async(id, user) => {

        if ('id' in user) return { message2: 'Id cannot be updated' }
        if ('full_name' in user)
            if (!checkNameCount(user.full_name)) return { message: 'Full name is not valid' }
        if ('email' in user) {
            if (!validator.isEmail(user.email)) return { message: 'Email is not valid' }
            const userDb_email = await app.db('users').where({ email: user.email }).andWhere('id', '!=', id).select('*');
            if (userDb_email && userDb_email.length > 0) return { message: 'Email is already registered' }
        }
        if ('password' in user)
            if (!isStrongPwd(user.password)) return { message: 'Password is not secure' }
        if ('birth_date' in user)
            if (!checkDate(user.birth_date)) return { message: 'Date of birth is not valid' }
        if ('phone' in user) {
            user.phone = user.phone.replace(' ', '')
            if (!validator.isMobilePhone(user.phone, 'any', { strictMode: true })) return { message: 'Phone is not valid' };
            const userDb_phone = await app.db('users').where({ phone: user.phone }).andWhere('id', '!=', id).select('*');
            if (userDb_phone && userDb_phone.length > 0) return { message: 'Phone is already registered' }
        }
        if (!verifyProperties(user, expectedProperties)) return { message: 'Invalid parameter received' }

        const lastUser = await findOne({ id })
        const data = mergeArrays(lastUser, user)
        return await app.db('users').where({ id }).update(data, ['id', 'email', 'full_name', 'birth_date', 'address', 'country', 'nationality', 'phone'])
    }


    return { findAll, save, findOne, genRecovery, proceedRecovery, update };
};

/*                                                        
 ########################################################
 #########        VERIFICATION FUNCTIONS        #########
 ########################################################
*/
const checkNameCount = (name) => {
    let words = name.split(' ');
    return words.length >= 3;
}

const isStrongPwd = (password) => {
    let passwordStrength = 0;

    if (password.length > 0 && password.length < 8)
        return false;
    else if (password.length > 7) {
        if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))
            passwordStrength++
            if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/))
                passwordStrength++
                if (password.match(/([!,%,&,@,#,$,^,*,?,_,~,-])/))
                    passwordStrength++
    }

    if (passwordStrength > 1)
        return true;
    else
        return false;
}

const checkDate = (providedDate) => {
    let currentDate = new Date();
    let date = new Date(providedDate);

    let ageInMilliseconds = currentDate - date;
    let ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

    return ageInYears >= 15;
}

const verifyProperties = (obj, expectedProperties) => {
    const objProperties = Object.keys(obj);
    for (let i = 0; i < objProperties.length; i++) {
        if (!expectedProperties.includes(objProperties[i])) {
            return false;
        }
    }
    return true;
}

/*
 ########################################################
 #########           OTHER FUNCTIONS            #########
 ########################################################
*/

const getPasswordHash = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

const generateKey = (length) => {
    let key = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        key += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return key;
}

const addMinutes = (time = 0) => {
    let currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + time);
    return currentDate;

}

const mergeArrays = (lastData, nowData) => {
    let result = {};
    for (let key in lastData) {
        if (nowData[key] !== undefined) {
            result[key] = nowData[key];
        } else {
            result[key] = lastData[key];
        }
    }
    for (let key in nowData) {
        if (result[key] === undefined) {
            result[key] = nowData[key];
        }
    }
    return result;
}