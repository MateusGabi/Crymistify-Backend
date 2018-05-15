const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

const DATABASE = admin.database().ref();


// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

/**
 * Get all todos from an authenticated user
 */
const todos = functions.https.onCall((data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated')
    }

    return getTodosByUID(context.auth.uid)
});

const getTodosByUID = uid => {
    return new Promise((res, rej) => {

        if(!uid) {
            // eslint-disable-next-line prefer-promise-reject-errors
            rej({ error: 'unauthenticated'})
            return;
        }

        
        DATABASE.child('privateTodos')
        .orderByChild('user')
        .equalTo(user_id)
        .on('value', dataSnapshot => {
            const tasks = []

            dataSnapshot.forEach(child => {
                tasks.push({
                    titulo: child.val().titulo,
                        created_at: child.val().created_at,
                        descricao: child.val().descricao,
                        until_at: child.val().until_at,
                        done: child.val().done,
                        _key: child.key,
                    });
                });

            res(tasks)
            });
    })
}

module.exports = { todos }