import React from 'react';
import Banner from '../Banner/Banner';
import Services from '../services/services';
import HowItWorks from '../HowItWork/HowItWorks';
import ClientLogo from '../ClientLogo/ClientLogo';
import Features from '../Features/Features';
import MerchantBanner from '../Merchantbanner/Merchantbanner';
import CustomerReviews from '../CustomerReviews/CustomerReviews';
import FAQ from '../Faq/Faq';

const Home = () => {
    return (
        <div>
            <Banner></Banner>
            <HowItWorks></HowItWorks>
            <Services></Services>
            <ClientLogo></ClientLogo>
            <Features></Features>
            <MerchantBanner></MerchantBanner>
            <CustomerReviews></CustomerReviews>
            <FAQ></FAQ>
        </div>
    );
};

export default Home;