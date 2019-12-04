const db = require('../db');

const parseMessageType = (message_type_id, action_type_id) => {
    // because we currently store different info regarding a message type in different tables
    // this function will take the IDs of messeage's (message_type) attribute and (action_type) attribute
    // and will return a string of one of the known message types in Schoolvoice
    // announcement, acknowledge, approval, reply, micropayment, emergency, sms, moments
    if(message_type_id == 3) return "emergency"
    if(message_type_id == 4) return "sms"
    if(message_type_id == 1 || message_type_id == 2) // General or Urgent
        switch (action_type_id) {
            case 1:
                return "announcement";
            case 2:
                return "acknowledge";
            case 3:
                return "approval";
            case 4:
                return "micropayment";
            case 5:
                return "reply";
            case 6:
                return "moments";
            default:
                throw new Error('Message Type Unknown');
        }
    else throw new Error('Message Type Unknown');
};

module.exports = parseMessageType;