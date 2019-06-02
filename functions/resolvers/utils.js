function getRandomColor() {
  const letters = '0123456789ABCDEF';
  const randomHexadecimal = letters.split('').sort(() => Math.random() < 0.5).slice(0, 6).reverse().join('')

  return '#' + randomHexadecimal
}

function genRandomId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

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

function createDatabaseReference(pathways, db) {
  const path = '/' + pathways.join('/')

  return db.ref(path)
}


module.exports = {
  getRandomColor,
 genRandomId,
 slugify,
 snapshotToArray,
 createDatabaseReference,
}