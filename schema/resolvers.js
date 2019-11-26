const { merge } = require('lodash');
const RootQuery = require('./RootQuery');
const {Mutation} = require('./Mutation');
const {Message} = require('./Message');
const {Contact} = require('./Contact');
const {User} = require('./User');
const {Student} = require('./Student');
const {School} = require('./School');
const {Grade} = require('./Grade');

const resolvers = merge(RootQuery, {Mutation}, {Message}, {Contact}, {User}, {Student}, {School}, {Grade});

module.exports = resolvers;
