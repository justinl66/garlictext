import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../firebase/firebaseAuth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, deleteAccount } = useContext(AuthContext);

  const bio = localStorage.getItem("bio") || "No bio yet.";
  const badge = localStorage.getItem("badge") || "";

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  useEffect(() => {
    const refreshUser = async () => {
      await auth.currentUser?.reload();
    };
    refreshUser();
  }, []);

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setDeleteMessage("");

    const result = await deleteAccount();

    if (result === "success") {
      setDeleteMessage("Account successfully deleted!");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      setDeleteMessage(`Error: ${result}`);
    }

    setDeleteLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 to-pink-500 text-white p-6">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        
        {/* Avatar or Fallback */}
        <div className="w-28 h-28 rounded-full bg-white bg-opacity-20 flex items-center justify-center mx-auto text-4xl font-bold overflow-hidden mb-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span>{user?.displayName?.[0] || "?"}</span>
          )}
        </div>

        {/* User Info */}
        <h1 className="text-3xl font-extrabold mb-1">{user?.displayName || "Anonymous"}</h1>
        <p className="text-sm text-gray-200 mb-1">{user?.email || "No email"}</p>
        <p className="text-xs text-gray-300 mb-4">UID: {user?.uid || "N/A"}</p>

        {/* Email Verified */}
        <div className="mb-4">
          {user?.emailVerified ? (
            <p className="text-green-300 font-medium">Email Verified ✅</p>
          ) : (
            <button
              onClick={() => navigate("/profile/verify")}
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-1 px-3 rounded transition"
            >
              Verify Email
            </button>
          )}
        </div>

        {/* Bio */}
        <p className="italic text-gray-200 mb-6">"{bio}"</p>

        {/* Stats */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
          <p>Games Played: <span className="font-bold">placeholder</span></p>
          <p>Rounds Completed: <span className="font-bold">placeholder</span></p>
          <p>Wins: <span className="font-bold">placeholder</span></p>
        </div>

        {/* Edit Profile */}
        <button
          onClick={() => navigate("/profile/edit")}
          className="bg-white text-purple-700 hover:bg-purple-100 font-bold py-2 px-4 rounded-xl transition mb-4"
        >
          Edit Profile
        </button>

        {/* Delete Account Section */}
        <div className="mt-6">
          {deleteMessage && (
            <p className="text-sm text-yellow-200 mb-2">{deleteMessage}</p>
          )}

          {deleteConfirm ? (
            <div>
              <p className="mb-2 text-sm text-red-200">Are you sure?</p>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mr-2"
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="bg-gray-300 text-black py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="text-red-300 text-sm underline"
            >
              Delete Account
            </button>
          )}
        </div>

        {/* Return to Home */}
        <div className="mt-12">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-md shadow-sm transition"
          >
            Return To Home Page
          </button>
        </div>
      </div>
    </div>
  );
}
}