const express = require('express');
const app = express();

app.use(express.json());

app.get('/klk',(req,res) =>{
    res.status(200).json('klk puto funciono');
});

app.listen(3000,() => console.log("Servidor arriba"))