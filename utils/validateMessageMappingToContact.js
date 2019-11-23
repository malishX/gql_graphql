const db = require('../db');

const validateMapping = async (message_id, contact_id)  => {
    // validate that a message mapping record exists to the contactID sending
    let query = `
    SELECT id FROM messages_mapping 
    WHERE message_id = ` + message_id + 
    ` AND contact_id = ` + contact_id;

    return await db.get(query).then(response => {
        if (response.length > 0) return true;
        else throw new Error("No message mapping record found");
    });
}

module.exports = validateMapping;