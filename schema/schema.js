const {GraphQLSchema} = require('graphql');
const {RootQueryType} = require('./RootQuery');
const {Mutation} = require('./Mutation');

module.exports = new GraphQLSchema({
    query: RootQueryType,
    mutation: Mutation
});