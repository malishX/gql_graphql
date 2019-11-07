const graphql = require('graphql');
const {FlagType, FlagTypeObj} = require('./Flag');
const db = require('../db');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLBoolean
} = graphql;

const UserTypeObj = response => {
    // console.log(response);
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

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: GraphQLID},
        username: {type: GraphQLString},
        email: {type: GraphQLString},
        phone: {type: GraphQLString},
        address: {type: GraphQLString},
        full_name: {type: GraphQLString},
        profile_image: {type: GraphQLString},
        user_type: {
            type: FlagType,
            resolve: parent => {
                let query = "Select id, name from usertypes where id="+parent.user_type_id;
                let result = db.get(query).then(function(response){
                    return FlagTypeObj(response[0].id, response[0].name)
                }).catch(function(err){
                    console.log(err);
                });

                return result;
            }
        },
        status: {type: GraphQLString},
        created: {type: GraphQLString},
        created_by: {type: GraphQLID},
        is_superadmin: {type: GraphQLBoolean,},
        is_school_admin: {type: GraphQLBoolean},
        staff_id: {type: GraphQLID},
        in_multiple_schools: {type: GraphQLBoolean}
    })
});

module.exports = {
    UserType,
    UserTypeObj
}