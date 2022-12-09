class Oracle {
    oracledb = require('oracledb');
    PoolAttrs = null;

    constructor(user, password, OracleString, Alias) {
        this.PoolAttrs = {
            'username': user,
            'password': password,
            'connectionString': OracleString,
            'poolAlias': Alias
        }
        this.CreatePool();
    }

    async CreatePool() {
        try {
            console.log("Creating DB Connection Pool");
            this.Pool = await this.oracledb.createPool(this.PoolAttrs);
        } catch (error) {
            console.log("Pool Creation Error: " + err.message);
        }
        finally {
            console.log("Finished Creating Pool: " + this.PoolAttrs.poolAlias);
        }
    }

    async SelectFromDB(query) {
        console.log("\tBeginning Query: " + query);

        let connection;
        let results;
        let resultVec = [];
        try {
            this.oracledb.outFormat = this.oracledb.OUT_FORMAT_OBJECT;
            //{user: this.user, password: this.password, connectionString: this.OracleString} Was in the getConnection call until the connection pool was put to use
            connection = await this.oracledb.getConnection(this.PoolAttrs.poolAlias);
            results = await connection.execute(query, [], {outFormat: this.oracledb.OUT_FORMAT_OBJECT});
            //resultSet: true, 
            //var rs = results.resultSet;
            //let row;

            //while ((row = await rs.getRow())) {
            //    resultVec.push(row);
            //}
            //await rs.close();
            
        }
        catch(err) {
            throw err;
        }
        finally {
            if (connection) {
                try {
                    await connection.close();
                }
                catch(err) {
                }
            }
            console.log("\tQuery Complete");
            return results;
        }
    }

    async InsertUpdateDB(query) {
        console.log("\tBeginning Query: " + query);
        let connection;
        try {
            this.oracledb.outFormat = this.oracledb.OUT_FORMAT_OBJECT;
            //{user: this.user, password: this.password, connectionString: this.OracleString}
            connection = await this.oracledb.getConnection(this.PoolAttrs.poolAlias);
            await connection.execute(query);
            connection.commit();
        }
        catch(err) {
            throw err;
        }
        finally {
            if (connection) {
                try {
                    await connection.close();
                }
                catch(err) {
                }
            }
            console.log("\tQuery Complete");
        }
    }
}

module.exports = Oracle;