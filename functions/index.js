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
    // eslint-disable-next-line promise/always-return
    return admin.database().ref('/privateTodos').once("value").then(snapshot => {
        res.json(snapshot.val())
    })
})

exports.all = functions.https.onRequest((req, res) => {

    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.');
        res.status(403).send('Unauthorized');
        return;
    }

    let idToken;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');

        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        res.status(403).send('Unauthorized');
        return;
    }

    // eslint-disable-next-line promise/always-return
    return admin.auth().verifyIdToken(idToken).then((decodedIdToken) => {

        console.log('ID Token correctly decoded', decodedIdToken);

        // admin.database().ref('/privateTodos').once("value").then(snapshot => {
        //     res.json(snapshot.val())
        // })

    }).catch((error) => {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(403).send('Unauthorized');
        return;
    });
})

exports.me = functions.https.onRequest((req, res) => {
    const tokenId = req.get('Authorization').split('Bearer ')[1];

    return admin.auth().verifyIdToken(tokenId)
        .then((decoded) => res.status(200).send(decoded))
        .catch((err) => res.status(401).send(err));
});