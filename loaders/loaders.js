const DataLoader = require('dataloader');
const {getMessageKids} = require('../schema/Student');

const studentLoader = new DataLoader( getMessageKids , { cache: true });

module.exports = {
    studentLoader
}