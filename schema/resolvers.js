const { merge } = require('lodash');
const RootQuery = require('./RootQuery');
const {Mutation} = require('./Mutation');
const {Message} = require('./Message');
const {Contact} = require('./Contact');
const {User} = require('./User');
const {Student} = require('./Student');

const resolvers = merge(RootQuery, {Mutation}, {Message}, {Contact}, {User}, {Student});

module.exports = resolvers;
