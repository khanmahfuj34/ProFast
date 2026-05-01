import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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

            {/* Toast Notification Container */}
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
    );
};

export default Rootlayout;