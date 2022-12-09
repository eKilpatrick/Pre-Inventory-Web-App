import { useEffect, useState } from "react";
import React from 'react';
import './CountdownIndicator.css'
import Countdown from 'react-countdown';

const CountDownIndicator = (props) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(props.show);
    }, [props.show]);

    const renderer =({seconds, completed}) => {
        if(props.show) {
            return (
                <span className="CountDownTheme">
                    {seconds}
                </span>
            )
        }
        else {
            setShow(false);
        }
    };

    return (
        <div style={{
            visibility: show ? "visible" : "hidden",
            opacity: show ? "1" : "0"
          }}>
            <Countdown date={Date.now() + props.time} renderer={renderer} className="CountDownTheme"/>
        </div>
    )
};

export default CountDownIndicator;