const Oracle = require('../module_dev/Oracle');
const Router = require('express');
const router = Router();
const DB = new Oracle(config.user, config.password, config.server, config.name);
var xlsx = require("xlsx");
const fs = require('fs');

module.exports = router;

// GET: This gets all of the previously counted bins from the DB
router.get("/", async (req, res) => {
    console.log("GET /OrangeSheet Requested by " + req.ip + " : Selecting Counted vs Uncounted Bins");
    var query = "SELECT BIN FROM Y_WEBAPP_BINS WHERE COUNTED = '1'";
    var query2 = "SELECT BIN FROM Y_WEBAPP_BINS WHERE COUNTED = '0'"
    let response = {
        CountedBins: [],
        UncountedBins: []
    }
    let result;
    result = await DB.SelectFromDB(query);
    response.CountedBins = result.rows;
    result = await DB.SelectFromDB(query2);
    response.UncountedBins = result.rows;

    console.log("Server IDLE");
    res.send(response);
});

// PUT: This retrieves the bin data from SAP and dumps it to Oracle
router.put("/FirstCount", async (req, res) => {
    console.log("PUT /OrangeSheet/FirstCount Requested by " + req.ip + " : Retrieving data from SAP and dumping to DB");

    let queryBin = "SELECT ACTIVEBIN FROM SFM_RCH.Y_WEBAPP_ACTIVEBIN WHERE CLIENT_IP = '" + req.ip + "'";
    let result = await DB.SelectFromDB(queryBin);

    try {
        if (req.body.CountAgain) {
            let queryReset = "UPDATE SFM_RCH.Y_WEBAPP_BINS SET COUNTING = '0', COUNTED = '0', DATE_COUNTED = '' WHERE BIN = '" + result.rows[0].ACTIVEBIN + "'";
            await DB.InsertUpdateDB(queryReset);
    
            let queryDeleteOrange = "DELETE FROM SFM_RCH.Y_WEBAPP_ORANGESHEET WHERE BIN = '" + result.rows[0].ACTIVEBIN + "'";
            let queryDeleteBlue = "DELETE FROM SFM_RCH.Y_WEBAPP_BLUESHEET WHERE BIN = '" + result.rows[0].ACTIVEBIN + "'";
            await DB.InsertUpdateDB(queryDeleteOrange);
            await DB.InsertUpdateDB(queryDeleteBlue);
        }
    } catch (error) {
    }
    
    //Runs the SAP transaction and saves the excel file to C:\WebApp_NodeJS\server\GUI_Scripting\
    var fileName = await RunLX02(result.rows[0].ACTIVEBIN, req.ip);

    var workbook = xlsx.readFile(fileName);
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var jsa = xlsx.utils.sheet_to_json(worksheet, {raw: false});

    //************
    //Insert the information pulled from SAP into the Y_Webapp_Orangesheet table along with the current date.
    var date = new Date();
    var dateFormatted = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    const dateString = "TO_DATE('" + dateFormatted + "', 'DD-MM-YYYY HH24:MI:SS')";

    jsa.forEach(jsonList);
    async function jsonList (jsonObj) {
        let Bin = result.rows[0].ACTIVEBIN;
        let PartNumber = jsonObj['Material'];
        let Description = jsonObj['Material Description'];
        let SAP_Qty = jsonObj['Available stock'];
        let queryInsert = "INSERT INTO SFM_RCH.Y_WEBAPP_ORANGESHEET (BIN, PARTNUMBER, DESCRIPTION, UPLOADED_DATE, SAP_QUANTITY) VALUES ('" + Bin + "', '" + PartNumber + "', '" + Description + "', " + dateString + ", '" + SAP_Qty + "')";
        await DB.InsertUpdateDB(queryInsert);
        //console.log(queryInsert);
    }
    let queryCounted = "UPDATE SFM_RCH.Y_WEBAPP_BINS SET COUNTING = '1', DATE_COUNTED = " + dateString + " WHERE BIN = '" + result.rows[0].ACTIVEBIN + "'";
    await DB.InsertUpdateDB(queryCounted);
    //************

    let queryGet = "SELECT * FROM SFM_RCH.Y_WEBAPP_ORANGESHEET WHERE BIN = '" + result.rows[0].ACTIVEBIN + "'";
    result = await DB.SelectFromDB(queryGet);

    console.log("Server IDLE");
    //res.send(jsa);
    res.sendStatus(200);
})

