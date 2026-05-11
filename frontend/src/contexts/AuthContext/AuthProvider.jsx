import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import axios from 'axios';

const USE_MOCK_AUTH = false; // Set to true for testing without valid Firebase credentials

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null); // ✅ Backend user profile with role
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // ✅ tokenReady: true only after /jwt POST succeeds and cookie is stored in browser.
    // All protected API calls (e.g. /riders/:email, /user) must wait for this flag.
    const [tokenReady, setTokenReady] = useState(false);

    // ✅ Track the user UID for which we've already sent token
    // This prevents sending token multiple times for the same user
    const tokenSentForUidRef = useRef(null);

    // 🔐 Send Firebase ID token to backend for JWT storage in httpOnly cookie
    const fetchUserProfile = useCallback(async () => {
        try {
            setUserProfile(null);
            const response = await axios.get(
                'http://localhost:3000/user',
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success && response.data.user) {
                console.log('✅ [User Profile] Fetched profile:', response.data.user);
                setUserProfile(response.data.user);
            }
        } catch (error) {
            console.warn('⚠️ [User Profile] Warning fetching profile:', error.response?.data?.message || error.message);
            setUserProfile(null);
            // Non-critical error - don't block auth
        }
    }, []);

    const sendTokenToBackend = useCallback(async (user) => {
        try {
            if (!user) {
                console.warn('⚠️ No user provided to sendTokenToBackend');
                return false;
            }

            console.log('🔐 [Token Flow] Getting Firebase ID token for:', user.email);
            const token = await user.getIdToken(true); // Force refresh to get latest token
            console.log('🔐 [Token Flow] Token obtained, length:', token.length);

            console.log('🔐 [Token Flow] POSTing token to /jwt endpoint...');
            const response = await axios.post(
                'http://localhost:3000/jwt',
                { token },
                {
                    withCredentials: true, // ✅ CRITICAL: Send cookies
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ [Token Flow] JWT endpoint response:', response.data);
            console.log('✅ [Token Flow] httpOnly cookie should now be set in browser');

            // ✅ Mark token as ready BEFORE fetching profile so protected API calls can proceed
            setTokenReady(true);

            // ✅ Save social user data to database
            await saveSocialUserData(user);

            // ✅ Fetch user profile from backend to get role
            await fetchUserProfile();

            return true;
        } catch (error) {
            console.error('❌ [Token Flow] Error sending token to backend:');
            console.error('   Status:', error.response?.status);
            console.error('   Message:', error.response?.data?.message || error.message);
            console.error('   Error:', error.response?.data?.error);
            // Token failed — keep tokenReady false so interceptor won't log out prematurely
            setTokenReady(false);
            return false;
        }
    }, [fetchUserProfile]);

    // ✅ Save social user data to database (Google, Facebook, etc.)
    const saveSocialUserData = async (user) => {
        try {
            if (!user) return;

            const socialUserData = {
                email: user.email,
                displayName: user.displayName || 'User',
                photoURL: user.photoURL || null,
                uid: user.uid,
                provider: user.providerData?.[0]?.providerId || 'firebase',
                lastLogin: new Date().toISOString()
            };

            console.log('💾 [Social User] Saving social user data:', socialUserData.email);

            // Get token for authorization
            const token = await user.getIdToken();
            const response = await axios.post(
                'http://localhost:3000/save-social-user',
                socialUserData,
                {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('✅ [Social User] Data saved to database:', response.data);
            return true;
        } catch (error) {
            console.warn('⚠️ [Social User] Warning saving social data (non-critical):', error.response?.data?.message || error.message);
            // Don't block login even if social data save fails
            return false;
        }
    };

    // Mock auth functions for development
    const mockCreateUser = async (email) => {
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
                return await mockCreateUser(email);
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

            // ✅ Token will be sent by separate useEffect when user state updates
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
        // Reset tokenReady on each new sign-in attempt
        setTokenReady(false);

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

                // ✅ Token will be sent by separate useEffect when user state updates
                // This prevents infinite loops from double-sending
                console.log('🔐 [SignIn] Token will be sent when user state updates');
                return result;
            })
            .catch(error => {
                setAuthError(error.message);
                setLoading(false);
                throw error;
            });
    };

    const logOut = async () => {
        setLoading(true);
        setAuthError(null);

        // ✅ Reset token flags when logging out
        tokenSentForUidRef.current = null;
        setTokenReady(false);

        if (USE_MOCK_AUTH) {
            setUser(null);
            setUserProfile(null); // ✅ Clear profile
            localStorage.clear();
            sessionStorage.clear();
            setLoading(false);
            return Promise.resolve();
        }

        try {
            // 🔐 Call backend logout endpoint to clear cookie
            await axios.post(
                'http://localhost:3000/logout',
                {},
                { withCredentials: true }
            );
            console.log('🔐 Logged out - cookie cleared');

            // Sign out from Firebase
            await signOut(auth);

            // Clear user state
            setUser(null);
            setUserProfile(null); // ✅ Clear profile
            // Clear all storage data
            localStorage.clear();
            sessionStorage.clear();
            setLoading(false);
        } catch (error) {
            setAuthError(error.message);
            setLoading(false);
            throw error;
        }
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

    // ✅ Firebase auth listener - ONLY updates user state (no async work in callback)
    // loading stays true when user exists; the token effect below will set it false
    // after the JWT is sent and the backend profile is fetched.
    useEffect(() => {
        if (!USE_MOCK_AUTH) {
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                if (currentUser) {
                    console.log('🔐 [onAuthStateChanged] User detected:', currentUser.email);
                    setUserProfile(null);
                    // Reset tokenReady when auth state changes to a new user
                    setTokenReady(false);
                    currentUser.reload().then(() => {
                        setUser({ ...auth.currentUser });
                        // loading remains true until token effect fetches profile
                    }).catch(err => {
                        console.error('🔐 [onAuthStateChanged] Reload error:', err);
                        setUser({ ...currentUser });
                    });
                } else {
                    console.log('🔐 [onAuthStateChanged] No user logged in');
                    setUser(null);
                    setUserProfile(null);
                    setTokenReady(false);
                    tokenSentForUidRef.current = null;
                    setLoading(false);
                }
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, []);

    // ✅ SEPARATE effect - Send token AFTER user state changes
    // This prevents infinite loops and race conditions
    // NOTE: We use auth.currentUser (actual Firebase object) not the state user (spread object)
    // ✅ KEY FIX: Only send token if this is a NEW user UID (prevents duplicate calls)
    // loading is cleared here so the app waits until the JWT + profile are ready.
    useEffect(() => {
        if (user && !USE_MOCK_AUTH && auth.currentUser) {
            const currentUid = auth.currentUser.uid;

            if (tokenSentForUidRef.current !== currentUid) {
                tokenSentForUidRef.current = currentUid;
                console.log('🔐 [useEffect] New login detected (uid:', currentUid, '), sending token to backend...');

                sendTokenToBackend(auth.currentUser).then(tokenSent => {
                    if (tokenSent) {
                        console.log('✅ [useEffect] Token sent successfully for uid:', currentUid);
                    } else {
                        console.warn('⚠️ [useEffect] Token sending failed, but continuing');
                    }
                    setLoading(false);
                }).catch(() => {
                    setTokenReady(false);
                    setLoading(false);
                });
            } else {
                console.log('🔐 [useEffect] Token already sent for this user (uid:', currentUid, '), skipping duplicate send');
                // Do not prematurely set loading to false here, as the initial token request might still be in flight!
            }
        }
    }, [user, sendTokenToBackend]);

    const authInfo = {
        createUser,
        signIn,
        user,
        userProfile, // ✅ Backend user profile with role
        isAdmin: userProfile?.role === 'admin', // ✅ Computed isAdmin property
        loading,
        tokenReady, // ✅ NEW: true only after /jwt POST succeeds — gate all protected API calls on this
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