/* Didnt get why they are using strict */
"use strict";

/* 
	Also the verbose usage
	What in the hell they are using verbose for?
 */
const sqlite3 = require('sqlite3').verbose();
class Db {

	/* dont know which file they are refering */
	constructor(file){
		this.db = new sqlite3.Database(file);
		this.createTable();
	}
	/* 
		Create table
		Database operations involving modifications we use run method
	 */
	createTable() {

		const sql = `CREATE TABLE IF NOT EXISTS user (
			id integer PRIMARY KEY,
			name text,
			email text UNIQUE,
			user_pass text,
			is_admin integer
		)`;
		return this.db.run(sql);

	}
	/* 
		database operations such select
		we can use methods like get,all
	*/

	selectByEamil(email,callback) {
		return this.db.get(`SELECT * from   user where email=?`,[email] ,( err, row) => {
			callback(err,row);

		})
	}

	insertAdmin(user,callback) {

		return this.db.run( `INSERT into user ( name,email,user_pass,is_admin) VALUES (?,?,?,?)`,user, ( err) => { 

				callback(err);
		 	}

		);
	}

	selectAll(callback) {

		return this.db.all(`SELECT   * from user`, ( err, rows) => { 

			callback(err,rows);
		 });
	}

	insert(user, callback) {
        return this.db.run(
            'INSERT INTO user (name,email,user_pass) VALUES (?,?,?)',
            user, (err) => {
                callback(err)
            })
    }
}

module.exports = Db