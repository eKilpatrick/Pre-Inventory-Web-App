import React from 'react';
//import axios from 'axios';
//import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import '../App.css';
import '../BlueTheme.css';

function Home() {
    return (
        <div>
            <title>Home Page</title>
            <h1 style={{textAlign: 'center'}}>Inventory Home Page</h1>
            <Link to='/OrangeSheet'>
                <button className="BlueBtn">Initial Count</button>
            </Link>
            <Link to='/BlueSheet'>
                <button className="BlueBtn">Bin Contents</button>
            </Link>              
        </div>
    )
}

export default Home