// Since we reference message actions with IDs in our DB, 
// we will use string to compare and validate throughout the code
// but will use this utility to convert strings to IDs before inserting them to DB
const actionStringToActionID = (actionString) => {
    // returns the action ID from the action string in small cases
    switch (actionString) {
        case 'default':
            return 0;
        case 'acknowledge':
            return 1;
        case 'approve':
            return 2;
        case 'decline':
            return 3;
        case 'pay':
            return 4;
        default:
            return null;
    }
}

module.exports = actionStringToActionID;