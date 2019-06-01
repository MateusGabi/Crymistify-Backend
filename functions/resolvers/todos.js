const moment = require("moment");

function slugify(word = "") {
  return word.toLowerCase().replace(" ", "_")
}

function snapshotToArray(snapshot) {
  var returnArr = [];

  snapshot.forEach(function(childSnapshot) {
    var item = childSnapshot.val();
    item.key = childSnapshot.key;

    returnArr.push(item);
  });

  return returnArr;
}

function sortByExpireInASC(a, b) {
  if (!a.expireIn && !b.expireIn) return 0;
  if (!a.expireIn) return -1;
  if (!b.expireIn) return 1;

  const momentA = moment(a.expireIn);
  const momentB = moment(b.expireIn);

  return momentA.diff(momentB);
}

function mapDBtoGraphQL(child) {
  return {
    ID: child.key,
    createdAt: child.val().created_at,
    updatedAt: child.val().updated_at,
    expireIn: child.val().expire_in,
    title: child.val().title,
    description: child.val().description,
    done: child.val().done,
    late: moment(child.val().expire_in).isBefore(moment()),
    tags: []
  };
}

function genRandomId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function addTags(tags, databaseRef) {
  tags.map(tag => ({
    __id: slug,
    title: tag,
    slug: slugify(tag),
    // TODO: move to functions
    created_at: moment().format(),
    updated_at: moment().format(),
  })).forEach(tag => {
    databaseRef.child(tag.slug).set(tag)
  })
}

function getTodosFromUser(db, userId) {
  return db
    .ref(`/users/${userId}/todos`)
    .orderByChild("expire_in")
    .once("value")
    .then(dataSnapshot => {
      let tasks = snapshotToArray(dataSnapshot)
        .map(task => {
          return {
            ID: task.key,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            expireIn: task.expire_in,
            title: task.title,
            description: task.description,
            done: task.done,
            late: moment(task.expire_in).isBefore(moment()),
            tags: task.tags
          };
        })
        .sort(sortByExpireInASC);

      console.log("Tasks", tasks);
      return tasks;
    });
}

function getTodos(obj, args, context, info) {
  const { user, db } = context;

  return getTodosFromUser(db, user.user_id);
}

function addTodo(obj, args, context, info) {
  const { user, db } = context;

  const {
    title = null,
    description = null,
    expireIn = null,
    tags = null
  } = args;
  
  const slugifiedTags = tags ? tags.map(t => slugify(t)) : []

  const newTodo = {
    title,
    description,
    tags: slugifiedTags,
    expire_in: expireIn,
    done: false,
    __via: "GraphQL"
  };

  /* parallel */
  addTags(tags || [], db.ref(`/users/${user.user_id}/tags`))

  console.log("Todo", newTodo);
  const todoRef = db.ref(`/users/${user.user_id}/todos`);

  return todoRef
    .push(newTodo)
    .then(snap => {
      return {
        ID: snap.key,
        title,
        description,
        expireIn,
        done: false,
        tags: tags.map(t => ({
          ID: genRandomId(),
          title: t,
          slug: slugify(t),
          createdAt: moment().format(),
          updatedAt: moment().format()
        })),
        createdAt: moment().format(),
        updatedAt: moment().format()
      };
    })
    .catch(error => {
      console.error("Error to Save", error);
      throw error;
    });
}

module.exports = { getTodos, addTodo, getTodosFromUser };
