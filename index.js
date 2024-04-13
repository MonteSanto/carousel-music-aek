const express = require('express'); //npm i express
const server = express();
// var cors = require('cors'); //npm i cors
// server.use(cors());

server.listen(5000, '0.0.0.0', () => {
    console.log("App is listening on port 5000");
});

server.use(express.static('dist'));

server.use('/fonts', express.static('fonts/'));
server.use('/icons', express.static('icons/'));
server.use('/images', express.static('images/'));
server.use('/music', express.static('music/'));
server.use('/src', express.static('src/'));

