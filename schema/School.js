const db = require('../db');

const SchoolTypeObj = (response) => {
    return {
        id: response.id,
        name: response.name,
        code: response.code,
        about: response.about,
        address: response.address,
        phone: response.phone,
        fax: response.fax,
        email: response.email,
        website: response.website,
        profile_img: response.image,
        profile_background: response.school_pic,
        status: response.status,
        curriculum: response.curriculum,
        country_code: response.country_code,
        country_id: response.country,
        language: response.language,
        longitude: response.longitude,
        latitude: response.latittude,
        created: response.created,
        created_by: response.created_by
    }
}

const School = {
    grades(parent, _, context){
        // retunrs list of grades a contact of staff type have access to (assigned to)
        context.school_id = parent.id;
        let query = `
        SELECT
            DISTINCT grade.id,
            grade.name
        FROM
            contacts
            JOIN staffs ON contacts.id = staffs.contact_id
            JOIN staff_class_mapping ON staff_class_mapping.staff_id = staffs.id
            JOIN section ON staff_class_mapping.section_id = section.id
            JOIN grade ON section.grade_id = grade.id 
        WHERE
            staffs.contact_id = ` + context.contact_id + ` 
            AND grade.school_id = ` + context.school_id;
        return db.get(query);
    }
}

module.exports = {
    School,
    SchoolTypeObj
};