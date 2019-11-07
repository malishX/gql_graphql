const graphql = require('graphql');
const {UserType, UserTypeObj} = require('./User');
const db = require('../db');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
} = graphql;

const SchoolTypeObj = (response) => {
    return {
        id: response.id,
        name: response.name,
        code: response.code,
        about: response.about,
        address: response.address,
        phone: response.phone,
        fax: response.fax,
        email: response.email,
        website: response.website,
        profile_img: response.image,
        profile_background: response.school_pic,
        status: response.status,
        curriculum: response.curriculum,
        country_code: response.country_code,
        country_id: response.country,
        language: response.language,
        longitude: response.longitude,
        latitude: response.latittude,
        created: response.created,
        created_by: response.created_by
    }
}

const SchoolType = new GraphQLObjectType({
    name: 'School',
    fields: ()=>({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        code: {type: GraphQLString},
        about: {type: GraphQLString},
        address: {type: GraphQLString},
        phone: {type: GraphQLString},
        fax: {type: GraphQLString},
        email: {type: GraphQLString},
        website: {type: GraphQLString},
        profile_img: {type: GraphQLString}, //image
        profile_background: {type: GraphQLString}, //school_pic
        status: {type: GraphQLString},
        curriculum: {type: GraphQLString},
        country_code: {type: GraphQLString},
        country_id: {type: GraphQLID},
        language: {type: GraphQLString},
        longitude: {type: GraphQLString},
        latitude: {type: GraphQLString},
        // created: //date time obj
        // created_by: {type: UserType}
    })
});

module.exports = {
    SchoolType,
    SchoolTypeObj
};