const moment = require("moment");

const {
getRandomColor,
 genRandomId,
 slugify,
 snapshotToArray,
 createDatabaseReference,
} = require('./utils')

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

function increasePoints(x, userId, payload, db) {
  const ref = createDatabaseReference([
    'users', userId, 'points'
  ], db)

  ref.once('value').then(snap => {
    const old = snap.val() || 0
    return ref.set(old + x)
  }).then(() => {
    const pointsTransactionsReference = createDatabaseReference([
      'users', userId, 'points_transactions'
    ], db)

    return pointsTransactionsReference.push({ payload, value: x})

  }).catch(err => console.error(err))
}

function addTags(tags, databaseRef) {
  tags.map(tag => ({
    __id: slugify(tag),
    title: tag,
    slug: slugify(tag),
    color: getRandomColor(),
    // TODO: move to functions
    created_at: moment().format(),
    updated_at: moment().format(),
  })).forEach(tag => {
    databaseRef.child(tag.slug).set(tag)
  })
}

function getTags(tags = [], userId, db) {
  console.log('Tags', tags)

  if (!(tags instanceof Array))
  return []
  else if (tags.length === 0)
  return []

  const tagsReference = createDatabaseReference([
    'users', userId, 'tags'
  ], db)

  return tagsReference.once('value').then(dataSnapshot => {
    let tasks = snapshotToArray(dataSnapshot)
      .map(task => {
        return {
          ID: task.__id,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          slug: task.slug,
          title: task.title,
          color: task.color,
        };
      }).filter(tag => tags instanceof Array && tags.includes(tag.slug))

    console.log("Tasks", tasks);
    return tasks;
  }).catch(err => {
    console.error(err)
    return []
  })
}

function getTodosFromUser(db, userId) {
  return db
    .ref(`/users/${userId}/todos`)
    .orderByChild("expire_in")
    .once("value")
    .then(dataSnapshot => {
      /* send array of todos */
      return Promise.resolve(snapshotToArray(dataSnapshot))
    })
    .then(tasks => {
      /* dispatch  */
      const todoTagsPromise = Promise.all(tasks.map(({ tags }) => getTags(tags, userId, db)))
      const todosFormatted = Promise.all(tasks.map(task => {
        return {
          ID: task.key,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          expireIn: task.expire_in,
          title: task.title,
          description: task.description,
          done: task.done,
          late: moment(task.expire_in).isBefore(moment()),
        }
      }).sort(sortByExpireInASC))

      return Promise.all([
        todoTagsPromise,
        todosFormatted
      ])
    }).then(responses => {
      const [tags, todos] = responses

      return todos.map((todo, index) => {
        return Object.assign(todo, {
          tags: tags[index]
        })
      })
    })
}

function getTodos(obj, args, context, info) {
  const { user, db } = context;

  return getTodosFromUser(db, user.user_id).then(todos => todos.filter(t => t.done === false));
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

  console.log("Todo", newTodo);
  const todoRef = db.ref(`/users/${user.user_id}/todos`);

  return todoRef
    .push(newTodo)
    .then(snap => {

      /* parallel */
      addTags(tags || [], db.ref(`/users/${user.user_id}/tags`))
      increasePoints(10, user.user_id, {
        todo_id: snap.key,
        type: 'ADD_TODO',
        created_at: moment().format()
      }, db)

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
