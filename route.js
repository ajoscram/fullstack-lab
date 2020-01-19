const db = require('./db.js');

async function getAll(){
    return await db.query("routes");
}

module.exports = {
    getAll
}