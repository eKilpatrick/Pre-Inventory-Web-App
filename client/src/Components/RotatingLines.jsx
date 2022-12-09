import {RotatingLines} from 'react-loader-spinner'; //New
import { useEffect, useState } from "react";
import React from 'react';

const BlueRotatingLines = (props) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(props.show);
    }, [props.show]);

    return (
        <div style={{
            width: "100%",
            height: "100",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            visibility: show ? "visible" : "hidden",
            opacity: show ? "1" : "0"
        }}>
            <RotatingLines strokeColor="blue"/>
        </div>
    )
};

export default BlueRotatingLines;