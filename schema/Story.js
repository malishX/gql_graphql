const db = require('../db');
const {ContactTypeObj} = require('./Contact')

const Story = {
    uploaded_by: parent => {
        let query = `
        SELECT
            contacts.* 
        FROM
            stories
            JOIN contacts ON contacts.id = stories.uploaded_by 
        WHERE
            stories.id = ` + parent.id;
        return db.get(query).then(response => {
            return ContactTypeObj(response[0]);
        });
    },

    views: (parent, _, context) => {

        context.story_id = parent.id;

        let query = `
        SELECT
            id,
            viewed_at AS date_time 
        FROM
            story_views 
        WHERE
            story_id = ` + context.story_id;

        return db.get(query).then(response => {
            return response;
        });
    },

    likes: (parent, _, context) => {

        context.story_id = parent.id;

        let query = `
        SELECT
            id,
            liked_at AS date_time 
        FROM
            story_likes 
        WHERE
            story_id = ` + context.story_id;

        return db.get(query).then(response => {
            return response;
        });
    }
};

module.exports = {
    Story
};