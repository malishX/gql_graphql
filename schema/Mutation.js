const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const db = require('../db');
const validateMapping = require('../utils/validateMessageMappingToContact');
const validateMessage = require('../utils/validateMessageTypeAndAction');
const actionStringToActionID = require('../utils/actionStringToActionID');
const uploadReadableStream = require('../utils/uploadReadableStreamToS3');

dotenv.config();
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION,
});


const Mutation = {
    setMessageAction: async (_, {message_id, contact_id, action_status}) => {
        let valid = false;
        valid = (
            await validateMessage(message_id, action_status) 
            && await validateMapping(message_id, contact_id));
        
        // Add action mapping record to actions_history table 
        let insertQuery = `
        INSERT INTO actions_history ( message_id, action_status, updated_by, updated_on, student_ids )
        VALUES('`+ message_id +`', '`+ actionStringToActionID(action_status) +`', '`+ contact_id +`', CURRENT_TIMESTAMP, '')` //TODO add students (check first with doaa it it's used anywhere in admin panel)
        let insertStatus = await db.get(insertQuery).then(response => {
            if (response.affectedRows > 0) return true;
            else return false;
        }).catch(err => console.log(err));

        // Update messages_mapping records for this guardian of those students (if an action is given for students)
        let updateQuery = `UPDATE messages_mapping 
        SET action_status = ` + actionStringToActionID(action_status) + ` ,
        updated_by = ` + contact_id + ` ,
        updated_on = CURRENT_TIMESTAMP 
        WHERE
            message_id = ` + message_id + ` 
            AND contact_id = ` + contact_id;
        let updateStatus = await db.get(updateQuery).then(response => {
            if (response.affectedRows > 0) return true;
            else return false;
        }).catch(err => console.log(err));

        if (await valid){
            if (await updateStatus && await insertStatus)
            
            // TODO send FCM notification to the other guardians

            return "success"
        } else throw new Error("Invalid request");
    },

    updateProfile: async (_, {contact_id, name, email}) => {
        // TODO profile picture
        let query = `UPDATE contacts SET`
        if (name) query += ` name="` + name + `"`;
        if (email) query += `, email="` + email + `"`;
        query += ` where id =` + contact_id;
        // TODO add validation for the email (syntax), name (> character) and address
        // TODO add address string arg + column in DB

        let updateProfile = db.get(query).then(response => {
            if (response.affectedRows > 0) return true;
            else return false;
        });

        if (await updateProfile)
            return "success"
        else throw new Error("Invalid request");
    },
    
    uploadProfileImage: async (_, {file}) => {
        // 1. TODO Validate file
        // file format - mimetype (jpg, png, anything else?)
        // file size (MAX_Size)

        // 2. Upload to S3
        const {createReadStream, filename} = await file;
        let fileUploadName = filename+"_"+Date.now()+".jpg"; // Add random characters and extension
        let readstream = createReadStream(file);
        const uploadResult = await uploadReadableStream(s3, process.env.USER_PROFILE_IMAGES_BUCKET, fileUploadName , readstream);
        
        // 3. return string image path 
        if (await uploadResult)
            return uploadResult.key;
        else throw new Error("Couldn't upload the image");
    },
    updateProfileImage: async (_, {contact_id, imageURL}) => {
        // Since passing two arguments (multipart file and contact_id) did not workout (caused various bugs) for an unknown reason
        // We decided to separate the functionality to two mutations
        // uploadProfileImage will accept and upload the file and return the path
        // updateProfileImage will get the path and contact_id and update the DB
        let query = `UPDATE contacts SET image="` + imageURL + `" where id = ` + contact_id;
        let updateProfileImage = db.get(query).then(response => {
            if (response.affectedRows > 0) return true;
            else return false;
        });
        if (await updateProfileImage)
            return "success"
        else throw new Error("Couldn't update profile image");
    },
    uploadProfileImageTest: async (_, {contact_id, file}) => {
        const {createReadStream, filename} = await file;
        let fileUploadName = filename+"_"+Date.now()+".jpg"; // Add random characters and extension
        let readstream = createReadStream(file);
        const uploadResult = await uploadReadableStream(s3, process.env.USER_PROFILE_IMAGES_BUCKET, fileUploadName , readstream);

        let imageURL = uploadResult.key;
        let query = `UPDATE contacts SET image="` + imageURL + `" where id = ` + contact_id;
        let updateProfileImage = db.get(query).then(response => {
            if (response.affectedRows > 0) return true;
            else return false;
        });

        // 3. return string image path 
        if (await uploadResult && await updateProfileImage)
            return uploadResult.key;
        else throw new Error("Couldn't update profile image");
    }
};

module.exports = {Mutation};