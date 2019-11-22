const { merge } = require('lodash');
const RootQuery = require('./RootQuery');

const resolvers = merge(RootQuery);

module.exports = resolvers;
