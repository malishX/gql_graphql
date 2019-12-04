const db = require('../db');

const replyIsEnabled = (message_id) => {
    // returns true if replies are enabled
    let query = `SELECT get_replies FROM messages WHERE id = ` + message_id;
    return db.get(query).then(response => {
        if (response[0].get_replies == 'yes')
            return true; 
        else throw new Error("Replies are disabled by admin");
    });
}

module.exports = replyIsEnabled;