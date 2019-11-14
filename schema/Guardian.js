const graphql = require('graphql');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
} = graphql;

const GuardianTypeObj = (response) => {
    return {
        id: response.id,
        contact_id: response.contact_id,
        name: response.name,
        email: response.email,
        mobile: response.mobile,
    }
}

const GuardianType = new GraphQLObjectType({
    name: 'Guardian',
    fields: ()=>({
        id: {type: GraphQLID},
        contact_id: {type: GraphQLID},
        name: {type: GraphQLString},
        mobile: { type: GraphQLString},
        email: { type: GraphQLString},
    })
});

module.exports = {
    GuardianType,
    GuardianTypeObj
};