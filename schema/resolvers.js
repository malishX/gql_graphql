const { merge } = require('lodash');
const RootQuery = require('./RootQuery');
const {Mutation} = require('./Mutation');
const {Message} = require('./Message');
const {Contact} = require('./Contact');
const {User} = require('./User');
const {Student} = require('./Student');
const {School} = require('./School');
const {Grade} = require('./Grade');
const {Story} = require('./Story');
const {StoryLike} = require('./StoryLike');
const {StoryView} = require('./StoryView');

const resolvers = merge(RootQuery, {Mutation}, {Message}, {Contact}, {User}, {Student}, {School}, {Grade}, {Story}, {StoryLike}, {StoryView});

module.exports = resolvers;
