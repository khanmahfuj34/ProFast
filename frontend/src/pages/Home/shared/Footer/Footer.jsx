import React from 'react';
import { Link } from 'react-router-dom';
import ProFastLogo from '../ProFastLogo/ProFastLogo';
import { FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="w-full bg-slate-50 dark:bg-[#0b1120] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
            {/* Top Footer Section */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
                    
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <ProFastLogo />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                            ProFast is Bangladesh's leading technology-first logistics and last-mile delivery partner, empowering merchants, customers, and riders with real-time analytics and seamless delivery.
                        </p>
                        {/* Social Icons */}
                        <div className="flex items-center gap-3">
                            <a 
                                href="https://facebook.com" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-center text-slate-500 hover:text-lime-600 dark:hover:text-lime-400 hover:border-lime-500 dark:hover:border-lime-500 hover:shadow-md transition-all duration-300 cursor-pointer"
                            >
                                <FiFacebook className="w-5 h-5" />
                            </a>
                            <a 
                                href="https://twitter.com" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-center text-slate-500 hover:text-lime-600 dark:hover:text-lime-400 hover:border-lime-500 dark:hover:border-lime-500 hover:shadow-md transition-all duration-300 cursor-pointer"
                            >
                                <FiTwitter className="w-5 h-5" />
                            </a>
                            <a 
                                href="https://linkedin.com" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-center text-slate-500 hover:text-lime-600 dark:hover:text-lime-400 hover:border-lime-500 dark:hover:border-lime-500 hover:shadow-md transition-all duration-300 cursor-pointer"
                            >
                                <FiLinkedin className="w-5 h-5" />
                            </a>
                            <a 
                                href="https://instagram.com" 
                                target="_blank" 
                                rel="noreferrer" 
                                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-center text-slate-500 hover:text-lime-600 dark:hover:text-lime-400 hover:border-lime-500 dark:hover:border-lime-500 hover:shadow-md transition-all duration-300 cursor-pointer"
                            >
                                <FiInstagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/about" className="text-sm font-medium hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/service" className="text-sm font-medium hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link to="/coverage" className="text-sm font-medium hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">
                                    Coverage
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-sm font-medium hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">
                                    Pricing
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support & Services Column */}
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Support & Service</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/dashboard/track-parcel" className="text-sm font-medium hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">
                                    Track Parcel
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-sm font-medium hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/support" className="text-sm font-medium hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">
                                    Support Center
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info Column */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Contact Info</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-lime-50 dark:bg-lime-950/20 flex items-center justify-center text-lime-600 dark:text-lime-400 flex-shrink-0">
                                    <FiMail className="w-4.5 h-4.5" />
                                </div>
                                <a href="mailto:support@profast.com" className="text-sm font-medium hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">
                                    support@profast.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-lime-50 dark:bg-lime-950/20 flex items-center justify-center text-lime-600 dark:text-lime-400 flex-shrink-0">
                                    <FiPhone className="w-4.5 h-4.5" />
                                </div>
                                <a href="tel:+8801234567890" className="text-sm font-medium hover:text-lime-600 dark:hover:text-lime-400 transition-colors duration-200">
                                    +880 1234-567890
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-lime-50 dark:bg-lime-950/20 flex items-center justify-center text-lime-600 dark:text-lime-400 flex-shrink-0 mt-0.5">
                                    <FiMapPin className="w-4.5 h-4.5" />
                                </div>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Level 4, Gulshan-2, Dhaka-1212, Bangladesh
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright & Policies Section */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-100/50 dark:bg-[#060a14]/60 py-6 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 text-center md:text-left">
                        © {new Date().getFullYear()} ProFast. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="text-xs font-semibold text-slate-500 dark:text-slate-500 hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="text-xs font-semibold text-slate-500 dark:text-slate-500 hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;