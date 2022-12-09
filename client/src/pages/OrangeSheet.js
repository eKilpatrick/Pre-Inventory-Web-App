import React from 'react';
import axios from 'axios';
import {useEffect, useState, useRef} from 'react';
import '../App.css'
import {useNavigate} from 'react-router-dom';
import {usePromiseTracker} from 'react-promise-tracker'; //New
import {trackPromise} from 'react-promise-tracker'; //New
import BlueRotatingLines from '../Components/RotatingLines';
import CountDownIndicator from '../Components/CountdownIndicator';

function OrangeSheet () {
    const {promiseInProgress} = usePromiseTracker(); //New
    const [ShowPage, SetShowPage] = useState(true); //New
    
    const navigate = useNavigate();

    const [SearchBin, SetSearchBin] = useState('');

    const handleChangeBin = event => {
        SetSearchBin(event.target.value);
    }

    useEffect (() => {
        SetShowPage(!promiseInProgress);
    });

    async function CountBin (Bin) {

        var response = await axios.put("http://10.244.56.88:3001/BlueSheet/CheckBin", {
            'Bin': Bin
        });

        if (response.data.Exists === 'true') {
            await axios.put("http://10.244.56.88:3001/BlueSheet", {
                    'ActiveBin': Bin
            });

            //Counting for this Bin has already been completed
            if (response.data.Counted === 'true') {
                let result = window.confirm("Counting for this bin has been COMPLETED. Do you want to recount the Bin?");

                if (result) {
                    await trackPromise(ReDumpSAPtoOracle());
                    navigate('/OrangeSheetCountSecondBin');
                }
                else {
                    return
                }
            }
            //Counting for this Bin is in progress
            else if (response.data.Counting === 'true') {
                alert("Counting in PROGRESS");

                navigate('/OrangeSheetCountSecondBin');
            }
            //The Bin has not begun the counting process yet
            else {
                await trackPromise(DumpSAPtoOracle());
                navigate('/OrangeSheetCountSecondBin');
            }
        }
        else {
            alert("That is not a valid Bin. Please enter a valid one and try again!");
            return
        }  
    }

    return (
        <div>
            <CountDownIndicator time={15000} show={promiseInProgress}/>
            <div style={{
                visibility: ShowPage ? "visible" : "hidden",
                opacity: ShowPage ? "1" : "0"
            }}>
                <h1 className="Primary_Title">Bin Counting</h1>
                <input type="text" className="RoundedTxtBox" placeholder="Bin Number" onChange={handleChangeBin} onKeyUp={(e) => {if (e.key === "Enter") {CountBin(SearchBin.toUpperCase(), 'false')}}} autoFocus={true}></input>
                <button className="BlueBtn" onClick={() => CountBin(SearchBin.toUpperCase(), 'false')}>Count Bin</button>
            </div>
        </div>
    )
}

async function DumpSAPtoOracle() {
    await trackPromise(
        axios.put("http://10.244.56.88:3001/OrangeSheet/FirstCount", {
            CountAgain: "false"
        })
    )
}

async function ReDumpSAPtoOracle() {
    await trackPromise(
        axios.put("http://10.244.56.88:3001/OrangeSheet/FirstCount", {
            CountAgain: "true"
        })
    )
}

export default OrangeSheet