import React from 'react';
import axios from 'axios';
import {useEffect, useState} from 'react';
import {usePromiseTracker} from 'react-promise-tracker'; //New
import {trackPromise} from 'react-promise-tracker'; //New
import BlueRotatingLines from '../Components/RotatingLines';
import { useNavigate } from 'react-router-dom';
import CustomPopup from '../Components/CustomPopup';

function OrangeSheetCountSecondBin () {
    const navigate = useNavigate();
    const [listOrangeSheet, setList] = useState([]);
    const [ActiveBin, setActiveBin] = useState('');

    const [ShowAddPart, setShowAddPart] = useState(false);
    const [AddPN, setAddPN] = useState('');
    const [AddQty, setAddQty] = useState('');
    const changePN = event => {
        setAddPN(event.target.value);
    }
    const changeQty = event => {
        setAddQty(event.target.value);
    }

    const {promiseInProgress} = usePromiseTracker(); //New
    const [ShowPage, setShowPage] = useState(!promiseInProgress);

    useEffect(() => {
        trackPromise(
            axios.get("http://10.244.56.88:3001/BlueSheet/GetBin").then((result) => {
                setActiveBin(result.data);
            })
        );

        trackPromise(
            axios.put("http://10.244.56.88:3001/OrangeSheet/SecondCount").then((result) => {
                setList(result.data);
            })
        )
    }, [])

    useEffect(() => {
        setShowPage(!promiseInProgress);
    });

    async function FinishBin(Bin) {
        let response = window.confirm("Are you sure you would like to close this Bin? Any parts not counted will be marked as 0 in the bin");
        if (!response) {
            return;
        }
        await axios.put("http://10.244.56.88:3001/OrangeSheet/FinishBin", {
                Bin: Bin,
        })
        navigate('/');
    }

    return (
        <div>
            <BlueRotatingLines show={!ShowPage}></BlueRotatingLines>
            <div style={{
                visibility: ShowPage ? "visible" : "hidden",
                opacity: ShowPage ? "1" : "0"
                }}>
                <h1 className="Primary_Title">{"Count Bin: " + ActiveBin}</h1>

                <button className="SmallBlueBtn" onClick={() => setShowAddPart(true)}>Add Part</button>

                <CustomPopup onClose={() => setShowAddPart(false)} show={ShowAddPart} title={"New Part: " + ActiveBin}>
                    <div className="Secondary_Title">Partnumber:</div>
                    <input type="text" onChange={changePN} className="RoundedTxtBox" autoFocus={true}></input>
                    <div className="Secondary_Title">Quantity:</div>
                    <input type="number" onChange={changeQty} className="RoundedTxtBox"></input>
                    <button onClick={() => AddPart(AddPN, AddQty, ActiveBin)} className="BlueBtn" >Submit</button>
                </CustomPopup>

                {listOrangeSheet.map((value, key) => {
                    return (
                        <PartRow Partnumber={value['PARTNUMBER']} Description={value['DESCRIPTION']} CountedQty={value['ACTUAL_QUANTITY']} Bin={ActiveBin}/>
                    )
                })}
                <button className="BlueBtn" onClick={() => FinishBin(ActiveBin)}>Finish Bin</button>
                
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
            <button style={{float: "left"}} onClick={() => setShowDrop(!ShowDrop)} className={!isNaN(parseFloat(props.CountedQty)) ? "SmallGreenBtn" : "SmallBlueBtn"}>{props.Partnumber}</button>
            <div style={{
                display: ShowDrop ? "block" : "none",
                overflow: "hidden",
                padding: "0 18px",
                marginBottom: "3px"
            }}>
                <span style={{float: "left"}}>{props.Description}</span>
                <input type="number" onChange={handleQty} defaultValue={parseFloat(props.CountedQty)}/>
                <button onClick={() => SubmitChanges(props.Bin, props.Partnumber, CountedQty)}>Submit</button>
            </div>
        </div>
    )
}

async function AddPart(PN, Qty, Bin) {
    if (PN === "") {
        alert("You must enter in a partnumber");
        return;
    }
    else if (isNaN(parseFloat(Qty))) {
        alert("You must enter a number for the quantity");
        return;
    }
    await trackPromise(
        axios.post("http://10.244.56.88:3001/OrangeSheet/AddPart", {
            Bin: Bin,
            Partnumber: PN,
            Qty: Qty
        })
    )

    refreshPage();
}

async function SubmitChanges (Bin, PN, Qty) {
    if (isNaN(parseFloat(Qty))) {
        alert("Please enter an actual number");
        return;
    }
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

export default OrangeSheetCountSecondBin;