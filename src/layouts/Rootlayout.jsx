import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../pages/Home/shared/Navbar/Navbar';
import Footer from '../pages/Home/shared/Footer/Footer';

const Rootlayout = () => {
    return (
        <div>
            <Navbar></Navbar>
            
            <Outlet></Outlet>
            <Footer></Footer>
        </div>
    );
};

export default Rootlayout;