import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../pages/Home/shared/Navbar/Navbar';
import Footer from '../pages/Home/shared/Footer/Footer';

const Rootlayout = () => {
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: false,
            offset: 100,
            delay: 0,
        });
    }, []);
    return (
        <div className='font-dm-sans w-full bg-white'>
            <Navbar></Navbar>
            
            <Outlet></Outlet>
            <Footer></Footer>
        </div>
    );
};

export default Rootlayout;