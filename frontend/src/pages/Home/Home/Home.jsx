import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Banner from '../Banner/Banner';
import Services from '../services/Services';
import HowItWorks from '../HowItWork/HowItWorks';
import ClientLogo from '../ClientLogo/ClientLogo';
import Features from '../Features/Features';
import MerchantBanner from '../Merchantbanner/Merchantbanner';
import CustomerReviews from '../CustomerReviews/CustomerReviews';
import FAQ from '../Faq/Faq';

const Home = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const redirectedRef = useRef(false);

    useEffect(() => {
        if (redirectedRef.current) return;

        const params = new URLSearchParams(location.search);
        const payment = params.get('payment');

        if (payment === 'success') {
            redirectedRef.current = true;
            navigate('/dashboard/payment-success', { replace: true });
        } else if (payment === 'failed') {
            redirectedRef.current = true;
            navigate('/dashboard/payment-failed', { replace: true });
        }
    }, [location.search, navigate]);
    return (
        <div>
            <div data-aos="fade-down">
                <Banner></Banner>
            </div>
            <div data-aos="fade-up">
                <HowItWorks></HowItWorks>
            </div>
            <div data-aos="fade-up">
                <Services></Services>
            </div>
            <div data-aos="fade-up">
                <ClientLogo></ClientLogo>
            </div>
            <div data-aos="fade-up">
                <Features></Features>
            </div>
            <div data-aos="fade-up">
                <MerchantBanner></MerchantBanner>
            </div>
            <div data-aos="fade-up">
                <CustomerReviews></CustomerReviews>
            </div>
            <div data-aos="fade-up">
                <FAQ></FAQ>
            </div>
        </div>
    );
};

export default Home;