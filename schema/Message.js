const graphql = require('graphql');
const {FlagType, FlagTypeObj} = require('./Flag');
const {FileType, FileTypeObj} = require('./file');
const {UserType, UserTypeObj} = require('./User');
const {SchoolType, SchoolTypeObj} = require('./School');
const {DateTimeType, DateTimeTypeObj} = require('./DateTime');
const {StudentType, StudentTypeObj} = require('./Student');
const db = require('../db');
const DataLoader = require('dataloader');


// const getMessageKids = messageID => {
//     let query = `select * from students where id in (select distinct student_id from messages_mapping where message_id in(`+messageID+`))`;
//     let result = db.get(query).then(function(response){
//         response.map(student => {
//             return StudentTypeObj(student);
//         });
//     }).catch(function(err){
//         console.log(err);
//     });
//     return result;
// }

const getMessageByID = msgID => {
    let query = "Select * from messages where id in ("+msgID+")";
    return db.get(query).then( response => {
        console.log(query);
        return (MessageTypeObj(response[0]));
    }).catch( err => {
        console.log(err);
    });
};

const getContactMessagses = contactID => {
    return msgIDs.map(id => {
        return getMessageByID(id);
    });
};

const messageLoader = new DataLoader(keys => {
        return Promise.all(
            keys.map(getMessageByID)
        );
    }
, { cache: false });



// const getMessages = () => {
//     let query = `SELECT message_id
//     FROM messages_mapping WHERE messages_mapping.contact_id=`+args.contactID;
//     return db.get(query).then( response => {
//         response = response.map((messsage) => {
//             // getting the message ids only
//             return messsage.message_id;
//         })
//         return Promise.all( 
//             response.map(getMessageByID)
//         );
//     });
// }

// const getMessagesKids = messageIDs => {
//     return response.map(message => {
//         message.kids
//     })
//     return Promise.all(
//         () => {
//             let query = `select * from students where id in (select distinct student_id from messages_mapping where message_id in(`+messageIDs+`))`;
//             let result = db.get(query).then(function(response){
//                 // let ids = [];
//                 response.map(student => {
//                     // ids.push(student.student_id)
//                     console.log(student);
//                     return StudentTypeObj(student);
//                 })
//                 // return studentLoader.load(ids);
//             }).catch(function(err){
//                 console.log(err);
//             });
//             return result;
//         }
//     );
// };

// const getStudentById = studentIDs => {
//     return Promise.all( 
//         studentIDs.map(id => {
//             let query = `SELECT * FROM students WHERE id in(`+id+`)`;
//             let result = db.get(query).then(function(response){
//             return response.map((student)=>{
//                 return StudentTypeObj(student);
//             });
//             }).catch(function(err){
//                 console.log(err);
//             });
//             // console.log(result);
//             return result;
//         })
//     )
// };
// let studentLoader = new DataLoader(getStudentById);
// let MessageKidsLoader = new DataLoader(getMessagesKids);

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
            resolve: parent => {
                //this comes from message mapping
            }
        },
        isReminder: {
            type: GraphQLBoolean,
            resolve: parent => {
                //this comes from message mapping
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
            // resolve: (parent,args, context) => {
            //     // if called from contacts check context otherwise just get all students
            //     // should I use context ?? or can I use it ??

            //     // message id + guardian id or contact id ??
            //     let query = `select * 
            //     from students 
            //     where id=3191`;// in 
            //     //(select distinct student_id from messages_mapping where message_id=`+parent.id+` AND contact_id=`+context.contact_id+`)`;
            //     let result = db.get(query).then(function(response){
            //         console.log(response);
            //         return response.map((student)=>{
            //             return StudentTypeObj(student);
            //         });
            //     }).catch(function(err){
            //         console.log(err);
            //     });
            //     return result;
            // }
            // resolve: (parent,args, context) => {
            //     // if called from contacts check context otherwise just get all students
            //     // should I use context ?? or can I use it ??

            //     // message id + guardian id or contact id ??
            //     // console.log(parent.id);
            //     if (!parent.id) return null;
            //     let query = `select distinct student_id from messages_mapping where message_id=`+parent.id;// AND contact_id=`+context.contact_id+`)`;
            //     let result = db.get(query).then(function(response){
            //         // console.log(response);
            //         // return response.map((student)=>{
            //         console.log(response);
            //         //hereee -> get an array of students then pass it to the funciton
            //         // then check when does the crash happen and handle it
            //         return studentLoader.load(response);
            //         // });
            //     }).catch(function(err){
            //         console.log(err);
            //     });
            //     return result;
            // }
            resolve: (parent, args, context) => {
                // MessageKidsLoader.load(parent.id);
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