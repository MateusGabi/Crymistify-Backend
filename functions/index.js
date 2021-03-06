const { https, database } = require("firebase-functions");
const gqlServer = require("./graphqlApp");

const server = gqlServer();

// Graphql api
// https://us-central1-<project-name>.cloudfunctions.net/api/
const graphql = https.onRequest(server);

// exports.addTodo = functions.https.onRequest((req, res) => {
//   if (req.method !== "POST") {
//     return res.status(500).json({
//       message: "Not allowed"
//     });
//   }

//   console.log("Request Body", req.body);
//   console.log("Request Header", req.body);
//   const tokenId = req.get("Authorization").split("Bearer ")[1];

//   return admin
//     .auth()
//     .verifyIdToken(tokenId)
//     .then(decoded => {
//       console.log("User decoded", decoded);

//       const { uid } = decoded;
//       const { title = null, description = null, expire_in = null } = req.body;

//       const newTodo = {
//         title,
//         description,
//         expire_in,
//         done: false
//       };

//       console.log("Todo", newTodo);
//       const todoRef = admin.database().ref(`/users/${uid}/todos`);

//       return todoRef
//         .push(newTodo)
//         .then(snapshot => {
//           console.log("Save!", snapshot.ref.toString());
//           return res.status(200).json({
//             reference: snapshot.ref.toString()
//           });
//         })
//         .catch(error => {
//           console.error("Error to Save", error);
//         });
//     })
//     .catch(error => {
//       console.error("Error", error);
//       res.status(501).json({ error });
//     });
// });

const addOnCreateVariableInTodo = database
  .ref("/users/{uid}/todos/{pushId}")
  .onCreate((snapshot, context) => {
    // Grab the current value of what was written to the Realtime Database.
    const original = snapshot.val();

    console.log("Adding created_at", context.params.pushId, original);

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
    return snapshot.ref.child("created_at").set(moment().format())
  });

const addOnUpdateVariableInTodo = database
  .ref("/users/{uid}/todos/{pushId}")
  .onUpdate((snapshot, context) => {
    // Grab the current value of what was written to the Realtime Database.
    const original = snapshot.after.val();

    console.log("Adding updated_at", context.params.pushId, original);

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
    return snapshot.after.ref.child("updated_at").set(moment().format());
  });

// // Listens for new messages added to /messages/:pushId/original and creates an
// // uppercase version of the message to /messages/:pushId/uppercase
// exports.makeUppercase = functions.database
//   .ref("/messages/{pushId}/original")
//   .onCreate((snapshot, context) => {
//     // Grab the current value of what was written to the Realtime Database.
//     const original = snapshot.val();

//     console.log("Uppercasing", context.params.pushId, original);
//     const uppercase = original.toUpperCase();

//     // You must return a Promise when performing asynchronous tasks inside a Functions such as
//     // writing to the Firebase Realtime Database.
//     // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
//     return snapshot.ref.parent.child("uppercase").set(uppercase);
//   });

// exports.finishTodo = functions.https.onRequest((req, res) => {
//   if (req.method !== "POST") {
//     return res.status(500).json({
//       message: "Not allowed"
//     });
//   }

//   console.log("Request Body", req.body);
//   console.log("Request Header", req.body);

//   const tokenId = req.get("Authorization").split("Bearer ")[1];

//   return admin
//     .auth()
//     .verifyIdToken(tokenId)
//     .then(decoded => {
//       const { uid } = decoded;
//       const { _key = null } = req.body;

//       if (!_key) {
//         return res.status(406).json({
//           message: "Please, send prop _key on body."
//         });
//       }

//       const todoRef = admin.database().ref(`/users/${uid}/todos/${_key}`);

//       return todoRef.child("done").set(true, error => {
//         if (error) {
//           console.error("Set Error", error);
//           return res.status(501).json({ error });
//         } else {
//           console.log("Save!", _key);
//           return res.status(200).json({
//             reference: _key
//           });
//         }
//       });
//     })
//     .catch(error => {
//       console.error("Error", error);
//       return res.status(501).json({ error });
//     });
// });

