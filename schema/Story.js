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

    views: parent => {

        let story_id = parent.id;

        let query = `
        SELECT
            id,
            viewed_at AS date_time 
        FROM
            story_views 
        WHERE
            story_id = ` + story_id;

        return db.get(query).then(response => {
            return response.map(storyView => {
                return {
                    ... storyView,
                    story_id
                };
            });
        });
    },

    likes: parent => {

        let story_id = parent.id;

        let query = `
        SELECT
            id,
            liked_at AS date_time 
        FROM
            story_likes 
        WHERE
            story_id = ` + story_id;

        return db.get(query).then(response => {
            return response.map(storyLike => {
                return {
                    ... storyLike,
                    story_id
                };
            });
        });
    }
};

module.exports = {
    Story
};