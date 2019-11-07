const {GraphQLSchema} = require('graphql');
const {RootQueryType} = require('./RootQuery');

// let queryDB = (query) => {
//     console.log(query);
//     let result = db.get(query).then(function(response){
//         console.log(response);

//  how to model this thing depnending on the object type and match db fields with keynames here?
//         return {
//             flag: response[0].id,
//             label: response[0].name
//         }
//     }).catch(function(err){
//         console.log(err);
//     });
//     return result;
// }

module.exports = new GraphQLSchema({
    query: RootQueryType,
});