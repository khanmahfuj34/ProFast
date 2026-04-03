import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../../assets/logo.png';

const ProFastLogo = () => {
    return (
        <Link to="/">
        <div className='flex items-end'>
            <img className='mb-4 h-8 w-8 ' src={logo} alt="ProFast Logo" />
            <p className='text-3xl -ml-2 text-blue-600 font-syne font-bold'>ProFast</p>
        </div>
        </Link>
    );
};

export default ProFastLogo;