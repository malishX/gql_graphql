const graphql = require('graphql');
const db = require('../db');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLNonNull,
    GraphQLEnumType
} = graphql;

const ActionStatusEnum = new GraphQLEnumType({
    name: 'ActionStatus',
    values: {
        default: {value: 0},
        acknowledge: {value: 1},
        approve: {value: 2},
        decline: {value: 3},
        pay: {value: 4}
    }
}); 

const validateMessageType = (actionTypeID, actionStatusID) => {
    // returns true if action sent is allowed on this message type
    if(actionTypeID == 2) // Acknowledgement Message
        switch (actionStatusID) {
            case 0: // default action
            case 1: // acknowledge action
                return true;
            default:
                return false;
        }
    else if(actionTypeID == 3) // Approval Message
        switch (actionStatusID) {
            case 0: // default action
            case 2: // accept action
            case 3: // decline action
                return true;
            default:
                return false;
        }
    else if(actionTypeID == 4) // Micropayment Message 
        switch (actionStatusID) {
            case 4: // Pay action
                return true;
            default:
                return false;
        }
    else 
        return false;
}

const validateMapping = async (message_id, contact_id)  => {
    // validate that a message mapping record exists to the contactID sending
    let query = `
    SELECT id FROM messages_mapping 
    WHERE message_id = ` + message_id + 
    ` AND contact_id = ` + contact_id;

    return await db.get(query).then(response => {
        if (response.length > 0) return true;
        else throw new Error("No message mapping record found");
    });
}

let validateMessage = async (message_id, action_status) => {
    // validate that the Message Exists and its Type matches the Action sent
    let query = `SELECT action_type_id FROM messages WHERE id = ` + message_id;
    return await db.get(query).then(response => {
        if(validateMessageType(response[0].action_type_id, action_status)) // If Message Types matches 
        return true;
        else throw new Error("Action does not match message type");
    });
}

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        setMessageAction: {
            type: GraphQLString,
            args: {
                message_id: {type: new GraphQLNonNull(GraphQLID)},
                contact_id: {type: new GraphQLNonNull(GraphQLID)},
                action_status: {type: new GraphQLNonNull(ActionStatusEnum)}
            },
            resolve: async (parent, args) => {
                let valid = false;
                valid = (
                    await validateMessage(args.message_id, args.action_status) 
                    && await validateMapping(args.message_id, args.contact_id));
                
                // Add action mapping record to actions_history table 
                let insertQuery = `
                INSERT INTO actions_history ( message_id, action_status, updated_by, updated_on, student_ids )
                VALUES('`+ args.message_id +`', '`+ args.action_status +`', '`+ args.contact_id +`', CURRENT_TIMESTAMP, '')` //TODO add students (check first with doaa it it's used anywhere in admin panel)
                let insertStatus = await db.get(insertQuery).then(response => {
                    if (response.affectedRows > 0) return true;
                    else return false;
                }).catch(err => console.log(err));

                // Update messages_mapping records for this guardian of those students (if an action is given for students)
                let updateQuery = `UPDATE messages_mapping 
                SET action_status = ` + args.action_status + ` ,
                updated_by = ` + args.contact_id + ` ,
                updated_on = CURRENT_TIMESTAMP 
                WHERE
                    message_id = ` + args.message_id + ` 
                    AND contact_id = ` + args.contact_id;
                let updateStatus = await db.get(updateQuery).then(response => {
                    if (response.affectedRows > 0) return true;
                    else return false;
                }).catch(err => console.log(err));
        
                if (await valid){
                    if (await updateStatus && await insertStatus)
                    
                    // TODO send FCM notification to the other guardians

                    return "success"
                } else throw new Error("Invalid request");
                
            }
        },
        updateProfile: {
            type: GraphQLString,
            args: {
                contact_id: {type: GraphQLNonNull(GraphQLID)},
                name: {type: GraphQLString},
                email: {type: GraphQLString},
                // TODO profile picture
            },
            resolve: async (parent, args) => {
                let query = `UPDATE contacts SET`
                if (args.name) query += ` name="` + args.name + `"`;
                if (args.email) query += `, email="` + args.email + `"`;
                query += ` where id =` + args.contact_id;
                // TODO add validation for the email (syntax), name (> character) and address
                // TODO add address string arg + column in DB

                let updatedProfile = db.get(query).then(response => {
                    if (response.affectedRows > 0) return true;
                    else return false;
                });
    
                if (await updatedProfile)
                    return "success"
                else throw new Error("Invalid request");
            }
        }
    }
});

module.exports = {Mutation};