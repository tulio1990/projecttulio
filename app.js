const express = require('express')

const app = express()

app.get('/',function(req,res){
    res.send('Hola Mundo')
})

app.listen(3000)
