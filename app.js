const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
// const loaders = require('./loaders/loaders');
const DataLoader = require('dataloader');
const {getMessageKids} = require('./schema/Student');


const app = express();

app.use('/', graphqlHTTP({
    schema,
    context: {
        loaders: {
            studentLoader: new DataLoader( getMessageKids , { cache: false }),
        }
    },
    graphiql: true
}));

app.listen("8080", () => {
    console.log('listening for requests on port 8080');
});