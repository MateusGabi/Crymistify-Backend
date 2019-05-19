'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.addMessage = functions.https.onRequest((req, res) => {

    const original = req.query.text;

    return admin.database().ref('/messages').push({ original: original }).then((snapshot) => {
        // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
        return res.redirect(303, snapshot.ref.toString());
    });

});

exports.addTodo = functions.https.onRequest((req, res) => {

    if (req.method !== 'POST') {
        return res.status(500).json({
            message: 'Not allowed'
        })
    }

    console.log('Request Body', req.body)
    console.log('Request Header', req.body)
    const tokenId = req.get('Authorization').split('Bearer ')[1];

    return admin.auth().verifyIdToken(tokenId).then(decoded => {
        console.log('User decoded', decoded)

        const { uid } = decoded;
        // const { title, description, until_at } = JSON.parse(req.body)

        const newTodo = {
            title: 'foo',
            description: 'bar',
            until_at: 'ontem',
            done: false,
            _key: new Date()
        }

        console.log('Todo', newTodo)
        const todoRef = admin.database().ref(`/users/${uid}/todos/foo`);

        return todoRef.push(newTodo).then(snapshot => {
            console.log('Save!', snapshot)
            return res.status(200).json({
                reference: snapshot.ref.toString()
            });
        }).catch(error => {
            console.error('Error to Save', error)
        })

    }).catch(error => {
        console.error('Error', error)
        res.status(501).json({ error })
    })
        
})

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onCreate((snapshot, context) => {

        // Grab the current value of what was written to the Realtime Database.
        const original = snapshot.val();

        console.log('Uppercasing', context.params.pushId, original);
        const uppercase = original.toUpperCase();

        // You must return a Promise when performing asynchronous tasks inside a Functions such as
        // writing to the Firebase Realtime Database.
        // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
        return snapshot.ref.parent.child('uppercase').set(uppercase);
    });

exports.todos = functions.https.onRequest((req, res) => {

    const tokenId = req.get('Authorization').split('Bearer ')[1];

    return admin.auth().verifyIdToken(tokenId)
        // eslint-disable-next-line promise/always-return
        .then((decoded) => {
            // res.status(200).send(decoded)
            const uid = decoded.uid

            admin.database()
                .ref(`/users/${uid}/todos`)
                .orderByChild("done")
                .equalTo(false)
                .once("value")
                // eslint-disable-next-line promise/always-return
                .then(dataSnapshot => {
                    var tasks = [];
                    dataSnapshot.forEach(child => {
                        tasks.push({
                            title: child.val().title,
                            created_at: child.val().created_at,
                            description: child.val().description,
                            expire_in: child.val().expire_in,
                            done: child.val().done,
                            _key: child.key,
                        });
                    });
                    res.json(tasks)
                })
                .catch((err) => res.status(501).send(err));
        })
        .catch((err) => res.status(401).send(err));


})

exports.dones = functions.https.onRequest((req, res) => {

    const tokenId = req.get('Authorization').split('Bearer ')[1];

    return admin.auth().verifyIdToken(tokenId)
        // eslint-disable-next-line promise/always-return
        .then((decoded) => {
            // res.status(200).send(decoded)
            const uid = decoded.uid

            admin.database()
                .ref(`/users/${uid}/todos`)
                .orderByChild("done")
                .equalTo(true)
                .once("value")
                // eslint-disable-next-line promise/always-return
                .then(dataSnapshot => {
                    var tasks = [];
                    dataSnapshot.forEach(child => {
                        tasks.push({
                            title: child.val().title,
                            created_at: child.val().created_at,
                            description: child.val().description,
                            expire_in: child.val().expire_in,
                            done: child.val().done,
                            _key: child.key,
                        });
                    });
                    res.json(tasks)
                })
                .catch((err) => res.status(501).send(err));
        })
        .catch((err) => res.status(401).send(err));

})

exports.all = functions.https.onRequest((req, res) => {

    const tokenId = req.get('Authorization').split('Bearer ')[1];

    return admin.auth().verifyIdToken(tokenId)
        // eslint-disable-next-line promise/always-return
        .then((decoded) => {
            // res.status(200).send(decoded)
            const uid = decoded.uid

            admin.database()
                .ref(`/users/${uid}/todos`)
                .orderByChild("expire_in")
                .once("value")
                // eslint-disable-next-line promise/always-return
                .then(dataSnapshot => {
                    var tasks = [];
                    dataSnapshot.forEach(child => {
                        tasks.push({
                            title: child.val().title,
                            created_at: child.val().created_at,
                            description: child.val().description,
                            expire_in: child.val().expire_in,
                            done: child.val().done,
                            _key: child.key,
                        });
                    });
                    res.json(tasks)
                })
                .catch((err) => res.status(501).send(err));
        })
        .catch((err) => res.status(401).send(err));

})

exports.me = functions.https.onRequest((req, res) => {
    const tokenId = req.get('Authorization').split('Bearer ')[1];

    return admin.auth().verifyIdToken(tokenId)
        .then((decoded) => res.status(200).send(decoded))
        .catch((err) => res.status(401).send(err));
});