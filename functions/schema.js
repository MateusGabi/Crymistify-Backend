module.exports = `
    interface ModelObject {
        ID : ID!
        createdAt : String!
        updatedAt : String!
    }

    type User implements ModelObject {
        ID : ID!
        createdAt : String!
        updatedAt : String!
        name : String
        email : String
        password : String
        picture : String
        todos : [Todo]
    }

    type Todo implements ModelObject {
        ID : ID!
        createdAt : String!
        updatedAt : String!
        expireIn : String!
        title : String
        description : String
        done: Boolean
        late: Boolean
        tags : [Tag]
    }

    type Tag implements ModelObject {
        ID : ID!
        createdAt : String!
        updatedAt : String!
        title : String!
        slug : String!
    }

    type Board implements ModelObject {
        ID : ID!
        createdAt : String!
        updatedAt : String!
        title : String!
        columns : [BoardColumn]
    }

    type BoardColumn implements ModelObject{
        ID : ID!
        createdAt : String!
        updatedAt : String!
        title : String!
        tag : Tag!
        order : Float
    }

    type Query {
        todos: [Todo]
        me: User
    }
`;
