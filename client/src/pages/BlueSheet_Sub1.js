import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import CustomPopup from '../Components/CustomPopup';
import '../BlueTheme.css'
import {usePromiseTracker} from 'react-promise-tracker'; //New
import {trackPromise} from 'react-promise-tracker'; //New
import BlueRotatingLines from '../Components/RotatingLines';
//import { string } from 'prop-types';
//import CountDownIndicator from '../Components/CountdownIndicator'

function BlueSheet () {
    const {promiseInProgress} = usePromiseTracker(); //New
    const [ShowPage, SetShowPage] = useState(!promiseInProgress); //New

    const [listOfParts, SetListOfParts] = useState([]);

    const [newPN, setNewPN] = useState('');
    const [newQty, setNewQty] = useState('');

    const [ActiveBin, setActiveBin] = useState('');

    const [ShowPopup, setShowPopup] = useState(false);

    const handleChangePN = event => {
        setNewPN(event.target.value);
    };

    const handleChangeQty = event => {
        setNewQty(event.target.value);
    };

    const AllowPopup = event => {
        setShowPopup(true);
    }

    const StopPopup = event => {
        setShowPopup(false);
    }

    useEffect(() => {
        trackPromise(axios.get("http://10.244.56.88:3001/BlueSheet").then((result) => {
            SetListOfParts(result.data);
        }));
        trackPromise(axios.get("http://10.244.56.88:3001/BlueSheet/GetBin").then((result) => {
            setActiveBin(result.data);
        }));
    }, []);

    useEffect(() => {
        SetShowPage(!promiseInProgress);
    });

    return (
        <div>
            <BlueRotatingLines show={promiseInProgress}/>
            <div style={{
                visibility: ShowPage ? "visible" : "hidden",
                opacity: ShowPage ? "1" : "0"
                }}>
                <h1 className="Primary_Title">{"Bin: " + ActiveBin}</h1>

                <button className="BlueBtn" onClick={AllowPopup}>Add New Part</button>
                
                <CustomPopup onClose={StopPopup} show={ShowPopup} title={"New Part: " + ActiveBin}>
                    <div className="Secondary_Title">Partnumber:</div>
                    <input type="text" onChange={handleChangePN} className="RoundedTxtBox" autoFocus={true}></input>
                    <div className="Secondary_Title">Quantity:</div>
                    <input type="number" onChange={handleChangeQty} className="RoundedTxtBox"></input>
                    <button onClick={() => AddNewPart(newPN, newQty)} className="BlueBtn" >Submit</button>
                </CustomPopup>
    
                {CheckEmpty(listOfParts)}

                {listOfParts.map((value, key) => {
                    return (
                        <Part Partnumber={value.PARTNUMBER} Bin={value.BIN} Quantity={value.ACTUAL_QUANTITY} Description={value.DESCRIPTION}/>
                    )
            })}      
            </div>
        </div>
    )
}

function CheckEmpty (listOfParts) {
    if (listOfParts.length === 0) {
        return (
            <h1 className="Secondary_Title">Empty</h1>
        )
    }
}

function Part(props) {
    const [isShown, setIsShown] = useState(false);

    const handleShow = event => {
        setIsShown(true);
    }
    const StopShow = event => {
        setIsShown(false);
    }

    const [QtyChange, setQtyChange] = useState(0);
    const handleQtyChange = event => {
        setQtyChange(event.target.value);
    }

    return (
        <div>
            <button className="BlueBtn" onClick={handleShow}>
                <span style={{float: "left"}}>{props.Partnumber}</span>
                <span style={{float: "right"}}>{props.Quantity}</span>
            </button>
            
            <CustomPopup onClose={StopShow} show={isShown} title={props.Partnumber}>
                <div className="Secondary_Title">{"Current Qty: " + props.Quantity}</div>
                <input type="number" onChange={handleQtyChange} className="RoundedTxtBox" autoFocus={true} placeholder="Change (+/-)"></input>
                <button onClick={() => EditExistingPart(props.Bin, props.Partnumber, QtyChange, parseFloat(props.Quantity))} className="BlueBtn">Submit Change</button>
                <div>{"New Qty: " + (parseFloat(props.Quantity) + parseFloat(QtyChange))}</div>
            </CustomPopup>
        </div>
    );
}

async function EditExistingPart(Bin, PN, Change, OriginalQty) {
    if (Change === '' || Change === 0) {
        alert("You must enter a number!");
        return;
    }
    else if (isNaN(Change)) {
        alert("You must enter a number!");
        return;
    }

    //**********************
    let ActualQuantity = 0;
    await trackPromise(axios.put("http://10.244.56.88:3001/BlueSheet/OracleQty", {
        Bin: Bin,
        Partnumber: PN
    }).then((result) => {
        ActualQuantity = parseFloat(result.data.Qty);
    }))
    let NewQty = parseFloat(ActualQuantity) + parseFloat(Change);
    let SAPQty;
    let Description
    await trackPromise(axios.put("http://10.244.56.88:3001/BlueSheet/CheckPartQuantity", {
        'ActiveBin': Bin,
        'Partnumber': PN,
    }).then((result) => {
        SAPQty = parseFloat(result.data.Qty);
        Description = result.data.Description
    }))

    if (NewQty !== SAPQty) {
        alert("The quantity doesn't match SAP, please notify Dustin! The DB has a count of " + NewQty + " but SAP has " + SAPQty);
        return;
    }
    
    await trackPromise(axios.post("http://10.244.56.88:3001/BlueSheet", {
        Bin: Bin,
        Partnumber: PN,
        Description: Description,
        Change: Change,
        ActualQuantity: NewQty,
        SAPQty: SAPQty
    }));

    refreshPage();
};

async function AddNewPart(Bin, PN, Qty) {
    if (PN === '' || Qty === '') {
        alert("You must enter a Partnumber and Quantity before adding a part!");
    }
    else if (isNaN(Qty)) {
        alert("You must enter a number for the quantity!");
    }
    else {
        let SAPQty;
        await trackPromise(axios.put("http://10.244.56.88:3001/BlueSheet/CheckPartQuantity", {
            'ActiveBin': Bin,
            'Partnumber': PN,
        }).then((result) => {
            SAPQty = parseFloat(result.data.Qty);
        }))

        if (SAPQty !== parseFloat(Qty)) {
            alert("The quantity doesn't match SAP, please notify Dustin");
            return
        }

        //Add a check for SAP here and that will also get me the description necessary
        await trackPromise(axios.post("http://10.244.56.88:3001/BlueSheet", {
            Bin: Bin,
            Partnumber: PN,
            Description: "",
            Change: Qty,
            ActualQuantity: Qty,
            SAPQty: SAPQty
        }));
    }

    refreshPage();
}

function refreshPage() {
    window.location.reload(true);
};

export default BlueSheet