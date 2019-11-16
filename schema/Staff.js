const graphql = require('graphql');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLBoolean
} = graphql;

const StaffTypeObj = (response) => {
    return {
        id: response.id,
        contact_id: response.contact_id,
        name: response.name,
        email: response.email,
        mobile: response.mobile,
        in_multiple_schools: response.multiple_school
    }
}

const StaffType = new GraphQLObjectType({
    name: 'Staff',
    fields: ()=>({
        id: {type: GraphQLID},
        contact_id: {type: GraphQLID},
        name: {type: GraphQLString},
        mobile: {type: GraphQLString},
        email: {type: GraphQLString},
        in_multiple_schools: {type: GraphQLBoolean}
    })
});

module.exports = {
    StaffType,
    StaffTypeObj
};