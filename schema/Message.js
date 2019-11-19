const graphql = require('graphql');
const {FlagType, FlagTypeObj} = require('./Flag');
const {FileType, FileTypeObj} = require('./File');
const {UserType, UserTypeObj} = require('./User');
const {SchoolType, SchoolTypeObj} = require('./School');
const {StudentType, StudentTypeObj} = require('./Student'); 
const db = require('../db');
const DataLoader = require('dataloader');

const parseMessageType = (message_type_id, action_type_id) => {
    // because we currently store different info regarding a message type in different tables
    // this function will take the IDs of messeage's (message_type) attribute and (action_type) attribute
    // and will return a string of one of the known message types in Schoolvoice
    // announcement, acknowledge, approval, reply, micropayment, emergency, sms, moments
    if(message_type_id == 3) return "emergency"
    if(message_type_id == 4) return "sms"
    if(message_type_id == 1)
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

const getMessageByID = msgID => {
    let query = "Select * from messages where id in ("+msgID+")";
    return db.get(query).then( response => {
        console.log(query);
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

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLBoolean
} = graphql;

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

const MessageType = new GraphQLObjectType({
    name: 'Message',
    fields: ()=>({
        id: {type: GraphQLID},
        text: {type: GraphQLString},
        attachments: {
            type: new GraphQLList(FileType),
            resolve: (parent)=>{
                let files = parent.files;
                if(files && files.length != 0) files = JSON.parse(files);
                else return null;
                return files.map((file)=>{
                    return FileTypeObj(file);
                });
            }
        },
        isUrgent: {
            type: GraphQLBoolean,
            resolve: parent => {
                if (parent.message_type_id == 2) return true;
                else return false;
            }
        },
        isCC: {
            type: GraphQLBoolean,
            resolve: (parent, args, context) => {
                // get isCC from message mapping, using message_id and contact_id
                let query = `
                SELECT
                    messages_mapping.is_cc AS isCC
                FROM
                    messages_mapping
                WHERE
                    messages_mapping.message_id = `+ parent.id +
                    ` AND contact_id =` + context.contact_id;
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
            }
        },
        isReminder: {
            // returns if this contact was reminded about this messages before
            type: GraphQLBoolean,
            resolve: (parent, args, context) => {
                let query = `
                SELECT id
                FROM reminder_mapping
                WHERE
                    message_id = ` + parent .id +
                    ` AND contact_id =` + context.contact_id;

                return db.get(query).then( response => {
                    if (response.length) return true;
                        // if there is a reminder record, 
                        // ; then the contact was sent a message reminder
                    else return false;
                }).catch( err => {
                    console.log(err);
                })
            }
        },
        message_type: {
            type: GraphQLString,
            resolve: parent => {
                return parseMessageType(parent.message_type_id, parent.action_type_id);
            }
        },
        kids: {
            type: new GraphQLList(StudentType),
            resolve: (parent,args, context) => {
                // return context.loaders.studentLoader.load(parent.id, context.contact_id);
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
                AND messages_mapping.contact_id = ` + context.contact_id; 
                
                return db.get(query).then(students => {
                    return students.map(student => {
                        return StudentTypeObj(student);
                    });
                }).catch(function(err){
                    console.log(err);
                });
            }
        },
        amount: {type: GraphQLInt},
        school: {
            type: SchoolType,
            resolve: parent => {
                let query = "select * from schools where id="+parent.school_id;
                let result = db.get(query).then(function(response){
                    return SchoolTypeObj(response[0]);
                }).catch(function(err){
                    console.log(err);
                });
                return result;
            }
        },
        date_time: {
            type: GraphQLString,
            resolve: parent  => {
                if (parent.is_scheduled) return parent.scheduled_time;
                else return parent.created;
            }
        },
        sender: {
            type: UserType,
            resolve: parent => {
                let query = "SELECT * FROM users WHERE id="+parent.created_by;
                let result = db.get(query).then(function(response){
                    return UserTypeObj(response[0]);
                }).catch(function(err){
                    console.log(err);
                });
                return result;
            }
        },
        action_status: {
            // returns the latest action given to this message regarding this student ID, From any guardian
            type: GraphQLString,
            resolve: (parent, args, context) => {
                if (!context.contact_id) throw new Error("contact_id argument is undefined");
                let query = `
                SELECT actions_history.action_status
                FROM messages_mapping
                JOIN actions_history ON messages_mapping.contact_id = actions_history.updated_by 
                WHERE
                    messages_mapping.message_id = `+ parent.id + `  
                    AND messages_mapping.message_id = actions_history.message_id 
                    AND messages_mapping.student_id IN ( SELECT DISTINCT student_id FROM messages_mapping WHERE message_id = `+ parent.id + `  AND contact_id = ` + context.contact_id + ` ) 
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
            }
        }
    })
});

module.exports = {
    MessageType,
    MessageTypeObj,
    getMessageByID,
    messageLoader
};