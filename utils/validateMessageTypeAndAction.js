const db = require('../db');

let validateMessage = async (message_id, action_status) => {
    // validate that the Message Exists and its Type matches the Action sent
    let query = `SELECT action_type_id FROM messages WHERE id = ` + message_id;
    return await db.get(query).then(response => {
        if(validateMessageType(response[0].action_type_id, action_status)) // If Message Types matches 
        return true;
        else throw new Error("Action does not match message type");
    });
}

const validateMessageType = (actionTypeID, actionStatusID) => {
    // returns true if action sent is allowed on this message type
    if(actionTypeID == 2) // Acknowledgement Message
        switch (actionStatusID) {
            case 'default':
            case 'acknowledge':
                return true;
            default:
                return false;
        }
    else if(actionTypeID == 3) // Approval Message
        switch (actionStatusID) {
            case 'default':
            case 'approve':
            case 'decline':
                return true;
            default:
                return false;
        }
    else if(actionTypeID == 4) // Micropayment Message 
        switch (actionStatusID) {
            case 'pay':
                return true;
            default:
                return false;
        }
    else 
        return false;
}

module.exports = validateMessage;