const {messageLoader} = require('./Message');
const {ContactTypeObj} = require('./Contact');
const {UserTypeObj} = require('./User');
const {StudentTypeObj} = require('./Student');
const {SchoolTypeObj} = require('./School'); 
const {LoginTypeObj} = require('./login'); 
const db = require('../db');

const RootQuery = {
    message(_, {id}){
        return messageLoader.load(id);
    },
    contact(_, {id}) {
        let query;
        // TODO this can be a switch statment and maybe can be encapsulated in a function to handle it.
        if (id) query = "Select * from contacts where id = " + id;
        let result = db.get(query).then(function(response){
            return ContactTypeObj(response[0]);
        }).catch(function(err){
            console.log(err);
        });
        return result;
    },
    user(_, {id}) {
        let query = "SELECT * from users where id = " + id;
        let result = db.get(query).then(function(response){
            return UserTypeObj(response[0]);
        }).catch(function(err){
            console.log(err);
        });
        return result;
    },
    student(_, {id}) {
        let query = "select * from students where id = " + id;
        let result = db.get(query).then(function(response){
            return StudentTypeObj(response[0]);
        }).catch(function(err){
            console.log(err);
        });
        return result;
    },
    school(_, {id}){
        let query = "select * from schools where id = " + id;
        let result = db.get(query).then(function(response){
            return SchoolTypeObj(response[0]);
        }).catch(function(err){
            console.log(err);
        });
        return result;
    },
    login(_, {mobile}) {
        let query = `
        SELECT id, auth_token
        FROM contacts
        WHERE mobile = '` + mobile + `'`;
        return db.get(query).then( response => {
            return LoginTypeObj(response[0]);
        }).catch( err => console.log(err));
    },
};

module.exports = {
    RootQuery
};