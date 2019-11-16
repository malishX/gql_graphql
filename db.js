const mysql = require('mysql');
const dbconfig = require('./dbconfig');


const db = mysql.createConnection(dbconfig.local);

const connection = db.connect(function(err){
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
    console.log('DB connection established');
});

const get = (query)=>{
    return new Promise ((resolve)=>{
        // console.log(query);
        db.query(query , function (err, result){
            if(err) throw err;
            resolve(result);
        });
    });
}
module.exports = {db, connection, get}; 