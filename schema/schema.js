// const {GraphQLSchema} = require('graphql');
// const {RootQueryType} = require('./RootQuery');
// const {Mutation} = require('./Mutation');
const {gql} = require('apollo-server');
const {MessageType, MessageTypeObj, getMessageByID, messageLoader} = require('./Message');

const typedefs = gql`
schema {
    query: RootQuery
    mutation: Mutation
}
  
enum ActionStatus {
    default
    acknowledge
    approve
    decline
    pay
}
  
type Contact {
    id: ID
    name: String
    mobile: String
    email: String
    image: String
    contact_type_id: String
    type: Flag
    device_type: String
    device_id: String
    voip_device_id: String
    build_version: String
    os_version: String
    app_version: String
    model: String
    device_pin: String
    latitude: String
    longitude: String
    street_name: String
    created_time: String
    created_by: String
    status: String
    messages(first: Int, as: ContactType): [Message]
    children: [Student]
    schools(as: ContactType): [School]
}
  
enum ContactType {
    guardian
    staff
    student
}
  
type File {
    name: String
    type: String
    url: String
}
  
type Flag {
    flag: Int
    label: String
}
  
type Guardian {
    id: ID
    contact_id: ID
    name: String
    mobile: String
    email: String
}
  
type Login {
    contact_id: ID
    otp: String
    auth_token: String
}
  
type Message {
    id: ID
    text: String
    attachments: [File]
    isUrgent: Boolean
    isCC: Boolean
    isReminder: Boolean
    message_type: String
    kids: [Student]
    amount: Int
    school: School
    date_time: String
    sender: User
    action_status: String
}
  
type Mutation {
    setMessageAction(message_id: ID!, contact_id: ID!, action_status: ActionStatus!): String
    updateProfile(contact_id: ID!, name: String, email: String): String
}
  
type RootQuery {
    message(id: ID!): Message
    contact(id: ID!): Contact
    user(id: ID!): User
    student(id: ID!): Student
    school(id: ID!): School
    login(mobile: String!): Login
}
  
type School {
    id: ID
    name: String
    code: String
    about: String
    address: String
    phone: String
    fax: String
    email: String
    website: String
    profile_img: String
    profile_background: String
    status: String
    curriculum: String
    country_code: String
    country_id: ID
    language: String
    longitude: String
    latitude: String
}
  
type Staff {
    id: ID
    contact_id: ID
    name: String
    mobile: String
    email: String
    in_multiple_schools: Boolean
}
  
type Student {
    id: ID
    name: String
    school: School
    roll_no: String
    grade: String
    sections: [String]
    mobile: String
    profile_image: String
    in_multiple_sections: Boolean
    guardians: [Guardian]
    teachers: [Staff]
}
  
type User {
    id: ID
    username: String
    email: String
    phone: String
    address: String
    full_name: String
    profile_image: String
    user_type: Flag
    status: String
    created: String
    created_by: ID
    is_superadmin: Boolean
    is_school_admin: Boolean
    staff_id: ID
    in_multiple_schools: Boolean
}
`;

const resolvers = {
    RootQuery: {
        Message(parent, args){
            return messageLoader.load(args.id);
        }
    },
};

module.exports = typedefs;