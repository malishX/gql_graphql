const db = require('../db');
const {StudentTypeObj} = require('./Student');

const Section = {
    students: parent => {
        // returns an array of students who are enrolled in this section
        let query = `
        SELECT
            students.* 
        FROM
            section
            JOIN students ON section.id = students.section_id 
        WHERE
            section.id = ` + parent.id + ` UNION
        SELECT
            students.* 
        FROM
            section
            JOIN multiple_student_section mss ON section.id = mss.section_id
            JOIN students ON students.id = mss.student_id 
        WHERE
            section.id = ` + parent.id;
        // TODO: exclude the sections this contact is not a staff at (guardian or student for example)
        return db.get(query).then(response => {
            return response.map(student => {
                return StudentTypeObj(student);
            })
        });
    }
};

module.exports = {
    Section
}