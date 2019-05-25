const moment = require("moment");

function sortByExpireInASC(a, b) {
  if (!a.expireIn && !b.expireIn) return 0;
  if (!a.expireIn) return -1;
  if (!b.expireIn) return 1;

  const momentA = moment(a.expireIn);
  const momentB = moment(b.expireIn);

  return momentA.diff(momentB);
}

function graphqlResolver(obj, args, context, info) {
  const { user, db } = context;

  return db
    .ref(`/users/${user.user_id}/todos`)
    .orderByChild("done")
    .equalTo(false)
    .once("value")
    .then(dataSnapshot => {
      let tasks = [];
      dataSnapshot.forEach(child => {
        tasks.push({
          ID: child.key,
          createdAt: child.val().created_at,
          updatedAt: child.val().updated_at,
          expireIn: child.val().expire_in,
          title: child.val().title,
          description: child.val().description,
          done: child.val().done,
          late: moment(child.val().expire_in).isBefore(moment()),
          tags: []
        });
      });

      tasks = tasks.sort(sortByExpireInASC);

      return tasks;
    })
    .catch(err => {
      throw err;
    });
}

module.exports = graphqlResolver;