router.put("/SecondCount", async(req, res) => {
    let queryBin = "SELECT ACTIVEBIN FROM SFM_RCH.Y_WEBAPP_ACTIVEBIN WHERE CLIENT_IP = '" + req.ip + "'";
    let result = await DB.SelectFromDB(queryBin);
    let Bin = result.rows[0].ACTIVEBIN;

    let queryParts = "SELECT * FROM SFM_RCH.Y_WEBAPP_ORANGESHEET WHERE BIN = '" + Bin + "'";
    result = await DB.SelectFromDB(queryParts);
    
    res.send(result.rows);
})

router.put("/SubmitCount", async(req, res) => {
    let query = "UPDATE SFM_RCH.Y_WEBAPP_ORANGESHEET SET ACTUAL_QUANTITY = '" + req.body.Qty + "' WHERE BIN = '" + req.body.Bin + "' AND PARTNUMBER = '" + req.body.Partnumber + "'"
    await DB.InsertUpdateDB(query);

    res.sendStatus(200);
})

router.put("/FinishBin", async(req, res) => {
    let query = "UPDATE SFM_RCH.Y_WEBAPP_ORANGESHEET SET ACTUAL_QUANTITY = '0' WHERE ACTUAL_QUANTITY IS NULL AND BIN = '" + req.body.Bin + "'"
    await DB.InsertUpdateDB(query);

    let query2 = "UPDATE SFM_RCH.Y_WEBAPP_BINS SET COUNTED = '1' WHERE BIN = '" + req.body.Bin + "'"
    await DB.InsertUpdateDB(query2);

    res.sendStatus(200);
})

router.put("/SetActiveBin", async (req, res) => {
    console.log("PUT /OrangeSheet/SetActiveBin Requested by " + req.ip + " : Setting Bin " + req.body.bin + " to active");
    await SetActiveBin(req.body.Bin, req.ip);

    console.log("Server IDLE");
    res.sendStatus(200);
});

async function SetActiveBin(Bin, IP) {
    var query = "SELECT * FROM SFM_RCH.Y_WEBAPP_ACTIVEBIN WHERE CLIENT_IP = '" + IP + "'";
    var result = await DB.SelectFromDB(query);
    let query2;
    try {
        if (result.rows[0].ACTIVEBIN != '') {
            query2 = "UPDATE SFM_RCH.Y_WEBAPP_ACTIVEBIN SET ACTIVEBIN = '" + Bin + "' WHERE CLIENT_IP = '" + IP + "'";
        }
    } catch (error) {
        query2 = "INSERT INTO SFM_RCH.Y_WEBAPP_ACTIVEBIN (CLIENT_IP, ACTIVEBIN) VALUES ('" + IP + "', '" + Bin + "')";
    }

    await DB.InsertUpdateDB(query2);

}

router.post("/AddPart", async(req, res) => {
    let PN = req.body.Partnumber;
    let Qty = req.body.Qty;
    let Bin = req.body.Bin;
    const date = new Date();
    var dateFormatted = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
    const dateString = "TO_DATE('" + dateFormatted + "', 'DD-MM-YYYY HH24:MI:SS')";

    let query = "INSERT INTO SFM_RCH.Y_WEBAPP_ORANGESHEET (BIN, PARTNUMBER, DESCRIPTION, ACTUAL_QUANTITY, UPLOADED_DATE, SAP_QUANTITY) VALUES ('" + Bin + "', '" + PN + "', '', '" + Qty + "', " + dateString + ", '0')"
    await DB.InsertUpdateDB(query);
    res.sendStatus(200);
})

async function RunLX02(Bin, ip) {
    const date = new Date();
    var dateFormatted = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
    const dateString = "TO_DATE('" + dateFormatted + "', 'DD-MM-YYYY HH24:MI:SS')";

    let query = "INSERT INTO SFM_RCH.Y_WEBAPP_SCRIPT_QUEUE (TRANSACTION, DETAILS, REQUEST_DATE, REQUEST_IP) VALUES('LX02', '" + Bin + "', " + dateString + ", '" + ip + "')";
    await DB.InsertUpdateDB(query);

    query = "SELECT * FROM SFM_RCH.Y_WEBAPP_SCRIPT_QUEUE WHERE TRANSACTION = 'LX02' AND DETAILS = '" + Bin + "' AND REQUEST_IP = '" + ip + "' AND REQUEST_DATE = TO_DATE('" + dateFormatted + "', 'DD-MM-YYYY HH24:MI:SS')";
    let result = ""
    do {
        result = await DB.SelectFromDB(query)
    } while (!result.rows[0].FULFILLED_DATE);

    return result.rows[0].FILE_NAME

    //This means that the vb.net program has completed the SAP transaction request
}