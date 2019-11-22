// const express = require('express');
const { ApolloServer } = require('apollo-server');
const typeDefs= require('./schema/schema');
const resolvers = require('./schema/resolvers');

const app = new ApolloServer({ 
    typeDefs,
    resolvers
 });

app.listen(3000).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});