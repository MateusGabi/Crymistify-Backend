const express = require("express");
const admin = require("firebase-admin");
const { ApolloServer } = require("apollo-server-express");
const { importSchema } = require("graphql-import");

const schema = importSchema("./schema.graphql");
const { getTodos, addTodo } = require("./resolvers/todos");
const getMe = require("./resolvers/me");

function gqlServer() {
  const app = express();

  /* init db */
  admin.initializeApp();

  /* attach monitor */
  app.use(require("express-status-monitor")());

  const apolloServer = new ApolloServer({
    typeDefs: schema,
    engine: {
      apiKey: "service:MateusGabi-1732:80r5SHk0dQzFXkeQWHcwvA"
    },
    context: function({ req }) {
      // get the user token from the headers
      const token = req.headers.authorization || "";

      console.log("user token", token);
      const tokenId = token.split("Bearer ");

      console.log("tokens", tokenId);

      return admin
        .auth()
        .verifyIdToken(tokenId[1])
        .then(decoded => {
          console.log("User decoded", decoded);
          return { user: decoded, db: admin.database() };
        })
        .catch(error => {
          console.log("Erro ao decodificar");
          throw error;
        });
    },
    resolvers: {
      Query: {
        todos: getTodos,
        me: getMe
      },
      Mutation: {
        addTodo
      }
    },
    // Enable graphiql gui
    introspection: true,
    playground: true
  });

  apolloServer.applyMiddleware({ app, path: "/", cors: true });

  return app;
}

module.exports = gqlServer;
