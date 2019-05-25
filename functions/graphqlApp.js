const express = require("express");
const admin = require("firebase-admin");
const { ApolloServer } = require("apollo-server-express");

const schema = require("./schema");
const getTodos = require("./resolvers/todos");
const getMe = require("./resolvers/me");

function gqlServer() {
  const app = express();

  admin.initializeApp();

  const apolloServer = new ApolloServer({
    typeDefs: schema,
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
