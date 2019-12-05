const {FileTypeObj} = require('./File');
const {UserTypeObj} = require('./User');
const {SchoolTypeObj} = require('./School');
const {StudentTypeObj} = require('./Student'); 
const db = require('../db');
const DataLoader = require('dataloader');
const parseMessageType = require('../utils/parseMessageType');

const getMessageByID = msgID => {
    let query = "Select * from messages where id in ("+msgID+")";
    return db.get(query).then( response => {
        return (MessageTypeObj(response[0]));
    }).catch( err => {
        console.log(err);
    });
};

const messageLoader = new DataLoader(keys => {
        return Promise.all(
            keys.map(getMessageByID)
        );
    }
, { cache: false });


const MessageTypeObj = (response) => {
    // here no relationships only matching native responses from db
    // use Select column AS name .. later on
    return {
        id: response.id,
        created: response.created,
        text: response.message,
        files: response.files,
        amount: response.amount,
        action_type_id: response.action_type_id,
        message_type_id: response.message_type_id,
        sender_type_id: response.sender_type_id,
        created_by: response.created_by,
        school_id: response.school_id,
        is_scheduled: response.is_scheduled,
        scheduled_time: response.scheduled_time,
    }
}

const Message = {
    attachments: parent => {
        let files = parent.files;
        if(files && files.length != 0) files = JSON.parse(files);
        else return null;
        return files.map((file)=>{
            return FileTypeObj(file);
        });
    },

    isUrgent: parent => {
        if (parent.message_type_id == 2) return true;
        else return false;
    },

    isCC: parent => {
        // get isCC from message mapping, using message_id and contact_id
        let query = `
        SELECT
            messages_mapping.is_cc AS isCC
        FROM
            messages_mapping
        WHERE
            messages_mapping.message_id = `+ parent.id +
            ` AND contact_id =` + parent.contact_id;
        // TODO: add one more check (staff_id), to get only one value no more,
        // beacuse this query might return more than one value
        // if the message was sent to a guardian + staff type and the staff is CCed;
        return db.get(query).then( response => {
            // response must return on record
            if (response[0].isCC) return true;
            else return false;
        }).catch(function(err){
            console.log(err);
        });
    },

    isReminder: parent => {
        // returns if this contact was reminded about this messages before
        let query = `
        SELECT id
        FROM reminder_mapping
        WHERE
            message_id = ` + parent .id +
            ` AND contact_id =` + parent.contact_id;

        return db.get(query).then( response => {
            if (response.length) return true;
                // if there is a reminder record, 
                // ; then the contact was sent a message reminder
            else return false;
        }).catch( err => {
            console.log(err);
        })
    },

    message_type: parent => {
        return parseMessageType(parent.message_type_id, parent.action_type_id);
    },

    kids: parent => {
        // return context.loaders.studentLoader.load(parent.id, parent.contact_id);
        // TODO use StudentLoader and pass contact_id to it
        let query = `
        SELECT
        distinct students.*
        FROM
        messages_mapping
        JOIN students
        ON messages_mapping.student_id = students.id
        WHERE
        message_id IN (`+ parent.id +`)
        AND messages_mapping.contact_id = ` + parent.contact_id; 
        
        return db.get(query).then(students => {
            return students.map(student => {
                return StudentTypeObj(student);
            });
        }).catch(function(err){
            console.log(err);
        });
    },

    school: parent => {
        let query = "select * from schools where id="+parent.school_id;
        let result = db.get(query).then(function(response){
            return SchoolTypeObj(response[0]);
        }).catch(function(err){
            console.log(err);
        });
        return result;
    },

    date_time: parent => {
        if (parent.is_scheduled) return parent.scheduled_time;
        else return parent.created; // TODO take the time from messages_mapping table because this could reflect a draft creation time
    },

    sender: parent => {
        let query = "SELECT * FROM users WHERE id="+parent.created_by;
        let result = db.get(query).then(function(response){
            return UserTypeObj(response[0]);
        }).catch(function(err){
            console.log(err);
        });
        return result;
    },

    action_status: parent => {
        // returns the latest action given to this message regarding this student ID, From any guardian
        if (!parent.contact_id) throw new Error("contact_id argument is undefined");
        let query = `
        SELECT actions_history.action_status
        FROM messages_mapping
        JOIN actions_history ON messages_mapping.contact_id = actions_history.updated_by 
        WHERE
            messages_mapping.message_id = `+ parent.id + `  
            AND messages_mapping.message_id = actions_history.message_id 
            AND messages_mapping.student_id IN ( SELECT DISTINCT student_id FROM messages_mapping WHERE message_id = `+ parent.id + `  AND contact_id = ` + parent.contact_id + ` ) 
        ORDER BY actions_history.updated_on DESC 
        LIMIT 1`;
        return db.get(query).then(response => {
            // TODO move this switch statement to a separate method
            if (!response[0]) throw new Error("No action was recorded for this message before");  // If No action_history record found
            else
            switch (response[0].action_status) {
                case 0:
                    return "default";
                case 1: 
                    return "acknowledge";
                case 2:
                    return "approve";
                case 3:
                    return "decline";
                case 4:
                    return "pay"
                default:
                    return "default";
            }
        });
    },

    replies: parent => {
        // 1. verify the message is of type reply
        if (parseMessageType(parent.message_type_id, parent.action_type_id) != "reply")
            throw new Error("Message is not of type reply");

        // 2. query message replies and return
        let query = `
        SELECT
            id,
            reply_text AS text,
            image_url AS attached_image_url,
            updated_on AS date_time,
            updated_by
        FROM
            message_reply 
        WHERE
            message_id = ` + parent.id + ` 
        ORDER BY
            updated_on ASC`;

        return db.get(query);

    }
};

module.exports = {
    Message,
    MessageTypeObj,
    getMessageByID,
    messageLoader
};