//lib imports
const express = require('express');
const db = require('./db.js');
const routeController = require('./route.js');

//express setup
const app = express();
app.use(express.json({limit: '50mb', strict: 'true'}));
app.use(express.static('public'));
port = 3000;

//general purpose functions
async function createSuccessfulResponse(name, data = null){
    if(data){
        response = { "success": true };
        response[name] = data;
        return response;
    }
    else
        return { "success": true };
}

async function createUnsuccessfulResponse(error){
    return { "success": false, "error": error };
}

//HTTP ROUTING
app.get("/routes", (request, response) => {
    routeController.getAll()
        .then(array => { return createSuccessfulResponse("routes", array);})
        .catch(error => { return createUnsuccessfulResponse(error); })
        .then(json => { response.send(json); });
});

app.post("/routes", (request, response) => {
    createUnsuccessfulResponse("NOT_IMPEMENTED_YET").then((json) =>{
        response.send(json);
    });
});

//Connecting to the database and opening the server for requests
db.connect()
    .then(() => {
        app.listen(port, () => console.log("Listening on port " + port + "..."));
    })
    .catch((error) => {
        console.log(error);
    });