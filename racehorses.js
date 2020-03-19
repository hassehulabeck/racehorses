const express = require('express')
const app = express()
const mongodbClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId // Behövs för att söka efter _id.

// Uppkopplingsinfo, som skrivs in i URI - se nedan
const user = encodeURIComponent('admin');
const password = encodeURIComponent('br0mmabl0cks');

let url = `mongodb://${user}:${password}@localhost:27017`


/* option-objektet i .connect-funktionen är för att slippa några grejer som är deprecated. Ta bort den så ser du ett litet notice-meddelande om det */
app.get('/', (req, res) => {
    mongodbClient.connect(url, {
        useUnifiedTopology: true
    }, (err, client) => {
        if (err) throw err
        let db = client.db('stable')
        findDocuments(db, (result) => {
            client.close()
            res.json(result)
        })
    })
})

/* ta emot id som en parameter */
app.get('/:horseid', (req, res) => {
    mongodbClient.connect(url, {
        useUnifiedTopology: true
    }, (err, client) => {
        if (err) throw err
        let db = client.db('stable')

        // Kolla horseid-parametern. Om den är ett bona fide-id, så kör vi. Detta blir också en liten säkerhetskontroll, eftersom vi på det sättet slipper skadlig kod.
        if (ObjectId.isValid(req.params.horseid)) {
            let horseid = new ObjectId(req.params.horseid)
            findOneDocument(db, horseid, (result) => {
                client.close()
                res.json(result)
            })
        }
    })
})


const findDocuments = function (db, callback) {
    // Get the documents collection
    const collection = db.collection('racehorses');
    // Find some documents
    collection.find({}).toArray(function (err, docs) {
        console.log("Found the following records");
        console.log(docs)
        callback(docs);
    });
}

const findOneDocument = function (db, horseid, callback) {
    const collection = db.collection('racehorses');
    // Find some documents
    collection.find({
        _id: horseid
    }).toArray(function (err, docs) {
        if (err) throw err
        callback(docs);
    });
}

app.listen(8080, () => {
    console.log("Lyssnar nu på 8080 och kör MongoDB")
})