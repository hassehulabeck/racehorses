const express = require('express')
const app = express()
const mongodbClient = require('mongodb').MongoClient
let ObjectId = require('mongodb').ObjectId // Behövs för att söka efter _id.
const secrets = require('./secrets.js')
const bodyParser = require('body-parser')

app.use(bodyParser.json())

// Kunna hantera postningar från Postman
app.use(express.urlencoded({
    extended: true
}))

// Uppkopplingsinfo, som skrivs in i URI - se nedan
const user = encodeURIComponent(secrets.user);
const password = encodeURIComponent(secrets.password);

let url = `mongodb://${user}:${password}@localhost:27017`


/* option-objektet i .connect-funktionen är för att slippa några grejer som är deprecated. Ta bort den så ser du ett litet notice-meddelande om det */
app.get('/', (req, res) => {
    mongodbClient.connect(url, {
        useUnifiedTopology: true
    }, (err, client) => {
        if (err) throw err
        let db = client.db('stable')
        findDocument(db, null, (result) => {
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
            findDocument(db, req.params.horseid, (result) => {
                let fatherId = result[0].father
                let father
                console.log(fatherId)
                if (fatherId != null) {
                    findDocument(db, fatherId, (fatherResult) => {
                        father = fatherResult
                        res.json([result, {
                            info: "Kolla farsan"
                        }, father])
                        client.close()

                    })

                } else {
                    res.json(result)
                    client.close()
                }
            })
        }
    })
})

app.post('/', (req, res) => {
    mongodbClient.connect(url, {
        useUnifiedTopology: true
    }, (err, client) => {
        if (err) throw err
        let db = client.db('stable')

        // Lägg in post-data
        const collection = db.collection('racehorses')

        // Utvinn data ur req.body genom att loopa igenom dess egenskaper
        let document = {}
        for (const key of Object.keys(req.body)) {

            /* I och med att jag har satt en valideringsregel på att value ska vara av typen int, så måste jag omvandla formulärdatan till rätt format. 
            Den som vill studera vidare bör titta på Mongoose, som sköter denna del på ett betydligt enklare sätt, men det skadar ju inte att jobba manuellt ibland. */
            if (key == "value")
                document[key] = parseInt(req.body[key])
            else
                document[key] = req.body[key]
        }

        collection.insertOne(document, (err, result) => {
            if (err) throw err
            res.send(result)
        })
    })
})


const findDocument = function (db, horseid = null, callback) {
    const collection = db.collection('racehorses');

    // Horseid or not, here I come...
    // Antingen är searchquery ett tomt objekt (visa alla), eller så är det ett objekt fyllt av _id och rätt horseid.
    let searchquery = horseid == null ? {} : {
        _id: new ObjectId(horseid)
    }
    // Find some documents
    collection.find(searchquery).toArray(function (err, docs) {
        if (err) throw err
        callback(docs);
    });
}

app.listen(8080, () => {
    console.log("Lyssnar nu på 8080 och kör MongoDB")
})