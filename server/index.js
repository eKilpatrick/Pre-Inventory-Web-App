const express = require('express');
const app = express();
const cors = require('cors');
//const sapHana = require('./module_dev/SAP_Hana');
//const HanaClient = new sapHana("pt2.ecc.siemens-energy.com:3600", "z003vant", "PI2021@sfmrch");

app.use(express.json());
app.use(cors({
    origin: "*"
}));

//routers
const BlueSheetRouter = require('./routes/BlueSheet_Server.js');
app.use("/BlueSheet", BlueSheetRouter);
const OrangeSheetRouter = require('./routes/OrangeSheet_Server.js');
app.use("/OrangeSheet", OrangeSheetRouter);

//let result = HanaClient.RunTransaction("select * from lx02");

//npm start
app.listen(3001, async () => {
    console.log("Server running on port 3001");
});