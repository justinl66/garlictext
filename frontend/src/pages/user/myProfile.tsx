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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#9B5DE5] via-[#00BBF9] to-[#F15BBF5] flex items-center justify-center px-4 py-12">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-10 pb-10 relative overflow-hidden text-[15px]">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FEE440] rounded-full opacity-10"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#F15BB5] rounded-full opacity-10"></div>

        <h1 className="text-4xl font-bold text-[#9B5DE5] mb-6 relative z-10">My Profile</h1>

        <div className="flex items-center gap-6 mb-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-[#9B5DE5]"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] flex items-center justify-center text-white font-bold text-2xl shadow-md">
              {user?.displayName?.[0] || "?"}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xl font-semibold text-gray-800">
                {user?.displayName || "Unnamed User"}
              </p>
              {badge && (
                <span className="text-sm bg-[#9B5DE5] text-white px-2 py-1 rounded-md">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-gray-500">{user?.email}</p>
            <p className="italic text-gray-400 mt-1">"{bio}"</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Your Stats</h2>
          <div className="flex flex-col gap-2 mt-2 text-sm text-gray-700">
            <p>Games Played: <span className="font-bold">placeholder</span></p>
            <p>Rounds Completed: <span className="font-bold">placeholder</span></p>
            <p>Wins: <span className="font-bold">placeholder</span></p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Account Details</h2>
          <div className="mt-2 space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-3">
              <p className="flex items-center gap-1">
                <span className="font-semibold">Email Verified:</span>{" "}
                {user?.emailVerified || localStorage.getItem("emailVerified") === "true" ? (
                  <span className="text-green-600 font-semibold">✅</span>
                ) : (
                  <span className="text-red-500 font-semibold">No</span>
                )}
              </p>
              {!user?.emailVerified && (
                <button
                  onClick={() => navigate("/profile/verify")}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-semibold py-1 px-3 rounded-xl transition"
                >
                  Verify Email
                </button>
              )}
            </div>
            <p><span className="font-semibold">UID:</span> {user?.uid}</p>
            <p><span className="font-semibold">Last Sign-In:</span> {user?.metadata.lastSignInTime}</p>
            <p><span className="font-semibold">Account Created:</span> {user?.metadata.creationTime}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/profile/edit")}
              className="rounded-full bg-gradient-to-br from-[#06B6D4] to-[#7C3AED] flex items-center justify-center text-white text-sm font-semibold py-4 shadow-lg hover:shadow-xl transition duration-200"
            >
              Edit Profile
            </button>
            <button
              onClick={() => navigate("/resetpassword")}
              className="rounded-full bg-gradient-to-br from-[#60A5FA] to-[#1D4ED8] flex items-center justify-center text-white text-sm font-semibold py-4 shadow-lg hover:shadow-xl transition duration-200"
            >
              Reset Password
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-full bg-gradient-to-br from-[#F87171] to-[#B91C1C] flex items-center justify-center text-white text-sm font-semibold py-4 shadow-lg hover:shadow-xl transition duration-200"
            >
              Sign Out
            </button>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="rounded-full bg-gradient-to-br from-[#FB923C] to-[#EA580C] flex items-center justify-center text-white text-sm font-semibold py-4 shadow-lg hover:shadow-xl transition duration-200"
            >
              Delete Account
            </button>
          </div>

          {deleteConfirm && (
            <div className="bg-red-100 p-4 rounded-lg text-sm text-red-800 mt-6">
              <p className="font-semibold mb-2">Are you sure you want to delete your account?</p>
              <p className="mb-4 text-xs">This action is permanent and cannot be undone.</p>
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="bg-red-600 text-white font-semibold py-2 px-4 rounded hover:bg-red-700 transition duration-200 disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirm(false);
                    setDeleteMessage("");
                  }}
                  disabled={deleteLoading}
                  className="bg-gray-500 text-white font-semibold py-2 px-4 rounded hover:bg-gray-600 transition duration-200"
                >
                  Cancel
                </button>
              </div>
              {deleteMessage && (
                <div
                  className={`mt-3 p-2 rounded ${
                    deleteMessage.includes("Error")
                      ? "bg-red-200 text-red-800"
                      : "bg-green-200 text-green-800"
                  }`}
                >
                  {deleteMessage}
                </div>
              )}
            </div>
          )}
        </div>

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