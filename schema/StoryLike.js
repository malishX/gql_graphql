const db = require('../db');
const {ContactTypeObj} = require('./Contact')

const StoryLike = {
    liked_by: (_, __, context) => {
        let query = `
        SELECT contacts.* 
        FROM
            story_likes
            JOIN contacts ON contacts.id = story_likes.liked_by 
        WHERE
            story_likes.story_id = ` + context.story_id;

        return db.get(query).then(response => {
            if (response.length > 0)
                return ContactTypeObj(response[0]);
            else return null;
        });
    }
}

module.exports = {
    StoryLike
}