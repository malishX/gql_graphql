const {FlagTypeObj} = require('./Flag');
const db = require('../db');

const UserTypeObj = response => {
    return {
        id: response.id,
        username: response.username,
        email: response.email,
        country_code: response.country_code,
        phone: response.phone,
        address: response.address,
        full_name: response.fullname,
        profile_image: response.image,
        user_type_id: response.usertype,
        status: response.status,
        created: response.created,
        created_by: response.created_by,
        is_superadmin: response.is_admin,
        is_school_admin: response.is_school_admin,
        staff_id: response.staff_id,
        in_multiple_schools: response.multiple_school
    }
}

const User = {
    user_type(parent) {
        let query = "Select id, name from usertypes where id="+parent.user_type_id;
        let result = db.get(query).then(function(response){
            return FlagTypeObj(response[0].id, response[0].name)
        }).catch(function(err){
            console.log(err);
        });
        return result;
    },
};

module.exports = {
    User,
    UserTypeObj
}