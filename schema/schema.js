const {GraphQLSchema} = require('graphql');
const {RootQueryType} = require('./RootQuery');


module.exports = new GraphQLSchema({
    query: RootQueryType,
});