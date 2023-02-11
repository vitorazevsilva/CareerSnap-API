module.exports = (app) => {
    const save = async (user_id, experience) => {
        if (!experience.role) return {message:'Role is a mandatory attribute'}
        if (!experience.start_date) return {message:'Start date is a mandatory attribute'}
        if (!experience.end_date) return {message:'End date is a mandatory attribute'}
        if (!experience.company) return {message:'Company is a mandatory attribute'}
        if (!experience.description) return {message:'Description is a mandatory attribute'}

        experience.start_date = experience.start_date = new Date(experience.start_date).toISOString().split('T')[0];
        experience.end_date = experience.end_date = new Date(experience.end_date).toISOString().split('T')[0];

        if(checkDate(experience.start_date)) return {message:'Start date is not valid'}
        if(checkDate(experience.end_date)) return {message:'End date is not valid'}
        if(!(experience.start_date<experience.end_date)) return {message: 'Start date greater than end date'}
        if(!verifyProperties(experience,['role', 'start_date', 'end_date', 'company', 'description'])) return {message: 'Invalid parameter received'}

        const newExperience = {... experience}
        newExperience.user_id = user_id;

        return await app.db('experiences').insert(newExperience, ['id', 'role', 'start_date', 'end_date','company', 'description']);
    }

    const findAll = async (filter = {}) => {
        return app.db('experiences').where(filter).select();
    }

    const findOne = async (filter = {}) => {
        return app.db('experiences').where(filter).first();
    };

    const update = async (user_id, experience_id, experience = {}) => {
        if(isNaN(experience_id) || experience_id.length > 9 ) return {message: 'Invalid ID'}
        const lastSkill = await findOne({id:experience_id, user_id: user_id})
        if (!lastSkill) return {message: 'Incorrect id or without permission'}

        if (experience.role && !experience.role) return {message:'Role is a mandatory attribute'}
        if (experience.start_date && !experience.start_date) return {message:'Start date is a mandatory attribute'}
        if (experience.end_date && !experience.end_date) return {message:'End date is a mandatory attribute'}
        if (experience.company && !experience.company) return {message:'Company is a mandatory attribute'}
        if (experience.description && !experience.description) return {message:'Description is a mandatory attribute'}

        if(experience.start_date) experience.start_date = new Date(experience.start_date).toISOString().split('T')[0];
        if(experience.end_date) experience.end_date = new Date(experience.end_date).toISOString().split('T')[0];
        lastSkill.start_date = new Date(lastSkill.start_date).toISOString().split('T')[0];
        lastSkill.end_date = new Date(lastSkill.end_date).toISOString().split('T')[0];

        if(experience.start_date && checkDate(experience.start_date)) return {message:'Start date is not valid'}
        if(experience.end_date && checkDate(experience.end_date)) return {message:'End date is not valid'}
        
        if((experience.start_date && experience.end_date) && !(experience.start_date<experience.end_date)) return {message: 'Start date greater than end date'}
        else if(experience.end_date && !(lastSkill.start_date<experience.end_date)) return {message: '2Start date greater than end date'}
        else if(experience.start_date && !(experience.start_date<lastSkill.end_date)) return {message: 'Start date greater than end date'}

        if(!verifyProperties(experience,['role', 'start_date', 'end_date', 'company', 'description'])) return {message: 'Invalid parameter received'}

        const data = mergeArrays(lastSkill, experience)

        return await app.db('experiences').where({id:experience_id}).update(data, ['id', 'role', 'start_date', 'end_date','company', 'description']);
    }

    const remove = async (user_id, experience_id) => {
        if(isNaN(experience_id) || experience_id.length > 9 ) return {message: 'Invalid ID'}
        const lastSkill = await findOne({id:experience_id, user_id: user_id})
        if (!lastSkill) return {message: 'Incorrect id or without permission'}
        await app.db('experiences').where({id:experience_id}).delete()
        return {}
        
    }

    return {save, findAll, findOne, update, remove}
}

/*                                                        
   ########################################################
   #########        VERIFICATION FUNCTIONS        #########
   ########################################################
*/

const verifyProperties= (obj, expectedProperties) => {
    const objProperties = Object.keys(obj);
    for (let i = 0; i < objProperties.length; i++) {
      if (!expectedProperties.includes(objProperties[i])) {
        return false;
      }
    }
    return true;
}

const checkDate = (providedDate) => {
    let currentDate = new Date();
    let date = new Date(providedDate);
    return currentDate < date;
}

/*
   ########################################################
   #########           OTHER FUNCTIONS            #########
   ########################################################
*/

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