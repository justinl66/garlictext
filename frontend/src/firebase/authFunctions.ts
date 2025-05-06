import {auth} from './firebaseConfig';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from "firebase/auth";

async function login(email: string, password: string) {
    return await signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            // Signed in 
            return "success";
        })
        .catch((error) => {
            return error.message;
        });
}

async function register(username:string, email: string, password: string) {
    return await createUserWithEmailAndPassword(auth, email, password)
        .then(async () => {
            // Signed in 
            await updateProfile(auth.currentUser!, {
                displayName: username,
            }).then(() => {
                return "success";
            }).catch((error) => {
                return error.message;
            });
        })
        .catch((error) => {
            return error.message;
        });
}

async function logout() {
    return await signOut(auth)
        .then(() => {
            // Sign-out successful.
            return "success";
        })
        .catch((error) => {
            return error.message;
        });
}

async function resetPassword(email: string) {
    return await sendPasswordResetEmail(auth, email)
        .then(() => {
            // Password reset email sent!
            return "success";
        })
        .catch((error) => {
            return error.message;
        });
}

export { login, register, logout, resetPassword };