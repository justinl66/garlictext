import { useContext, useState } from "react";
import { AuthContext } from "../../firebase/firebaseAuth";
import { useNavigate } from "react-router-dom";


export default function ProfilePage(){
    const navigate = useNavigate()
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [deleteMessage, setDeleteMessage] = useState("")

    const authContext = useContext(AuthContext)
    
    // Handle null context
    if (!authContext) {
        return <div>Loading...</div>;
    }
      const {user, logout, deleteAccount} = authContext

    const handleLogout = async () => {
        const result = await logout();
        if (result === "success") {
            navigate("/");
        }
    }

    const handleDeleteAccount = async () => {
        setDeleteLoading(true)
        setDeleteMessage("")
        
        const result = await deleteAccount()
        
        if (result === "success") {
            setDeleteMessage("Account successfully deleted!")
            // Account deleted, user will be automatically signed out
            // Navigate to home page after a brief delay
            setTimeout(() => {
                navigate("/")
            }, 2000)
        } else {
            setDeleteMessage(`Error: ${result}`)
        }
        
        setDeleteLoading(false)
    }

    return(
        <div className="flex flex-col w-screen min-h-screen h-full px-10 py-12 items-center bg-gradient-to-br from-purple-200 via-pink-200 to-sky-200">
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
                </div>                <div className="mt-6 ml-4 flex flex-col gap-y-2">
                    <h2 className="text-xl font-semibold text-gray-700">Actions</h2>
                    <button onClick={handleLogout} className="mt-4 bg-[#00BBF9] text-white font-semibold py-2 px-4 rounded hover:bg-[#009BD9] transition duration-200">Logout</button>
                    <button onClick={() => navigate("/resetPassword")} className="mt-4 bg-[#9B5DE5] text-white font-semibold py-2 px-4 rounded hover:bg-[#7A3EB0] transition duration-200">Change Password</button>
                    
                    {!showDeleteConfirm ? (
                        <button 
                            onClick={() => setShowDeleteConfirm(true)} 
                            className="mt-4 bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition duration-200"
                        >
                            Delete Account
                        </button>
                    ) : (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                            <p className="text-red-800 font-semibold mb-3">Are you sure you want to delete your account?</p>
                            <p className="text-red-600 text-sm mb-4">This action cannot be undone. All your data will be permanently deleted.</p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleDeleteAccount} 
                                    disabled={deleteLoading}
                                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleteLoading ? "Deleting..." : "Yes, Delete Account"}
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowDeleteConfirm(false)
                                        setDeleteMessage("")
                                    }} 
                                    disabled={deleteLoading}
                                    className="bg-gray-500 text-white font-semibold py-2 px-4 rounded hover:bg-gray-600 transition duration-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                            {deleteMessage && (
                                <div className={`mt-3 p-2 rounded ${deleteMessage.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                                    {deleteMessage}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}