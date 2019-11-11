const graphql = require('graphql');
const {MessageType, MessageTypeObj, getMessageByID, messageLoader} = require('./Message');
const {ContactType, ContactTypeObj} = require('./Contact');
const {UserType, UserTypeObj} = require('./User');
const {StudentType, StudentTypeObj} = require('./Student');
const {SchoolType, SchoolTypeObj} = require('./School'); 
const db = require('../db');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
} = graphql;

const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        message: {
            type: MessageType,
            args: { id: {type: GraphQLID} },
            resolve: (parent,args) => {
                return messageLoader.load(args.id);
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
    }
});

module.exports = {
    RootQueryType
};