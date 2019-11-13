const graphql = require('graphql');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
} = graphql;

const LoginTypeObj = (response) => {
    return {
        otp: "1234",
        auth_token: response.auth_token,
        contact_id: response.id
    }
}

const LoginType = new GraphQLObjectType({
    name: 'Login',
    fields: () => ({
        contact_id: {type: GraphQLID},
        otp: {type: GraphQLString},
        auth_token: {type: GraphQLString}
    })
});

module.exports = {
    LoginType,
    LoginTypeObj
};