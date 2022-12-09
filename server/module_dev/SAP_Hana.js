const hana = require('@sap/hana-client')
var PromiseModule = require('@sap/hana-client/extension/Promise.js');

//https://developers.sap.com/tutorials/hana-clients-node.html
//https://www.npmjs.com/package/@sap/hana-client?activeTab=readme
//Use the connect, query, disconnect method for testing until verified that it works, then switch to the Async App using the Promise Module

class SAP_Hana {
    serverAttrs = null

    //ServerNode: host:port
    constructor (serverNode, user, password) {
        this.serverAttrs = {
            'serverNode': serverNode,
            'uid': user,
            'pwd': password,
            'sslValidateCertificate': 'false'
        }
    }

    async RunTransaction(dbQuery) {
        try {
            let conn = hana.createConnection();
            await PromiseModule.connect(conn, this.serverAttrs);

            let result = await PromiseModule.exec(conn, dbQuery);
            
            conn.disconnect();
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SAP_Hana;