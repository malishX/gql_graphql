const db = require('../db');
const parseMessageType = require('./parseMessageType');

const messageTypeIsEqualTo = (message_id, type) => {
    // returns true if message type is equal to an expected type
    let query = `SELECT message_type_id, action_type_id FROM messages WHERE id = ` + message_id;
    return db.get(query).then(response => {
        if (parseMessageType(response[0].message_type_id, response[0].action_type_id) == type)
            return true
        else throw new Error("Message is not of type: " + type);
    });
}

module.exports = messageTypeIsEqualTo;