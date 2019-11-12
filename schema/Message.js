const graphql = require('graphql');
const {FlagType, FlagTypeObj} = require('./Flag');
const {FileType, FileTypeObj} = require('./File');
const {UserType, UserTypeObj} = require('./User');
const {SchoolType, SchoolTypeObj} = require('./School');
const {DateTimeType, DateTimeTypeObj} = require('./DateTime');
const {StudentType} = require('./Student');
const db = require('../db');
const DataLoader = require('dataloader');

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
        created: response.created,
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
        isEmergency: {
            type: GraphQLBoolean,
            resolve: parent => {
                if (parent.message_type_id == 3) return true;
                else return false;
            }
        },
        action_type_id: {type: GraphQLString}, 
        action_type: {
            type: FlagType,
            resolve: parent => {
                let query = "SELECT id, short_name FROM action_types WHERE id="+parent.action_type_id;
                let result = db.get(query).then(function(response){
                    return FlagTypeObj(response[0].id, response[0].short_name);
                }).catch(function(err){
                    console.log(err);
                });
                return result;
            }
        },
        kids: {
            type: new GraphQLList(StudentType),
            resolve: (parent,args, context) => {
                return context.loaders.studentLoader.load(parent.id, context.contact_id);
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
            type: DateTimeType,
            resolve: (parent, args, context, info) => {
                if (parent.is_scheduled) return DateTimeTypeObj(parent.scheduled_time);
                else return DateTimeTypeObj(parent.created);
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
        }
        // group_id -> GroupType
    })
});

module.exports = {
    MessageType,
    MessageTypeObj,
    getMessageByID,
    messageLoader
};