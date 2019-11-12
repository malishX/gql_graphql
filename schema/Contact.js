const graphql = require('graphql');
const {MessageType, MessageTypeObj} = require('./Message');
const {FlagType, FlagTypeObj} = require('./Flag');
const {SchoolType, SchoolTypeObj} = require('./School'); 
const {StudentType, StudentTypeObj} = require('./Student');
const db = require('../db');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLList,
    GraphQLInt
} = graphql;

const ContactTypeObj = (response) => {
    return {
        id: response.id,
        name: response.name,
        mobile: response.mobile,
        email: response.email,
        image: response.image,
        otp: "1234",
        auth_token: response.auth_token,
        contact_type_id: response.contact_type_id,
        device_type: response.device_type,
        device_id: response.device_id,
        voip_device_id: response.voip_device_id,
        build_version: response.build_version,
        os_version: response.os_version,
        app_version: response.app_version,
        model: response.model,
        device_pin: response.device_pin,
        latitude: response.latitude,
        longitude: response.longitude,
        street_name: response.street_name,
        created_time: response.created_time,
        created_by: response.created_by,
        status: response.status
    }
}

const ContactType = new GraphQLObjectType({
    name: 'Contact',
    fields: ()=>({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        mobile: {type: GraphQLString},
        email: {type: GraphQLString},
        image: {type: GraphQLString},
        otp: {type: GraphQLString},
        auth_token: {type: GraphQLString},
        contact_type_id: {type: GraphQLString},
        type: {
            type: FlagType,
            resolve: (parent)=>{
                let query = "SELECT id, name FROM contact_type WHERE id="+parent.contact_type_id;
                console.log(query);
                let result = db.get(query).then(function(response){
                    return FlagTypeObj(response[0].id, response[0].name)
                }).catch(function(err){
                    console.log(err);
                });
                return result;
            }
        },
        device_type: {type: GraphQLString},
        device_id: {type: GraphQLString},
        voip_device_id: {type: GraphQLString},
        build_version: {type: GraphQLString},
        os_version: {type: GraphQLString},
        app_version: {type: GraphQLString},
        model: {type: GraphQLString},
        device_pin: {type: GraphQLString},
        latitude: {type: GraphQLString},
        longitude: {type: GraphQLString},
        street_name: {type: GraphQLString},
        created_time: {type: GraphQLString},
        created_by: {type: GraphQLString},
        status: {type: GraphQLString},
        messages: {
            type: new GraphQLList(MessageType),
            args: {
                first: {type: GraphQLInt}
            },
            resolve(parent, args, context){

                // store the contact_id in the context to use it in the messages' kids' resovler
                context.contact_id = parent.id;
                //TODO make sure this is relevant to the current request only

                // get all messages mapped to this parent.id (contact.id)
                let query = `SELECT 
                messages.id, 
                DATE_FORMAT(messages.created, "%H:%i %d/%m/%Y" ) as created, 
                messages.message, 
                messages.amount, 
                messages.action_type_id, 
                messages.message_type_id, 
                messages.sender_type_id,
                messages.created_by, 
                messages.school_id, 
                messages.is_scheduled, 
                DATE_FORMAT(messages.scheduled_time, "%H:%i %d/%m/%Y" ) as scheduled_time
                FROM messages_mapping INNER JOIN messages ON messages_mapping.message_id=messages.id 
                WHERE messages_mapping.contact_id=`+parent.id+`
                LIMIT 20`;
                let result = db.get(query).then(function(response){
                    return response.map((message)=>{
                        return MessageTypeObj(message);
                    });
                }).catch(function(err){
                    console.log(err);
                });
                return result;
            }
        },
        children: {
            type: GraphQLList(StudentType),
            resolve: parent => {
                let query = `
                SELECT
                    * 
                FROM
                    students 
                WHERE
                    id IN (
                    SELECT
                        guardian_student_mapping.student_id 
                    FROM
                        guardian
                        INNER JOIN guardian_student_mapping ON guardian.id = guardian_student_mapping.guardian_id 
                WHERE
                    contact_id = ` + parent.id + `)`;
                return db.get(query).then( response => {
                    return response.map(kid => {
                        return StudentTypeObj(kid);
                    });
                }).catch( err => console.log(err));
            }
        },
        schools: {
            // returns a list schools a staff contact is enrolled in
            type: GraphQLList(SchoolType),
            resolve: parent => {
                let query = `` ;
            }
        }
    })
});

module.exports = {
    ContactType,
    ContactTypeObj
}