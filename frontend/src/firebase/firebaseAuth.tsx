// https://medium.com/@sajadshafi/implementing-firebase-auth-in-react-js-typescript-vite-js-88465ac84170

import { useState, useEffect, createContext } from "react";
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile, deleteUser } from "firebase/auth";
import { auth } from "./firebaseConfig";

export const AuthContext = createContext<any>(null);

export function AuthContextWrapper({children}:{children: React.ReactNode}) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    
    async function login(email: string, password: string) {
        setLoading(true);
        return await signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                // Signed in 
                // setUser(auth.currentUser);
                setLoading(false);
                return "success";
            })
            .catch((error) => {
                setLoading(false);
                return error.message;
            });
    }

    async function register(username:string, email: string, password: string) {
        setLoading(true);
        await createUserWithEmailAndPassword(auth, email, password)
            .catch((error) => {
                setLoading(false);
                return error.message;
            });
        await updateProfile(auth.currentUser!, {
                    displayName: username,
            }).catch(async (error) => {
                await deleteAccount();
                setLoading(false);
                return error.message;
            });

        fetch('http://localhost:5001/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + (await auth.currentUser?.getIdToken(true)),
            },
        }).catch(async error => {
            await deleteAccount();
            setLoading(false);
            return error.message;
        })

        setLoading(false);
        return "success";
    }

    async function logout() {
        setLoading(true);
        return await signOut(auth)
            .then(() => {
                // Sign-out successful.
                // setUser(null);
                setLoading(false);
                return "success";
            })
            .catch((error) => {
                setLoading(false);
                return error.message;
            });
    }

    async function resetPassword(email: string) {
        setLoading(true);
        return await sendPasswordResetEmail(auth, email)
            .then(() => {
                // Password reset email sent!
                setLoading(false);
                return "success";
            })
            .catch((error) => {
                setLoading(false);
                return error.message;
            });
    }

    async function deleteAccount() {
        setLoading(true);
        if (currentUser) {
            return await deleteUser(currentUser)
                .then(() => {
                    // User deleted.
                    setCurrentUser(null);
                    setLoading(false);
                    return "success";
                })
                .catch((error) => {
                    setLoading(false); 
                    return error.message;
                });
        } else {
            setLoading(false);
            return "No user is currently logged in.";
        }
    }    useEffect(()=>{
        // alert(user?.email);
         const unsubscribe = onAuthStateChanged(auth, updatedUser=>{
            setCurrentUser(updatedUser);
            setLoading(false);
        })
        return unsubscribe;
    }, []);

    const authValues = {
        user:currentUser,
        loading:loading,
        login,
        register,
        logout,
        resetPassword,
        deleteAccount,
    }

    return (
        <div>
            <AuthContext.Provider value={authValues}>
                {children}
            </AuthContext.Provider>
        </div>
    )
}