const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const error = "DB_ERROR";

const database = {
    url: "mongodb://localhost:27017",
    name: "lab3",
    options: { useUnifiedTopology: true },
    instance: null
}


async function connect(){
    if(!database.instance){
        try{
            console.log('Connecting to the database...');
            const client = new MongoClient(database.url, database.options);
            await client.connect();
            console.log('Connected!');
            database.instance = client.db(database.name);
        } catch(mongo_error) {
            console.log(mongo_error);
            throw error;
        }
    }else{
        console.log("Already connected!");
    }
}


async function get(collection, filter){
    try{
        return await database.instance.collection(collection).findOne(filter);
    } catch(mongo_error){
        console.log(mongo_error);
        throw error;
    }
}

async function query(collection, filter){
    try{
        return await database.instance.collection(collection).find(filter).toArray();
    } catch(mongo_error){
        console.log(mongo_error);
        throw error;
    }
}

async function add(collection, object){
    try{
        return await database.instance.collection(collection).insertOne(object);
    } catch(mongo_error){
        console.log(mongo_error);
        throw error;
    }
}

async function update(collection, filter, operations){
    try{
        return await database.instance.collection(collection).updateOne(filter, operations);
    } catch(mongo_error){
        console.log(mongo_error);
        throw error;
    }
}

//add or update
async function addup(collection, operations, filter){
    try{
        return await database.instance.collection(collection).updateOne(filter, operations, {upsert: true});
    } catch(error){
        throw error_message;
    }
}

//update and get
async function upget(collection, filter, operations){
    try{
        return await database.instance.collection(collection).findOneAndUpdate(filter, operations);
    } catch(error){
        throw error_message;
    }
}

async function count(collection, filter){
    try{
        return await database.instance.collection(collection).countDocuments(filter);
    } catch(error){
        throw error_message;
    }
}

//WARNING! RETURNS NULL ON FUCK UP!
function getObjectID(_id){
    let oid = null;
    try{ oid = ObjectID(_id); }catch(error){}
    return oid;
}

module.exports = {
    connect,
    get,
    query,
    add,
    update,
    addup,
    upget,
    count,
    getObjectID
}