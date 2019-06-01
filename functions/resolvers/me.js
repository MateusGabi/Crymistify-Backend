const { getTodosFromUser } = require("./todos");

function graphQLResolver(obj, args, context, info) {
  const { user, db } = context;

  return {
    ID: user.user_id,
    createdAt: "",
    updatedAt: "",
    name: user.name,
    email: user.email,
    picture: user.picture,
    todos: getTodosFromUser(db, user.user_id)
  };
}

module.exports = graphQLResolver;
