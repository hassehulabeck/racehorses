# Racehorses
## Kul för hela familjen!
## DB-justeringar
Den här koden i branch **getFather** skulle må bra av att du lägger till egenskapen father i en av hästarna, och som värde lägger ett id från någon annan häst.

Exempelvis (med MongoDB client)
```
db.racehorses.updateOne( {_id: ObjectId("5e7890639719e2b84e09384c")}, {$set: {father: ObjectId("5e7890639719e2b84e09384d")}})
```

Därefter kan du nyttja .js-koden och bör då få ut info om både barn och förälder när du exempelvis skriver in URLen ```http://localhost:8080/5e7890639719e2b84e09384c```

