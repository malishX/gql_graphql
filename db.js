const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'staging-omar-use.cgalft0ltrdh.eu-west-3.rds.amazonaws.com',
    user: 'root',
    password: 'jacka&dji7l',
    database: 'schoomp8_db',
});

const connection = db.connect(function(err){
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
    console.log('DB connection established');
});

const get = (query)=>{
    return new Promise ((resolve)=>{
        db.query(query , function (err, result){
            if(err) throw err;
            resolve(result);
        });
    });
}
module.exports = {db, connection, get}; 