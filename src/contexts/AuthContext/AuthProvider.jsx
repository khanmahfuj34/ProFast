import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { auth } from '../../firebase/firebase.init';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'firebase/auth';

const USE_MOCK_AUTH = false; // Set to true for testing without valid Firebase credentials

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Mock auth functions for development
    const mockCreateUser = async (email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                setUser({ email, uid: 'mock-' + Date.now() });
                setLoading(false);
                resolve({ user: { email, uid: 'mock-' + Date.now() } });
            }, 500);
        });
    };

    const createUser = async (email, password) => {
        setLoading(true);
        setAuthError(null);
        try {
            if (USE_MOCK_AUTH) {
                return await mockCreateUser(email, password);
            }
            return await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setAuthError(error.message);
            setLoading(false);
            throw error;
        }
    };

    const signIn = (email, password) => {
        setLoading(true);
        setAuthError(null);
        
        if (USE_MOCK_AUTH) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    setUser({ email, uid: 'mock-' + Date.now() });
                    setLoading(false);
                    resolve({ user: { email, uid: 'mock-' + Date.now() } });
                }, 500);
            });
        }
        
        return signInWithEmailAndPassword(auth, email, password)
            .catch(error => {
                setAuthError(error.message);
                setLoading(false);
                throw error;
            });
    };

    const logOut = () => {
        setLoading(true);
        setAuthError(null);
        
        if (USE_MOCK_AUTH) {
            setUser(null);
            setLoading(false);
            return Promise.resolve();
        }
        
        return signOut(auth)
            .catch(error => {
                setAuthError(error.message);
                setLoading(false);
                throw error;
            });
    };

    useEffect(() => {
        if (!USE_MOCK_AUTH) {
            const unsubscribe = onAuthStateChanged(auth, currentUser => {
                setUser(currentUser);
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, []);

    const authInfo = {
        createUser,
        signIn,
        user,
        loading,
        logOut,
        authError
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;