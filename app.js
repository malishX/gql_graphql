const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');

const app = express();

app.use('/', graphqlHTTP({
    schema,
    context: {},
    graphiql: true
}));

app.listen("8080", () => {
    console.log('listening for requests on port 8080');
});