const { merge } = require('lodash');
const RootQuery = require('./RootQuery');
const {Message} = require('./Message');
const {Contact} = require('./Contact');
const {User} = require('./User');
const {Student} = require('./Student');

const resolvers = merge(RootQuery, {Message}, {Contact}, {User}, {Student});

module.exports = resolvers;
