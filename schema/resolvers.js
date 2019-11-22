const { merge } = require('lodash');
const RootQuery = require('./RootQuery');
const {Message} = require('./Message');

const resolvers = merge(RootQuery, {Message});

module.exports = resolvers;
