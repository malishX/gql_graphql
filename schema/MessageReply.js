const db = require('../db');
const {ContactTypeObj} = require('./Contact');

const MessageReply = {
    sender: parent => {
        let query = 'SELECT * FROM contacts WHERE id = ' + parent.updated_by;
        return db.get(query).then(response => {
            return ContactTypeObj(response[0]);
        });
    }
}

module.exports = {
    MessageReply
}