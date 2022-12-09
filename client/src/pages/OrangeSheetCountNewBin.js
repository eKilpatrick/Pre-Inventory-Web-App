import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import '../App.css'
import {usePromiseTracker} from 'react-promise-tracker'; //New
import {trackPromise} from 'react-promise-tracker'; //New
import CountDownIndicator from '../Components/CountdownIndicator'

function OrangeSheet_CountNewBin () {
    const {promiseInProgress} = usePromiseTracker(); //New
    const [ActiveBin, setActiveBin] = useState('');
    const [ShowPage, setShowPage] = useState(!promiseInProgress);
    const [listSAP, setListSAP] = useState([]);

    useEffect(() => {
        trackPromise(axios.get("http://10.244.56.88:3001/BlueSheet/GetBin").then((result) => {
            setActiveBin(result.data);
        }));
        trackPromise(axios.put("http://10.244.56.88:3001/OrangeSheet/FirstCount").then((result) => {
            setListSAP(result.data);
        }));
    }, []);

    useEffect(() => {
        setShowPage(!promiseInProgress);
    });

    return (
        <div>
            <CountDownIndicator time={15000} show={promiseInProgress}/>
            <div style={{
                visibility: ShowPage ? "visible" : "hidden",
                opacity: ShowPage ? "1" : "0"
                }}>
                <h1 className="Primary_Title">{"Count Bin: " + ActiveBin}</h1>

                {listSAP.map((value, key) => {
                    return (
                        <PartRow Partnumber={value['Material']} Description={value['Material Description']} Bin={ActiveBin}/>
                    )
                })}
                <button className="BlueBtn">Submit Changes</button>
                
            </div>
        </div>
        
    )
}

function PartRow(props) {
    const [ShowDrop, setShowDrop] = useState(false);
    const [CountedQty, setCountedQty] = useState(0);

    const handleQty = event => {
        setCountedQty(parseFloat(event.target.value));
    }

    return (
        <div>
            <button style={{float: "left"}} onClick={() => setShowDrop(!ShowDrop)} className="SmallBlueBtn">{props.Partnumber}</button>
            <div style={{
                display: ShowDrop ? "block" : "none",
                overflow: "hidden",
                padding: "0 18px",
                marginBottom: "3px"
            }}>
                <span style={{float: "left"}}>{props.Description}</span>
                <input type="number" onChange={handleQty}/>
                <button onClick={() => SubmitCount(props.Bin ,props.Partnumber, CountedQty)}>Submit</button>
            </div>
            
        </div>
    )
}

async function SubmitCount(Bin, PN, Qty) {
    await trackPromise(
        axios.put("http://10.244.56.88:3001/OrangeSheet/SubmitCount", {
            Bin: Bin,
            Partnumber: PN,
            Qty: Qty
        })
    )

    refreshPage();
}

function refreshPage() {
    window.location.reload(true);
};

export default OrangeSheet_CountNewBin