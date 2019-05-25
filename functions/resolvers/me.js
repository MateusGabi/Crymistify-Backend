function graphQLResolver(obj, args, context, info) {
  const { user } = context;

  return {
    ID: user.user_id,
    createdAt: "",
    updatedAt: "",
    name: user.name,
    email: user.email,
    picture: user.picture,
    password: "",
    todos: []
  };
}

module.exports = graphQLResolver;
