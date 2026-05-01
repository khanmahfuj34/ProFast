import React from 'react';
import Banner from '../Banner/Banner';
import Services from '../services/Services';
import HowItWorks from '../HowItWork/HowItWorks';
import ClientLogo from '../ClientLogo/ClientLogo';
import Features from '../Features/Features';
import MerchantBanner from '../Merchantbanner/Merchantbanner';
import CustomerReviews from '../CustomerReviews/CustomerReviews';
import FAQ from '../Faq/Faq';

const Home = () => {
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