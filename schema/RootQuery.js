const graphql = require('graphql');
const {MessageType, MessageTypeObj} = require('./Message');
const {ContactType, ContactTypeObj} = require('./Contact');
const {UserType, UserTypeObj} = require('./User');
const {StudentType, StudentTypeObj} = require('./Student');
const {SchoolType, SchoolTypeObj} = require('./School'); 
const db = require('../db');
var DataLoader = require('dataloader');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLList,
} = graphql;

let studentLoader = new DataLoader(ids => {
    let params = ids.map(id => '?' ).join();
    let query = `SELECT * FROM students WHERE id IN (${params})`;
    return queryLoader.load([query, ids]).then(
      rows => ids.map(
        id => rows.find(row => row.id === id) || new Error(`Row not found: ${id}`)
      )
    );
});

const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        message: {
            type: MessageType,
            args: { id: {type: GraphQLID} },
            resolve(parent,args){
                let query = "Select * from messages where id="+args.id;
                let result = db.get(query).then(function(response){
                    console.log(response[0]);
                    return MessageTypeObj(response[0]);
                }).catch(function(err){
                    console.log(err);
                });
                return result;
            }
        },
        contact: {
            type: ContactType,
            args: { id: {type: GraphQLID}, mobile: {type: GraphQLString}},
            resolve: (parent,args) => {
                let query;
                //this can be a switch statment and maybe can be encapsulated in a function to handle it.
                if (args.id) query = "Select * from contacts where id="+args.id;
                else if (args.mobile) query = "Select * from contacts where mobile='"+args.mobile+"'";
                let result = db.get(query).then(function(response){
                    return ContactTypeObj(response[0]);
                }).catch(function(err){
                    console.log(err);
                });
                return result;
            }
        },
        user: {
            type: UserType,
            args: {
                id: {type: GraphQLID}
            },
            resolve: (parent, args) => {
                let query = "SELECT * from users where id="+args.id;
                let result = db.get(query).then(function(response){
                    return UserTypeObj(response[0]);
                }).catch(function(err){
                    console.log(err);
                });
                return result;
            }
        },
        student: {
            type: StudentType,
            args: {
                id: {type: GraphQLID}
            },
            resolve: (parent, args) => {
                let query = "select * from students where id="+args.id;
                let result = db.get(query).then(function(response){
                    return StudentTypeObj(response[0]);
                }).catch(function(err){
                    console.log(err);
                });
                return result;
            }
        },
        school: {
            type: SchoolType,
            args: {
                id: {type: GraphQLID}
            },
            resolve: (parent, args) => {
                let query = "select * from schools where id="+args.id;
                let result = db.get(query).then(function(response){
                    return SchoolTypeObj(response[0]);
                }).catch(function(err){
                    console.log(err);
                });
                return result;
            }
        },
        messages: {
            type: new GraphQLList(MessageType),
            args: {contactID: {type: GraphQLID}},
            resolve(parent, args, context){
                // get all messages
                // select message_id from messages_mapping where contact_id=parent.id
                let query = `SELECT *
                FROM messages_mapping INNER JOIN messages ON messages_mapping.message_id=messages.id 
                WHERE messages_mapping.contact_id=`+args.contactID;

                // console.log(query);
                let result = db.get(query).then(function(response){
                    console.log(response);
                    // context.messageIDs = [];
                    return response.map((message)=>{
                        // context.messageIDs.push(message.id);
                        return MessageTypeObj(message);
                    });
                }).catch(function(err){
                    console.log(err);
                });
                return result;
            }
        }
    }
});

module.exports = {
    RootQueryType
};