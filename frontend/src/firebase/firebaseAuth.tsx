// https://medium.com/@sajadshafi/implementing-firebase-auth-in-react-js-typescript-vite-js-88465ac84170

import { useState, useEffect, createContext } from "react";
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateProfile } from "firebase/auth";
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
        return await createUserWithEmailAndPassword(auth, email, password)
            .then(async () => {
                // Signed in 
                
                await updateProfile(auth.currentUser!, {
                    displayName: username,
                }).then(() => {
                    // setUser(auth.currentUser);
                    setLoading(false);
                    return "success";
                }).catch((error) => {
                    setLoading(false);
                    return error.message;
                });
            })
            .catch((error) => {
                setLoading(false);
                return error.message;
            });
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

    useEffect(()=>{
        // alert(user?.email);
         const unsubscribe = onAuthStateChanged(auth, updatedUser=>{
            setCurrentUser(updatedUser);
            setLoading(false);
        })
        return unsubscribe;
    }, [])

    const authValues = {
        user:currentUser,
        loading:loading,
        login,
        register,
        logout,
        resetPassword,
    }

    // if(loading){
    //     return (
    //         <div className="w-screen h-screen flex flex-col bg-linear-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9] ">
    //             <div className="w-full flex flex-row justify-center mt-8 items-center">
    //                 <h2 className="text-5xl font-sans font-semibold text-[#FEE440] text-shadow-md text-shadow-slate-500">Garlic Text</h2>
    //                 <img src={"/garlicTextNoBackground.png"} alt="garlicTextIcon" width={60} height={60} className=" animate-[--custom-bounce_0.65s_ease-in-out_infinite] ml-2"/>
    //             </div>
    //             <div className="w-full max-w-96 shadow-xl shadow-slate-600 flex flex-col items-center mt-10 p-8 self-center bg-white rounded-xl">
    //                 <h1 className="text-[#00B8F5] text-4xl font-sans font-bold self-start">Loading...</h1>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <div>
            <AuthContext.Provider value={authValues}>
                {children}
            </AuthContext.Provider>
        </div>
    )
}