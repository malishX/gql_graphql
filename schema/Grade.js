const db = require('../db');

const Grade =  {
    sections: parent => {
        let query = `
        SELECT DISTINCT
            section.id,
            section.name 
        FROM
            contacts
            JOIN staffs ON contacts.id = staffs.contact_id
            JOIN staff_class_mapping ON staff_class_mapping.staff_id = staffs.id
            JOIN section ON staff_class_mapping.section_id = section.id
            JOIN grade ON section.grade_id = grade.id 
        WHERE
            staffs.contact_id = ` + parent.contact_id + ` 
            AND grade.school_id = `+ parent.school_id +` 
            AND grade.id = `+ parent.id; 

        return db.get(query);
    }
}

module.exports = {
    Grade
};