const express = require('express')
const mongoose = require('mongoose')
const route = require('./src/route/route')
const app = express()

app.use(express.json())

mongoose.connect('mongodb+srv://ShadaabIqbal:9dwgAZ6YUEdRiDyx@mycluster.cuj3crc.mongodb.net/Project4', {useNewUrlParser: true}, mongoose.set('strictQuery', true))
.then(() => {console.log("MongoDB is connected")})
.catch((err) => {console.log(err.message)})

app.use('/', route)

app.listen(process.env.PORT || 3000, function() {
    console.log("Express app running on PORT" + " " + (process.env.PORT || 3000))
})