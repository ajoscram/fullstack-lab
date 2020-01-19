const db = require('./db.js');

async function getAll(){
    return await db.query("routes");
}

async function add(route){
    return await db.add("routes", route);
}

module.exports = {
    getAll,
    add
}