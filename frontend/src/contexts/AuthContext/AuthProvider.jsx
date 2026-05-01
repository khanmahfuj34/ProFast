import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { auth } from '../../firebase/firebase.init';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    sendEmailVerification,
    updateProfile
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

    const createUser = async (email, password, name) => {
        setLoading(true);
        setAuthError(null);
        try {
            if (USE_MOCK_AUTH) {
                return await mockCreateUser(email, password);
            }
            const result = await createUserWithEmailAndPassword(auth, email, password);

            // Set the user's display name from registration form
            if (name) {
                await updateProfile(result.user, { displayName: name });
                // ⚡ updateProfile doesn't trigger onAuthStateChanged,
                // so manually push the updated user into state
                setUser({ ...auth.currentUser });
                console.log('✅ Display name set:', name);
            }

            // Send email verification after successful account creation
            await sendEmailVerification(result.user);
            console.log('✅ Verification email sent to:', email);

            return result;
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
            .then(async result => {
                // Reload user to get the latest emailVerified status from Firebase
                await result.user.reload();
                // Re-read from auth.currentUser to get refreshed data
                const freshUser = auth.currentUser;
                // Check if email is verified using fresh data
                if (!freshUser || !freshUser.emailVerified) {
                    setLoading(false);
                    const error = new Error('Please verify your email first');
                    error.code = 'auth/email-not-verified';
                    throw error;
                }
                return result;
            })
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
            localStorage.clear();
            sessionStorage.clear();
            setLoading(false);
            return Promise.resolve();
        }
        
        return signOut(auth)
            .then(() => {
                // Clear user state
                setUser(null);
                // Clear all storage data
                localStorage.clear();
                sessionStorage.clear();
                setLoading(false);
            })
            .catch(error => {
                setAuthError(error.message);
                setLoading(false);
                throw error;
            });
    };

    // Resend verification email
    const resendVerificationEmail = async () => {
        if (user && !user.emailVerified) {
            try {
                await sendEmailVerification(user);
                console.log('✅ Verification email resent to:', user.email);
                return true;
            } catch (error) {
                setAuthError(error.message);
                console.error('❌ Error resending verification email:', error.message);
                throw error;
            }
        }
    };

    // Update user profile image in Firebase
    const updateUserProfilePhoto = async (photoURL) => {
        try {
            if (!auth.currentUser) {
                throw new Error('No user logged in');
            }

            // Update Firebase profile
            await updateProfile(auth.currentUser, { photoURL });
            console.log('✅ Profile photo updated in Firebase:', photoURL);

            // Reload user to get updated data
            await auth.currentUser.reload();

            // Update local state with new user data
            setUser({ ...auth.currentUser });
            console.log('✅ User state synced with Firebase');

            return true;
        } catch (error) {
            const errorMessage = error.message || 'Failed to update profile photo';
            setAuthError(errorMessage);
            console.error('❌ Error updating profile photo:', errorMessage);
            throw error;
        }
    };

    // Update user display name in Firebase
    const updateUserDisplayName = async (displayName) => {
        try {
            if (!auth.currentUser) {
                throw new Error('No user logged in');
            }

            // Update Firebase profile
            await updateProfile(auth.currentUser, { displayName });
            console.log('✅ Display name updated in Firebase:', displayName);

            // Reload user to get updated data
            await auth.currentUser.reload();

            // Update local state with new user data
            setUser({ ...auth.currentUser });
            console.log('✅ User state synced with Firebase');

            return true;
        } catch (error) {
            const errorMessage = error.message || 'Failed to update display name';
            setAuthError(errorMessage);
            console.error('❌ Error updating display name:', errorMessage);
            throw error;
        }
    };

    useEffect(() => {
        if (!USE_MOCK_AUTH) {
            const unsubscribe = onAuthStateChanged(auth, async currentUser => {
                if (currentUser) {
                    // Reload to get the latest profile (displayName, emailVerified, etc.)
                    await currentUser.reload();
                    setUser({ ...auth.currentUser });
                } else {
                    setUser(null);
                }
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
        authError,
        resendVerificationEmail,
        updateUserProfilePhoto,
        updateUserDisplayName
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;