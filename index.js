const express = require('express');

const app = express();

app.get('/',function(req,res){
    res.sendFile(__dirname + '/docs/index.html');
})
app.use(express.static('docs'));

app.listen(3000);

