const {SchoolTypeObj} = require('./School');
const {GuardianTypeObj} = require('./Guardian');
const {StaffTypeObj} = require('./Staff');
const db = require('../db');

const getMessageKids = (messageID, contactID) => {
    return Promise.all(messageID.map( msgID => {
        // let query = `select * 
        // from students 
        // where id in
        // (select distinct student_id from messages_mapping where message_id in (`+msgID+`) AND contact_id=211375 )`;
        let query = `
        SELECT
        distinct students.*
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

const Student = {
    school(parent) {
        let query = "select * from schools where id="+parent.school_id;
        let result = db.get(query).then(function(response){
            return SchoolTypeObj(response[0]);
        }).catch(function(err){
            console.log(err);
        });
        return result;
    },

    grade(parent) {
        // return a string of the grade name a student is enrolled in
        let query = `
        SELECT name AS grade
        FROM grade
        WHERE id = ` + parent.grade_id;
        return db.get(query).then( response => {
            return response[0].grade;
        }).catch(err => console.log(err));
    },
    
    sections(parent) {
        // return an array of strings of all sections a student is enrolled in
        // TODO return multiple sections from 'multiple_student_section_mapping' table
        let query = `
        SELECT name AS section
        FROM section
        WHERE id = ` + parent.section_id;
        return db.get(query).then(response => {
            return response.map(row => {
                return row.section;
            });
        }).catch(err => console.log(err));
    },

    guardians(parent) {
        let query = `
        SELECT guardian.*,
        guardian_type.name relationship
        FROM guardian_student_mapping
        JOIN guardian ON guardian_student_mapping.guardian_id = guardian.id 
        JOIN guardian_type ON guardian_student_mapping.guardian_type_id = guardian_type.id
        WHERE guardian_student_mapping.student_id = ` + parent.id;
        
        return db.get(query).then(response => {
            return response.map(guardian => {
                return GuardianTypeObj(guardian);
            });
        }).catch(err => console.log(err));
    },

    teachers(parent) {
        // returns  an array of StaffType
        // of the staff who are assigned sections that this setudent is assigned to. 
        let query = `
        SELECT
            staffs.*
        FROM
            staffs
            JOIN staff_class_mapping ON staffs.id = staff_class_mapping.staff_id
            JOIN students ON staff_class_mapping.section_id = students.section_id
        WHERE
            students.id = ` + parent.id;
        // TOOD include multi-section students in this query
        // TODO check if this includes all teachers (campus, multi_school ..etc)
        return db.get(query).then(response => {
            return response.map(teacher => {
                return StaffTypeObj(teacher);
            });
        }).catch(err => console.log(err));
    }
};

module.exports = {
    Student,
    StudentTypeObj,
    getMessageKids
};