import { useContext } from "react";
import { AuthContext } from "../../firebase/firebaseAuth";
import { useNavigate } from "react-router-dom";


export default function ProfilePage(){
    const navigate = useNavigate()

    const {user} = useContext(AuthContext)

    return(
        <div className="flex flex-col w-screen min-h-screen h-full px-10 py-12 items-center  bg-linear-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9]">
            <div className="flex flex-col w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-semibold text-black">My Profile</h1>
                <div className="mt-6 ml-4">
                    <h2 className="text-xl font-semibold text-gray-700">User Information</h2>
                    <div className="ml-3">
                        <p className="mt-2 text-gray-600">Display Name: {user?.displayName}</p>
                        <p className="mt-2 text-gray-600">Email: {user?.email}</p>
                        <p className="mt-2 text-gray-600">Email Verified: {user?.emailVerified ? "Yes" : "No"}</p>
                        <p className="mt-2 text-gray-600">Photo URL: {user?.photoURL}</p>
                        <p className="mt-2 text-gray-600">UID: {user?.uid}</p>
                        <p className="mt-2 text-gray-600">Last Sign-In Time: {user?.metadata.lastSignInTime}</p> 
                        <p className="mt-2 text-gray-600">Account created: {user?.metadata.creationTime}</p>
                    </div>
                </div>
                <div className="mt-6 ml-4 flex flex-col gap-y-2">
                    <h2 className="text-xl font-semibold text-gray-700">Actions</h2>
                    <button onClick={() => navigate("/resetPassword")} className="mt-4 bg-[#9B5DE5] text-white font-semibold py-2 px-4 rounded hover:bg-[#7A3EB0] transition duration-200">Change Password</button>
                    <button onClick={() => navigate("/deleteAccount")} className="mt-4 bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-200">Delete Account</button>  
                </div>
            </div>
        </div>
    )
}