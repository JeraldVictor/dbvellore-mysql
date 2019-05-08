const mysql      = require('mysql');

const connection = mysql.createConnection({
  host     : 'localhost',
  port:3306,
  user     : 'root',
  password : 'root',
  database : 'skl'
});
 
connection.connect((err)=>{
  if(err){
    console.log(err)
  }else{
    console.log("DB connected")
  }
});
setInterval(function () {
  connection.query('SELECT 1');
}, 5000);
module.exports = connection;