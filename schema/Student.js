const graphql = require('graphql');
const {SchoolType, SchoolTypeObj} = require('./School');
const db = require('../db');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLBoolean
} = graphql;

const getMessageKids = (messageID, contactID) => {
    return Promise.all(messageID.map( msgID => {
        // let query = `select * 
        // from students 
        // where id in
        // (select distinct student_id from messages_mapping where message_id in (`+msgID+`) AND contact_id=211375 )`;
        let query = `
        SELECT
        students.*
        FROM
        messages_mapping
        JOIN students
        ON messages_mapping.student_id = students.id
        WHERE
        message_id IN (`+ msgID +`) `;
        // `AND messages_mapping.contact_id = ` + contactID; 
       //TODO pass contactID argument and filter by that to return only contact kids
            
        return db.get(query).then(students => {
            return students.map(student => {
                return StudentTypeObj(student);
            });
        }).catch(function(err){
            console.log(err);
        });
    }));
}

const StudentTypeObj = (response) => {
    return {
        id: response.id,
        contact_id: response.contact_id,
        school_id: response.school_id,
        roll_no: response.student_roll_no,
        name: response.student_name,
        grade_id: response.grade_id,
        section_id: response.section_id,
        mobile: response.student_mobile,
        profile_image: response.student_image,
        in_multiple_sections: response.multiple_section,
    }
}

const StudentType = new GraphQLObjectType({
    name: 'Student',
    fields: ()=>({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        // contact: {
        //     type: ContactType,
        //     resolve: parent => {
                
        //     }
        // },
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
        roll_no: {type: GraphQLString},
        //grade
        //section
        mobile: { type: GraphQLString },
        profile_image: {type: GraphQLString},
        in_multiple_sections: {type: GraphQLBoolean}
    })
});

module.exports = {
    StudentType,
    StudentTypeObj,
    getMessageKids
};