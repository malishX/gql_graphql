const graphql = require('graphql');
const {SchoolType, SchoolTypeObj} = require('./School');
// const {ContactType, ContactTypeObj} = require('./Contact');
const db = require('../db');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLBoolean
} = graphql;

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
    StudentTypeObj
};