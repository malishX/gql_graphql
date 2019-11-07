const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt
} = graphql;

const FlagTypeObj = (id, name)=>{
    return {
        flag: id,
        label: name,
    }
}

const FlagType = new GraphQLObjectType({
    name: 'Flag',
    fields: ()=>({
        flag: {type: GraphQLInt},
        label: {type: GraphQLString}
    })
});

module.exports = {
    FlagType,
    FlagTypeObj
}