// exports.todos = functions.https.onRequest((req, res) => {
//   const tokenId = req.get("Authorization").split("Bearer ")[1];

//   return (
//     admin
//       .auth()
//       .verifyIdToken(tokenId)
//       // eslint-disable-next-line promise/always-return
//       .then(decoded => {
//         // res.status(200).send(decoded)
//         const uid = decoded.uid;

//         admin
//           .database()
//           .ref(`/users/${uid}/todos`)
//           .orderByChild("done")
//           .equalTo(false)
//           .once("value")
//           // eslint-disable-next-line promise/always-return
//           .then(dataSnapshot => {
//             var tasks = [];
//             dataSnapshot.forEach(child => {
//               tasks.push({
//                 title: child.val().title,
//                 created_at: child.val().created_at,
//                 description: child.val().description,
//                 expire_in: child.val().expire_in,
//                 late: moment(child.val().expire_in).isBefore(moment()),
//                 done: child.val().done,
//                 _key: child.key
//               });
//             });

//             tasks = tasks.sort((a, b) => {
//               if (!a.expire_in && !b.expire_in) return 0;
//               if (!a.expire_in) return -1;
//               if (!b.expire_in) return 1;

//               const momentA = moment(a.expire_in);
//               const momentB = moment(b.expire_in);

//               return momentA.diff(momentB);
//             });

//             res.json(tasks);
//           })
//           .catch(err => res.status(501).send(err));
//       })
//       .catch(err => res.status(401).send(err))
//   );
// });

// exports.dones = functions.https.onRequest((req, res) => {
//   const tokenId = req.get("Authorization").split("Bearer ")[1];

//   return (
//     admin
//       .auth()
//       .verifyIdToken(tokenId)
//       // eslint-disable-next-line promise/always-return
//       .then(decoded => {
//         // res.status(200).send(decoded)
//         const uid = decoded.uid;

//         admin
//           .database()
//           .ref(`/users/${uid}/todos`)
//           .orderByChild("done")
//           .equalTo(true)
//           .once("value")
//           // eslint-disable-next-line promise/always-return
//           .then(dataSnapshot => {
//             var tasks = [];
//             dataSnapshot.forEach(child => {
//               tasks.push({
//                 title: child.val().title,
//                 created_at: child.val().created_at,
//                 description: child.val().description,
//                 expire_in: child.val().expire_in,
//                 done: child.val().done,
//                 _key: child.key
//               });
//             });
//             res.json(tasks);
//           })
//           .catch(err => res.status(501).send(err));
//       })
//       .catch(err => res.status(401).send(err))
//   );
// });

// exports.all = functions.https.onRequest((req, res) => {
//   const tokenId = req.get("Authorization").split("Bearer ")[1];

//   return (
//     admin
//       .auth()
//       .verifyIdToken(tokenId)
//       // eslint-disable-next-line promise/always-return
//       .then(decoded => {
//         // res.status(200).send(decoded)
//         const uid = decoded.uid;

//         admin
//           .database()
//           .ref(`/users/${uid}/todos`)
//           .orderByChild("expire_in")
//           .once("value")
//           // eslint-disable-next-line promise/always-return
//           .then(dataSnapshot => {
//             var tasks = [];
//             dataSnapshot.forEach(child => {
//               tasks.push({
//                 title: child.val().title,
//                 created_at: child.val().created_at,
//                 description: child.val().description,
//                 expire_in: child.val().expire_in,
//                 done: child.val().done,
//                 _key: child.key
//               });
//             });
//             res.json(tasks);
//           })
//           .catch(err => res.status(501).send(err));
//       })
//       .catch(err => res.status(401).send(err))
//   );
// });

// exports.me = functions.https.onRequest((req, res) => {
//   const tokenId = req.get("Authorization").split("Bearer ")[1];

//   return admin
//     .auth()
//     .verifyIdToken(tokenId)
//     .then(decoded => res.status(200).send(decoded))
//     .catch(err => res.status(401).send(err));
// });

module.exports = { graphql, addOnCreateVariableInTodo, addOnUpdateVariableInTodo };
