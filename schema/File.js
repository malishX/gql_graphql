const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLString,
} = graphql;

const FileTypeObj = (response)=>{
    return {
        name: "", //call the function of getFileName() here which will get the name from the url.
        url: response.link,
        type: response.type,
    }
}

const FileType = new GraphQLObjectType({
    name: 'File',
    fields: ()=>({
        name: {type: GraphQLString},
        type: {type: GraphQLString},
        url: {type: GraphQLString}
    })
});

module.exports = {
    FileType,
    FileTypeObj
}