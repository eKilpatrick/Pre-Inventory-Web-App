import React from 'react';
import axios from 'axios';
import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import '../App.css';
import '../BlueTheme.css';
import {usePromiseTracker} from 'react-promise-tracker'; //New
import {trackPromise} from 'react-promise-tracker'; //New
import BlueRotatingLines from '../Components/RotatingLines';

function BlueSheet () {
    const {promiseInProgress} = usePromiseTracker(); //New
    const navigate = useNavigate();

    const [message, setMessage] = useState('');

    const handleChange = event => {
        setMessage(event.target.value);
    };

    const [ShowPage, SetShowPage] = useState(true);

    useEffect(() => {
        SetShowPage(!promiseInProgress);
    });

    async function SetActiveDB () {
        if (message === '') {
            alert("Please type in a bin first!");
            return
        }  
        console.log("Setting " + message + " to be the active bin.");
        
        var response = await trackPromise(axios.put("http://10.244.56.88:3001/BlueSheet/CheckBin", {
            'Bin': message.toUpperCase()
        }));

        if (response.data.Exists === 'true') {
            if (response.data.Counted === 'true') {
                await trackPromise(axios.put("http://10.244.56.88:3001/BlueSheet", {
                    'ActiveBin': message.toUpperCase()
                }));
            }
            else if (response.data.Counting === 'true') {
                alert("Bin " + message.toUpperCase() + " is STILL OPEN TO COUNT! The counts must be submitted before any transaction to the bin can be done.");
                return
            }
            else {
                alert("Bin " + message.toUpperCase() + " has not been counted yet so its contents cannot be displayed!");
                return
            }
        }
        else {
            alert("That is not a valid Bin. Please enter a valid one and try again!");
            return
        }

        navigate('/BlueSheet_Sub1');
    };

    return (
        <div>
            <BlueRotatingLines show={promiseInProgress}/>
            <div style={{
                visibility: ShowPage ? "visible" : "hidden",
                opacity: ShowPage ? "1" : "0"
            }}>
                <h1 className="Font_Center">Open Bin</h1>

                <input type="text" name="Bin" onChange={handleChange} className="RoundedTxtBox" onKeyUp={(e) => {if (e.key === "Enter") {SetActiveDB();}}} autoFocus={true} placeholder="Bin Number"></input>

                <button onClick={SetActiveDB} className="BlueBtn">See Contents</button>

                <div>{message}</div>
            </div>
        </div>
    )
}

export default BlueSheet