const graphql = require('graphql');
const {
    GraphQLObjectType,
    GraphQLString,
} = graphql;

const DateTimeTypeObj = (DateTime)=>{
    DateTime = DateTime.split(" ");
    let time = DateTime[0];
    let date = DateTime[1];
    return {
        date,
        time 
    };
}

const DateTimeType = new GraphQLObjectType({
    name: 'DateTime',
    fields: () => ({
        date: {type: GraphQLString},
        time: {type: GraphQLString}
    })
});

module.exports = {
    DateTimeType,
    DateTimeTypeObj
}