module.exports = (app) => {
    const findAll = async (filter = {}) => {
        return app.db('skills').where(filter).select();
    }

    const findOne = async (filter = {}) => {
        return app.db('skills').where(filter).first();
    };

    const save = async (user_id, skill) => {
        if (!skill.designation) return {message:'Designation is a mandatory attribute'}
        if (!skill.start_year) return {message:'Start year is a mandatory attribute'}
        if (!skill.completion_year) return {message:'Completion year is a mandatory attribute'}
        if (!skill.institution) return {message:'Institution is a mandatory attribute'}
        if (!skill.field_of_study) return {message:'Field of study is a mandatory attribute'}

        if(checkDate(skill.start_year)) return {message:'Start year is not valid'}
        if(checkDate(skill.completion_year)) return {message:'Completion year is not valid'}
        if(!(skill.start_year<skill.completion_year)) return {message: 'Start year greater than completion year'}
        if(!verifyProperties(skill,['designation', 'start_year', 'completion_year', 'institution', 'field_of_study'])) return {message: 'Invalid parameter received'}

        const newSkill = {... skill}
        newSkill.user_id = user_id;

        return await app.db('skills').insert(newSkill, ['id', 'designation', 'start_year', 'completion_year','institution', 'field_of_study']);
    }

    const update = async (user_id, skill_id, skill = {}) => {
        if(isNaN(skill_id) || skill_id.length > 9 ) return {message: 'Invalid ID'}
        const lastSkill = await findOne({id:skill_id, user_id: user_id})
        if (!lastSkill) return {message: 'Incorrect id or without permission'}

        if (skill.designation && !skill.designation) return {message:'Designation is a mandatory attribute'}
        if (skill.start_year && !skill.start_year) return {message:'Start year is a mandatory attribute'}
        if (skill.completion_year && !skill.completion_year) return {message:'Completion year is a mandatory attribute'}
        if (skill.institution && !skill.institution) return {message:'Institution is a mandatory attribute'}
        if (skill.field_of_study && !skill.field_of_study) return {message:'Field of study is a mandatory attribute'}

        if(skill.start_year && checkDate(skill.start_year)) return {message:'Start year is not valid'}
        if(skill.completion_year && checkDate(skill.completion_year)) return {message:'Completion year is not valid'}
        
        if((skill.start_year && skill.completion_year) && !(skill.start_year<skill.completion_year)) return {message: 'Start year greater than completion year'}
        else if(skill.completion_year && !(lastSkill.start_year<skill.completion_year)) return {message: 'Start year greater than completion year'}
        else if(skill.start_year && !(skill.start_year<lastSkill.completion_year)) return {message: 'Start year greater than completion year'}
        
        if(!verifyProperties(skill,['designation', 'start_year', 'completion_year', 'institution', 'field_of_study'])) return {message: 'Invalid parameter received'}

        const data = mergeArrays(lastSkill, skill)

        return await app.db('skills').where({id:skill_id}).update(data, ['id', 'designation', 'start_year', 'completion_year','institution', 'field_of_study']);
    }

    const remove = async (user_id, skill_id) => {
        if(isNaN(skill_id) || skill_id.length > 9 ) return {message: 'Invalid ID'}
        const lastSkill = await findOne({id:skill_id, user_id: user_id})
        if (!lastSkill) return {message: 'Incorrect id or without permission'}
        await app.db('skills').where({id:skill_id}).delete()
        return {}
        
    }
    return {findAll, save, findOne, update, remove}
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

const checkDate = (providedYear) => {
    let currentYear = new Date().getFullYear();
    return providedYear > currentYear;
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