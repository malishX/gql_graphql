const db = require('../db');
const {ContactTypeObj} = require('./Contact')

const StoryView = {
    viewed_by: () => {
        let query = `
        SELECT contacts.* 
        FROM
            story_views
            JOIN contacts ON contacts.id = story_views.viewed_by 
        WHERE
            story_views.story_id = ` + parent.story_id;

        return db.get(query).then(response => {
            if (response.length > 0)
                return ContactTypeObj(response[0]);
            else return null;
        });
    }
}

module.exports = {
    StoryView
}