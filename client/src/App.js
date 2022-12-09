import './App.css';
import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import BlueSheet from './pages/BlueSheet';
import OrangeSheet from './pages/OrangeSheet';
import BlueSheetSub1 from './pages/BlueSheet_Sub1';
import OrangeSheetCountNewBin from './pages/OrangeSheetCountNewBin';
import OrangeSheetCountSecondBin from './pages/OrangeSheetCountSecondBin';

function App() {

  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/BlueSheet" element={<BlueSheet/>}></Route>
          <Route path="/OrangeSheet" element={<OrangeSheet/>}></Route>
          <Route path="/BlueSheet_Sub1" element={<BlueSheetSub1/>}></Route>
          <Route path="/OrangeSheetCountNewBin" element={<OrangeSheetCountNewBin/>}></Route>
          <Route path="/OrangeSheetCountSecondBin" element={<OrangeSheetCountSecondBin/>}></Route>
        </Routes>
      </Router>
  );
}

export default App;
