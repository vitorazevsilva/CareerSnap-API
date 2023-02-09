const bcrypt = require('bcrypt-nodejs');
const validator = require('validator');
//let _mainUrl = 'http://127.0.0.1:5500/auth.html'

module.exports = (app) => {
  const findOne = (filter = {}) => {
    return app.db('users').where(filter).first();
  };

  const findAll = async (filter = {}) => {
    return app.db('users').where(filter).select(['id', 'email', 'full_name', 'birth_date','address', 'country', 'nationality','phone']);
  };

  const getPasswordHash = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  };

  const save = async (user) => {
    if (!user.full_name) return {message:'Name is a mandatory attribute'}
    if (!user.email) return {message:'Email is a mandatory attribute'}
    if (!user.password) return {message:'Password is a mandatory attribute'}
    if (!user.birth_date) return {message:'Date of birth is a mandatory attribute'}
    if (!user.address) return {message:'Address is a mandatory attribute'}
    if (!user.country) return {message:'Country is a mandatory attribute'}
    if (!user.nationality) return {message:'Nationality is a mandatory attribute'}
    if (!user.phone) return {message:'Phone is a mandatory attribute'}
  
    user.phone = user.phone.replace(' ', '')

    if(!checkNameCount(user.full_name)) return {message:'Full name is not valid'}
    if(!validator.isEmail(user.email)) return {message:'Email is not valid'}
    if(!isStrongPwd(user.password)) return {message:'Password is not secure'}
    if(!checkDate(user.birth_date)) return {message:'Date of birth is not valid'}
    if(!validator.isMobilePhone(user.phone,'any', {strictMode: true})) return {message: 'Phone is not valid'};

    const userDb_email = await findAll({ email: user.email });
    if (userDb_email && userDb_email.length > 0) return {message:'Email is already registered'}

    const userDb_phone = await findAll({ phone: user.phone });
    if (userDb_phone && userDb_phone.length > 0) return {message:'Phone is already registered'}

    const newUser = { ...user };
    newUser.password = getPasswordHash(user.password);
    newUser.address = JSON.stringify(user.address);


    const res = await app.db('users').insert(newUser, ['id', 'email', 'full_name', 'birth_date','address', 'country', 'nationality','phone']);
    /* let data = {
        name: newUser.username,
        type: newUser.type,
        verificationUrl: `${mainUrl}?verificationKey=${verificationKey}&email=${newUser.email}#verify`
      }
    app.services.mailer.sendEmailUsingTemplate(newUser.email, 'Welcome to AvaliEdu', 'registration', data) */
    return res

  }
  /*                                                        
   ########################################################
   #########        Verification Functions        #########
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
    else if (password.length > 7){
        if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) 
            passwordStrength ++
        if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) 
            passwordStrength ++
        if (password.match(/([!,%,&,@,#,$,^,*,?,_,~,-])/)) 
            passwordStrength ++
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


  return { findAll, save, findOne };
};
