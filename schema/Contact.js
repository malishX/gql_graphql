const {MessageTypeObj} = require('./Message');
const {FlagTypeObj} = require('./Flag');
const {SchoolTypeObj} = require('./School'); 
const {StudentTypeObj} = require('./Student');
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
        let query = "SELECT id, name FROM contact_type WHERE id="+parent.contact_type_id;
        let result = db.get(query).then(function(response){
            return FlagTypeObj(response[0].id, response[0].name)
        }).catch(function(err){
            console.log(err);
        });
        return result;
    },

    messages(parent, {first, as}, context) {
        // Store the contact_id in the context to use it in the messages' kids' resovler
        //TODO make sure this is relevant to the current request only
        context.contact_id = parent.id;

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
                return MessageTypeObj(message);
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

    schools(parent, {as}) {
        // returns a list of schools a contact is enrolled in
        let query;
        if (as == "guardian")
            query = `SELECT schools.* FROM contacts
            JOIN guardian ON contacts.id = guardian.contact_id
            JOIN schools ON schools.id = guardian.school_id
            WHERE 
                contacts.id = ` + parent.id;
        else if (as == "staff")
            query = `SELECT schools.* FROM contacts
            JOIN staffs ON contacts.id = staffs.contact_id
            JOIN schools ON schools.id = staffs.school_id
            WHERE 
                contacts.id = ` + parent.id;
        else // Load all messages sent to this contact regardless of his type
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
                contacts.id = ` + parent.id;
        // TODO handle students schools
        return db.get(query).then( response => {
            return response.map(school => {
                return SchoolTypeObj(school);
            })
        }).catch(err => console.log(err));
    }
};

module.exports = {
    Contact,
    ContactTypeObj
}