const {MessageTypeObj} = require('./Message');
const {SchoolTypeObj} = require('./School'); 
const {StudentTypeObj} = require('./Student');
const {ContactMatrixObj} = require('./ContactMatrix');
const db = require('../db');

const ContactTypeObj = (response) => {
    return {
        id: response.id,
        name: response.name,
        mobile: response.mobile,
        email: response.email,
        image: response.image,
        contact_type_id: response.contact_type_id,
        device_type: response.device_type,
        device_id: response.device_id,
        voip_device_id: response.voip_device_id,
        build_version: response.build_version,
        os_version: response.os_version,
        app_version: response.app_version,
        model: response.model,
        device_pin: response.device_pin,
        latitude: response.latitude,
        longitude: response.longitude,
        street_name: response.street_name,
        created_time: response.created_time,
        created_by: response.created_by,
        status: response.status
    }
}

const Contact = {
    type(parent){
        // No need to query students, guardians, or staff tables for this contact ID because
        // In our current system we only allow a contact to be one of four types (Student, Guardian, Staff, Staff + Guardian)
        // For example a contact can not be a student and a guardian at the same time (considered as two different contacts with different login credentials)
        let query = "SELECT id FROM contact_type WHERE id="+parent.contact_type_id;
        return db.get(query).then(function(response){
            // TODO move this swith to a utils function
            switch (response[0].id) {
                case 1: // contact is student
                    return ContactMatrixObj(false, false, true);
                case 2: // contact is guardian
                    return ContactMatrixObj(true, false, false);
                case 3: // contact is staff
                    return ContactMatrixObj(false, true, false);
                case 4: // contact is guardian & staff
                    return ContactMatrixObj(true, true, false);
                default:
                    return null;
            }
        }).catch(function(err){
            console.log(err);
        });
    },

    messages(parent, {first, as}) {
        
        let contact_id = parent.id;
        
        // return all messages mapped to this parent.id (contact.id)
        // That have been 1. Approved or doesn't need approval 2. Not draft 3. Not SMS message
        // Ordered from newest to oldest

        // TODO fix the query returning messages multiple times (becase it is selecting from mapping table) use distinct
        let query = `SELECT 
        messages.id, 
        messages.created,
        messages.message, 
        messages.amount, 
        messages.action_type_id, 
        messages.message_type_id, 
        messages.sender_type_id,
        messages.created_by, 
        messages.school_id, 
        messages.is_scheduled, 
        messages.scheduled_time
        FROM messages_mapping INNER JOIN messages ON messages_mapping.message_id=messages.id 
        WHERE messages_mapping.contact_id= `+parent.id+`
        AND messages.approval_status in (0,2)
        AND messages.message_type_id != '4' 
        AND messages.is_draft = 'no' `;
        
        if (as == 'guardian') // 'All Feeds' tab
            query += ` AND messages_mapping.guardian_id != 0 `
        if (as == 'staff') // 'My Messages' tab
            query += ` AND messages_mapping.staff_id != 0 `
        
        // TODO handle messages as student

        query += ` ORDER BY messages_mapping.created DESC `;

        if (first != null)
        query += ` LIMIT ` + first;

        return result = db.get(query).then(function(response){
            return response.map((message)=>{
                return {
                    ... MessageTypeObj(message),
                    contact_id
                };
            });
        }).catch(function(err){
            console.log(err);
        });
    },

    children(parent) {
        let query = `
        SELECT
            * 
        FROM
            students 
        WHERE
            id IN (
            SELECT
                guardian_student_mapping.student_id 
            FROM
                guardian
                INNER JOIN guardian_student_mapping ON guardian.id = guardian_student_mapping.guardian_id 
        WHERE
            contact_id = ` + parent.id + `)`;
        return db.get(query).then( response => {
            return response.map(kid => {
                return StudentTypeObj(kid);
            });
        }).catch( err => console.log(err));
    },

    schools(parent, {as, school_id}) {
        // returns a list of schools a contact is enrolled in
        let contact_id = parent.id;
        let query;
        if (as == "guardian")
            query = `SELECT schools.* FROM contacts
            JOIN guardian ON contacts.id = guardian.contact_id
            JOIN schools ON schools.id = guardian.school_id
            WHERE 
                contacts.id = ` + contact_id;
        else if (as == "staff")
            query = `SELECT schools.* FROM contacts
            JOIN staffs ON contacts.id = staffs.contact_id
            JOIN schools ON schools.id = staffs.school_id
            WHERE 
                contacts.id = ` + contact_id;
        else // Load all schools related to this contact regardless of his type
            query = `
            SELECT DISTINCT
                schools.* 
            FROM
                contacts
                JOIN guardian ON contacts.id = guardian.contact_id
                JOIN staffs ON guardian.contact_id = staffs.contact_id
                JOIN schools ON schools.id = staffs.school_id 
                OR schools.id = guardian.school_id 
            WHERE
                contacts.id = ` + contact_id;
        
        if(school_id) query += ` AND schools.id = ` + school_id;
        
        // TODO handle students schools
        return db.get(query).then( response => {
            return response.map(school => {
                return {
                    ... SchoolTypeObj(school), 
                    contact_id
                };
            })
        }).catch(err => console.log(err));
    }, 
    
    storiesReceived: (parent) => {
        // returns a list of contacts in which you (contact) can view their stories (uploaded in the last 24 hours)

        // our current logic does not allow a contact to be a student and any other type (staff or guardian, check contact_types DB table)
        // However in the follwing query I'll get all sections mapped to a contact regardless of the type
        // Because our current DB structure enforces us to fetch sections mapped to contact from different tables with different approaches
        // I'll use UNIONs instead of joining tables (brace urself, it is gonna be a long one)

        // Query Explained: 
        // 1. get what sections this contact is linked to (tables: students, guardians, staffs, multiple_student_section, staff_class_mapping)
        // 2. query all stories mapped to those sections (table: story_mapping)
        // 3. get the users who uploaded those stories (table: stories)

        let query = `
        SELECT DISTINCT
            contacts.* 
        FROM
            stories
            JOIN story_mapping sm ON stories.id = sm.story_id 
            JOIN contacts ON stories.uploaded_by = contacts.id
        WHERE
            stories.uploaded_at >= NOW() - INTERVAL 1 DAY
            AND sm.section_id IN (
                SELECT -- get student sections from students table
                    students.section_id AS section_id 
                FROM
                    students 
                WHERE
                    students.contact_id = ` + parent.id + ` UNION
                SELECT -- get student sections from multiple_student_section table
                    mss.section_id AS section_id 
                FROM
                    students
                    JOIN multiple_student_section mss ON mss.student_id = students.id 
                WHERE
                    students.contact_id = ` + parent.id + ` UNION
                SELECT -- get guardian sections from students table (guardian's children sections)
                    students.section_id AS section_id 
                FROM
                    students
                    JOIN guardian_student_mapping gsm ON students.id = gsm.student_id
                    JOIN guardian ON guardian.id = gsm.guardian_id 
                WHERE
                    guardian.contact_id = ` + parent.id + ` UNION
                SELECT -- get guardian sections from multiple_student_section table (guardian's children sections)
                    mss.section_id AS section_id 
                FROM
                    students
                    JOIN guardian_student_mapping gsm ON students.id = gsm.student_id
                    JOIN guardian ON guardian.id = gsm.guardian_id
                    JOIN multiple_student_section mss ON mss.student_id = students.id 
                WHERE
                    guardian.contact_id = ` + parent.id + ` UNION
                SELECT -- get staff sections from staff_class_mapping table
                    scm.section_id AS section_id 
                FROM
                    staffs
                    JOIN staff_class_mapping scm ON scm.staff_id = staffs.id 
                WHERE
                    staffs.contact_id = ` + parent.id + ` 
            );`;
            
        return db.get(query).then(response => {
            return response.map(contact => {
                return ContactTypeObj(contact);
            })
        });
    },

    stories: parent => {
        // returns a list of stories in which you can see of this contact (uploaded in the last 24 hours)

        // Query Explained: 
        // 1. get what sections this contact is linked to (tables: students, guardians, staffs, multiple_student_section, staff_class_mapping)
        // 2. query all stories mapped to those sections uploaded by a certain contact (parent.id) (tables: stories, story_mapping)

        let query = `
        SELECT DISTINCT
            stories.id,
            stories.url,
            stories.uploaded_at as date_time
        FROM
            stories
            JOIN story_mapping sm ON stories.id = sm.story_id 
        WHERE
            stories.uploaded_at >= NOW() - INTERVAL 1 DAY
            AND stories.uploaded_by = ` + parent.id + ` 
            AND sm.section_id IN (
                SELECT -- get student sections from students table
                    students.section_id AS section_id 
                FROM
                    students 
                WHERE
                    students.contact_id = ` + parent.id + `  UNION
                SELECT -- get student sections from multiple_student_section table
                    mss.section_id AS section_id 
                FROM
                    students
                    JOIN multiple_student_section mss ON mss.student_id = students.id 
                WHERE
                    students.contact_id = ` + parent.id + `  UNION
                SELECT -- get guardian sections from students table (guardian's children sections)
                    students.section_id AS section_id 
                FROM
                    students
                    JOIN guardian_student_mapping gsm ON students.id = gsm.student_id
                    JOIN guardian ON guardian.id = gsm.guardian_id 
                WHERE
                    guardian.contact_id = ` + parent.id + `  UNION
                SELECT -- get guardian sections from multiple_student_section table (guardian's children sections)
                    mss.section_id AS section_id 
                FROM
                    students
                    JOIN guardian_student_mapping gsm ON students.id = gsm.student_id
                    JOIN guardian ON guardian.id = gsm.guardian_id
                    JOIN multiple_student_section mss ON mss.student_id = students.id 
                WHERE
                    guardian.contact_id = ` + parent.id + `  UNION
                SELECT -- get staff sections from staff_class_mapping table
                    scm.section_id AS section_id 
                FROM
                    staffs
                    JOIN staff_class_mapping scm ON scm.staff_id = staffs.id 
                WHERE
                staffs.contact_id = ` + parent.id + `  
            );`;
        
        return db.get(query).then(response => {
            return response.map(story => {
                return story;
            });
        });
    },

    sent_messages: parent => {
        // return all messages sent by any user linked to this contact (by the staff_id)
        // That have been 1. Approved or doesn't need approval 2. Not draft 3. Not SMS message 4. Not scheduled 5. Not health report
        // Ordered from newest to oldest
        let query = `
        SELECT
            messages.id, 
            messages.created,
            messages.message, 
            messages.amount, 
            messages.action_type_id, 
            messages.message_type_id, 
            messages.sender_type_id,
            messages.created_by, 
            messages.school_id, 
            messages.is_scheduled, 
            messages.scheduled_time 
        FROM
            messages
            JOIN users ON users.id = messages.created_by
            JOIN staffs ON users.staff_id = staffs.id 
        WHERE
            messages.approval_status IN ( 0, 2 ) -- approved or doesn't need approval
            AND messages.message_type_id != '4' -- not SMS
            AND messages.is_draft = 'no' -- not draft
            AND messages.is_scheduled = 0 -- not scheduled
            AND messages.report_type = 0 -- not health report
            AND staffs.contact_id = ` + parent.id + ` 
        ORDER BY
            messages.created DESC`;

        return db.get(query).then(response => {
            return response.map(message => {
                return MessageTypeObj(message);
            });
        });
    },

    scheduled_messages: parent => {
        // returns a list of messages scheduled by any user ID linked to this contact (by the staff_id)
        // That have been 1. Approved or doesn't need approval 2. Not Sent 3. Not draft 4. Not SMS message 5. Not health report
        // Ordered from newest to oldest
        let query = `
        SELECT
            messages.id, 
            messages.created,
            messages.message, 
            messages.amount, 
            messages.action_type_id, 
            messages.message_type_id, 
            messages.sender_type_id,
            messages.created_by, 
            messages.school_id, 
            messages.is_scheduled, 
            messages.scheduled_time 
        FROM
            messages
            JOIN users ON users.id = messages.created_by
            JOIN staffs ON users.staff_id = staffs.id 
        WHERE
            messages.approval_status IN ( 0, 2 ) -- approved or doesn't need approval
            AND messages.message_type_id != '4' -- not SMS
            AND messages.is_draft = 'no' -- not draft
            AND messages.is_scheduled = 1 -- scheduled only
            AND messages.scheduler_not_done = 1 -- Not sent yet
            AND staffs.contact_id = ` + parent.id + ` 
        ORDER BY
            messages.created DESC`;

        return db.get(query).then(response => {
            return response.map(message => {
                return MessageTypeObj(message);
            });
        });
    },

    draft_messages: parent => {
        // returns a list of messages drafted by any user ID linked to this contact (by the staff_id)
        // That have been 1. Approved or doesn't need approval 2. is draft 3. Not SMS message 4. Not health report
        // Ordered from newest to oldest
        let query = `
        SELECT
            messages.id, 
            messages.created,
            messages.message, 
            messages.amount, 
            messages.action_type_id, 
            messages.message_type_id, 
            messages.sender_type_id,
            messages.created_by, 
            messages.school_id, 
            messages.is_scheduled, 
            messages.scheduled_time 
        FROM
            messages
            JOIN users ON users.id = messages.created_by
            JOIN staffs ON users.staff_id = staffs.id 
        WHERE
            messages.approval_status IN ( 0, 2 ) -- approved or doesn't need approval
            AND messages.message_type_id != '4' -- not SMS
            AND messages.is_draft = 'yes' -- draft only
	        AND messages.report_type = 0 -- not health report
            AND staffs.contact_id = ` + parent.id + ` 
        ORDER BY
            messages.created DESC`;

        return db.get(query).then(response => {
            return response.map(message => {
                return MessageTypeObj(message);
            });
        });
    }
};

module.exports = {
    Contact,
    ContactTypeObj
}