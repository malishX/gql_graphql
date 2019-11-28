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
    }
};

module.exports = {
    Story
};