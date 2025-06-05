import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../firebase/firebaseAuth";
import { useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { startBubbleAnimation } from "../../utils/bubbleAnimation.ts";

export default function VerifyEmail() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cleanup = startBubbleAnimation();
    return cleanup;
  }, []);

  const handleSendVerification = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await sendEmailVerification(user);
      setMessage("Verification email sent. Please check your inbox.");
    } catch (err: any) {
      setError("Failed to send verification email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#9B5DE5] via-[#00BBF9] to-[#F15BBF5] px-4 relative">
      <div id="bubble-container" className="absolute inset-0 z-0"></div>
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 text-base relative z-10">
        <h1 className="text-3xl font-bold text-[#9B5DE5] mb-2">Verify Your Email</h1>

        <p className="text-gray-700">
          Click <span className="font-semibold">"Send Verification"</span> to receive a verification email at:{" "}
          <span className="font-medium">{user?.email}</span>
        </p>

        <p className="text-gray-600 text-sm">
          Didn’t receive the email? Please check your spam folder or press “Send Verification” again.
        </p>

        {message && <p className="text-green-600 font-medium">{message}</p>}
        {error && <p className="text-red-500 font-medium">{error}</p>}

        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={() => navigate("/profile")}
            className="px-5 py-2 bg-gray-300 text-black text-base font-semibold rounded hover:bg-gray-400"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSendVerification}
            className="px-5 py-2 bg-[#00BBF9] text-white text-base font-semibold rounded hover:bg-[#009BD9] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Verification"}
          </button>
        </div>
      </div>
    </div>
  );
}