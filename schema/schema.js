const {gql} = require('apollo-server');

const typeDefs = gql`
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

enum ContactType {
    guardian
    staff
    student
}
  
type Contact {
    id: ID!
    name: String
    mobile: String
    email: String
    image: String
    contact_type_id: String
    type: ContactMatrix!
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
    schools(school_id: ID, as: ContactType): [School]
    storiesReceived: [Contact] # returns a list of contacts in which you can see a story they posted
    stories: [Story] # returns a list of stories in which you can see of this contact
    sent_messages: [Message] # returns a list of messages sent by any user ID linked to this contact
    scheduled_messages: [Message] # returns a list of messages scheduled by any user ID linked to this contact
    draft_messages: [Message] # returns a list of messages drafted by any user ID linked to this contact
}

type Grade {
    id: ID,
    name: String,
    school: School
    sections: [Section]
}

type Section {
    id: ID,
    name: String
    students: [Student]
}

type File {
    name: String
    type: String
    url: String
}

type ContactMatrix {
    # not to be confused with enum ContactType
    guardian: Boolean!
    staff: Boolean!
    student: Boolean!
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
    scheduled_time: String
    replies: [MessageReply]
}
  
type Mutation {
    setMessageAction(message_id: ID!, contact_id: ID!, action_status: ActionStatus!): String # returns 'success' 
    updateProfile(contact_id: ID!, name: String, email: String): String # returns 'success'
    updateProfileImage(contact_id: ID!, file: Upload!): String! # returns profile image url
    addStory(contact_id: ID!, section_ids: [ID!]!, file: Upload!): String! # returns story url
    deleteStory(id: ID!, contact_id: ID!): String # returns 'success'
    addStoryLike(story_id: ID!, contact_id: ID!): String # returns 'success'
    deleteStoryLike(story_id: ID!, contact_id: ID!): String # returns 'success'
    addStoryView(story_id: ID!, contact_id: ID!): String # returns 'success'
    sendMessageReply(message_id: ID!, contact_id: ID!, text: String!, file: Upload): String # returns 'success'
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
    grades: [Grade] #retunrs list of grades a contact have access to (should be called from type Contact)
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

type Story {
    id: ID
    url: String
    date_time: String
    uploaded_by: Contact
    views: [StoryView]
    likes: [StoryLike]
}

type StoryLike {
    id: ID
    liked_by: Contact
    date_time: String
}

type StoryView {
    id: ID
    viewed_by: Contact
    date_time: String
}

type MessageReply {
    id: ID
    text: String
    attached_image_url: String
    sender: Contact
    date_time: String
}
`;

module.exports = typeDefs;