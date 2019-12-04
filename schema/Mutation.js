const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const db = require('../db');
const validateMapping = require('../utils/validateMessageMappingToContact');
const validateMessage = require('../utils/validateMessageTypeAndAction');
const actionStringToActionID = require('../utils/actionStringToActionID');
const uploadReadableStream = require('../utils/uploadReadableStreamToS3');
const messageTypeIsEqualTo = require('../utils/messageTypeIsEqualTo');
const replyIsEnabled = require('../utils/replyIsEnabled');

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
    updateProfileImage: async (_, {contact_id, file}) => {
        // 1. TODO Validate file
        // file format - mimetype (jpg, png, anything else?)
        // file size (MAX_Size)

        // 2. Upload to S3
        const {createReadStream, filename} = await file;
        let fileUploadName = filename+"_"+Date.now()+".jpg"; // Add random characters and extension
        let readstream = createReadStream(file);
        const uploadResult = await uploadReadableStream(s3, process.env.USER_PROFILE_IMAGES_BUCKET, fileUploadName , readstream);

        // 3. Update DB
        let imageURL = uploadResult.key;
        let query = `UPDATE contacts SET image="` + imageURL + `" where id = ` + contact_id;
        let updateProfileImage = db.get(query).then(response => {
            if (response.affectedRows > 0) return true;
            else return false;
        });

        // 4. return string image path 
        if (await uploadResult && await updateProfileImage)
            return uploadResult.key;
        else throw new Error("Couldn't update profile image");
    },

    addStory: async (_, {contact_id, section_ids, file}) => {
        // 1. validate size, format

        // 2. upload to S3
        const {createReadStream, filename, mimetype} = await file;
        console.log(mimetype);
        console.log(await mimetype);
        console.log(file);
        let fileUploadName = filename+"_"+Date.now()+".jpg"; // Add random characters and extension
        let readstream = createReadStream(file);
        const uploadResult = await uploadReadableStream(s3, process.env.STORIES_BUCKET, fileUploadName , readstream);
        
        // 3. Insert to DB (story url + sections mapping)
        let storyURL = uploadResult.key;
        let insertStoryQuery = `INSERT INTO stories (url, uploaded_by, uploaded_at) VALUES ('` + storyURL + `', ` + contact_id + `, CURRENT_TIMESTAMP); 
        SELECT LAST_INSERT_ID();`; // TODO don't use current_timestamp because it will record the time the story is uploaded not the time it was sent (think offline)
        let story_id = db.get(insertStoryQuery).then(response => {
            if (response[0].LAST_INSERT_ID) return response.LAST_INSERT_ID;
            else return false;
        });

        let insertMapping = false;
        if (story_id) // verifies that story record has been added and the primary ID exists
            insertMapping = section_ids.map(section_id => {
                let insertMappingQuery = `INSERT INTO story_mapping (story_id, section_id) VALUES (` + story_id + `, ` + section_id + `)`;
                return db.get(insertMappingQuery).then(response => {
                    if (response.affectedRows > 0) return true;
                    else return false;
                });
            });
        console.log(await insertMapping);
        console.log(insertMapping);
        // 4. push notification to receiving contacts

        // 5. return string story url path
        if (await uploadResult && await insertMapping)
            return uploadResult.key;
        else throw new Error("Couldn't add story");
    },

    deleteStory: async (_, {id, contact_id}) => {
        // 1. TODO verify this story exists and is uploaded by this contact

        // 2. delete story and any row that references it (ON DELETE CASCADE constraint)
        let query = `DELETE FROM stories WHERE id = ` + id;
        let deleteStory = db.get(query).then(response => {
            if (response.affectedRows > 0) return true;
            else return false;
        });

        if (await deleteStory)
            return "success";
        else throw new Error("Couldn't delete story");
    },

    addStoryLike: async (_, {story_id, contact_id}) => {
        // like can be added once per contact per story, else it would fail
        let query = `
        INSERT INTO story_likes (story_id, liked_by, liked_at)
        SELECT ` + story_id + `, ` + contact_id + `, CURRENT_TIMESTAMP 
        FROM DUAL 
        WHERE
        NOT EXISTS
        (SELECT story_id, liked_by FROM story_likes WHERE liked_by= ` + contact_id + ` and story_id = ` + story_id + ` );`
        
        let likeStory = db.get(query).then(response => {
            if (response.affectedRows > 0) return true;
            else return false;
        });

        if (await likeStory)
            return "success";
        else throw new Error("Couldn't like story");
    },

    deleteStoryLike: async (_, {story_id, contact_id}) => {
        let query = `
        DELETE 
        FROM
            story_likes 
        WHERE
            liked_by = ` + contact_id + ` 
            AND story_id = ` + story_id;

        let deleteStoryLike = db.get(query).then(response => {
            if (response.affectedRows > 0) return true;
            else return false;
        });

        if (await deleteStoryLike)
            return "success";
        else throw new Error("Couldn't delete story like");
    },

    addStoryView: async (_, {story_id, contact_id}) => {
        // story view can be added once per contact per story, else it would fail (first view only)
        let query = `
        INSERT INTO story_views (story_id, viewed_by, viewed_at)
        SELECT ` + story_id + `, ` + contact_id + `, CURRENT_TIMESTAMP 
        FROM DUAL 
        WHERE
        NOT EXISTS
        (SELECT story_id, viewed_by FROM story_views WHERE viewed_by= ` + contact_id + ` and story_id = ` + story_id + ` );`

        let viewStory = db.get(query).then(response => {
            if (response.affectedRows > 0) return true;
            else return false;
        });

        if (await viewStory)
            return "success";
        else throw new Error("Couldn't add story view"); // TODO check if we need an error here or just fail with null
    },

    sendMessageReply: async (_, {message_id, contact_id, text, file}) => {
        // 1. verify the message exists & is of type 'reply'
        // 2. verify this message is mapped to this contact
        // 3. verify reply is enabled on the message
        let valid = false;
        valid = (
            await messageTypeIsEqualTo(message_id, "reply")
            && await validateMapping(message_id, contact_id)
            && await replyIsEnabled(message_id));
    
        // 4. upload file if available
        let uploadResult;
        if (file){
            const {createReadStream, filename, mimetype} = await file;
            console.log(mimetype);
            console.log(await mimetype);
            console.log(file);
            let fileUploadName = filename+"_"+Date.now()+".jpg"; // Add random characters and extension
            let readstream = createReadStream(file);
            uploadResult = await uploadReadableStream(s3, process.env.MESSAGE_ATTACHMENTS_BUCKET, fileUploadName , readstream);
        }
        // 5. send the reply
        let attachmentURL = typeof(uploadResult) == "undefined" ? '' : uploadResult.key;
        let query = `
        INSERT INTO message_reply ( message_id, reply_text, image_url, updated_by, updated_on )
        VALUES ( ` + message_id + `, "` + text + `", "` + attachmentURL + `", ` + contact_id + `, CURRENT_TIMESTAMP );`
        if (await valid)
            return db.get(query).then(response => {
                if (response.affectedRows > 0) return "success";
                else throw new Error("Couldn't send reply");
            });
    }
};

module.exports = {Mutation};