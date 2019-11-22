const { merge } = require('lodash');
const RootQuery = require('./RootQuery');
const {Message} = require('./Message');
const {Contact} = require('./Contact');

const resolvers = merge(RootQuery, {Message}, {Contact});

module.exports = resolvers;
