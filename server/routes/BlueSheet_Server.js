const Oracle = require('../module_dev/Oracle');
const Router = require('express');
const router = Router();
const DB = new Oracle(config.user, config.password, config.server, config.name);
var xlsx = require("xlsx");
const fs = require('fs');
const { exit } = require('process');

module.exports = router;

// GET: Selects the parts in the active bin in the DB
router.get("/", async (req, res) => {
    console.log("GET /BlueSheet Requested by " + req.ip + " : Selecting Parts in Active Bin");
    var query = "SELECT ACTIVEBIN FROM SFM_RCH.Y_WEBAPP_ACTIVEBIN WHERE CLIENT_IP = '" + req.ip + "'"
    var result = await DB.SelectFromDB(query);
    let query2 = "";

    query2 = "SELECT * FROM SFM_RCH.VIEW_Y_WEBAPP WHERE BIN = '" + result.rows[0].ACTIVEBIN + "'";
    
    result = await DB.SelectFromDB(query2);

    console.log("Server IDLE");
    res.json(result.rows);
});

router.get("/GetBin", async (req, res) => {
    console.log("GET /BlueSheet/GetBin Requested by " + req.ip + " : Selecting Active Bin");
    var query = "SELECT ACTIVEBIN FROM SFM_RCH.Y_WEBAPP_ACTIVEBIN WHERE CLIENT_IP = '" + req.ip + "'";
    var result = await DB.SelectFromDB(query);

    console.log("Server IDLE");
    res.send(result.rows[0].ACTIVEBIN);
});

router.put("/OracleQty", async(req, res) => {
    let query = "SELECT ACTUAL_QUANTITY FROM SFM_RCH.VIEW_Y_WEBAPP WHERE BIN = '" + req.body.Bin + "' AND PARTNUMBER = '" + req.body.Partnumber + "'";
    let result = await DB.SelectFromDB(query);

    res.send({Qty: result.rows[0].ACTUAL_QUANTITY});
})

// PUT: Sets the proper bin to active in the DB
router.put("/", async (req, res) => {
    console.log("PUT /BlueSheet Requested by " + req.ip + " : Setting Bin " + req.body.ActiveBin + " to Active");

    var ActiveBin = req.body.ActiveBin;

    var query = "SELECT * FROM SFM_RCH.Y_WEBAPP_ACTIVEBIN WHERE CLIENT_IP = '" + req.ip + "'";
    var result = await DB.SelectFromDB(query);
    let query2;
    try {
        if (result.rows[0].ACTIVEBIN != '') {
            query2 = "UPDATE SFM_RCH.Y_WEBAPP_ACTIVEBIN SET ACTIVEBIN = '" + ActiveBin + "' WHERE CLIENT_IP = '" + req.ip + "'";
        }
    } catch (error) {
        query2 = "INSERT INTO SFM_RCH.Y_WEBAPP_ACTIVEBIN (CLIENT_IP, ACTIVEBIN) VALUES ('" + req.ip + "', '" + ActiveBin + "')";
    }

    await DB.InsertUpdateDB(query2);

    console.log("Server IDLE");
    res.sendStatus(200);
});

router.put("/CheckBin", async (req, res) => {
    console.log("PUT /BlueSheet/CheckBin Requested by " + req.ip + " : Checking if Bin " + req.body.Bin + " exists and/or is counted");
    var Bin = req.body.Bin;

    var query = "SELECT * FROM SFM_RCH.Y_WEBAPP_BINS WHERE BIN = '" + Bin + "'";
    var result = await DB.SelectFromDB(query);

    let response = {
        Exists: '',
        Counting: '',
        Counted: '',
        DateCounted: ''
    }
    try {
        if (result.rows[0].COUNTED === '1') {
            response.Exists = 'true';
            response.Counted = 'true';
            response.Counting = 'true';
            response.DateCounted = result.rows[0].DATE_COUNTED;
        }
        else if (result.rows[0].COUNTING === '1') {
            response.Exists = 'true';
            response.Counted = 'false';
            response.Counting = 'true';
            response.DateCounted = result.rows[0].DATE_COUNTED;
        }
        else {
            response.Exists = 'true';
            response.Counted = 'false';
            response.Counting = 'false';
        }
    } catch (error) {
        response.Exists = 'false';
    }

    console.log("Server IDLE");
    res.send(response);
})

router.put("/CheckPartQuantity", async (req, res) => {
    let ActiveBin = req.body.ActiveBin;
    let PartNum = req.body.Partnumber;

    var fileName = await RunLX02(ActiveBin, req.ip);

    var workbook = xlsx.readFile(fileName);
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];
    var jsa = xlsx.utils.sheet_to_json(worksheet, {raw: true});

    let Quantity = 0.0;
    let Description = "";
    jsa.forEach(forObj);
    async function forObj (jsonObj) {
        if (jsonObj['Material'] === PartNum) {
            Quantity = parseFloat(jsonObj['Available stock']);
            Description = jsonObj['Material Description'];
        }
    }

    console.log("Server IDLE");
    res.json({Qty: Quantity, Description: Description});
})

// POST: Changes the count of parts currently in the bin in the DB
router.post("/", async (req, res) => {
    console.log("POST /BlueSheet Requested by " + req.ip + " : Updating Count of " + req.body.Partnumber + " in Bin " + req.body.Bin);
    var Bin = req.body.Bin;
    var Partnumber = req.body.Partnumber;
    var Description = req.body.Description;
    var Change = req.body.Change;
    var NewQty = req.body.ActualQuantity;
    var SAPQty = req.body.SAPQty;
    const date = new Date();
    var dateFormatted = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
    const dateString = "TO_DATE('" + dateFormatted + "', 'DD-MM-YYYY HH24:MI:SS')";

    var query = "INSERT INTO SFM_RCH.Y_WEBAPP_BLUESHEET (BIN, PARTNUMBER, CHANGE, TRANSACTION_DATE, SAP_QUANTITY, ACTUAL_QUANTITY, DESCRIPTION) VALUES ('" + Bin + "', '" + Partnumber + "', '" + Change + "', " + dateString + ", '" + SAPQty + "', '" + NewQty + "', '" + Description + "')";
    await DB.InsertUpdateDB(query);

    console.log("Server IDLE");
    res.sendStatus(200);
});


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