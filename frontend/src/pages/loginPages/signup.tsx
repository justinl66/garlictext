import {useState, useRef, useContext} from "react";
import { useNavigate } from 'react-router-dom';
import {AuthContext} from "../../firebase/firebaseAuth";
import NavBar from "../General/NavBar.tsx";

export default function SignUpPage() {
    const navigate = useNavigate();

    const authContext = useContext(AuthContext);
    
    // Handle null context
    if (!authContext) {
        return <div>Loading...</div>;
    }
    
    const {register, signInWithGoogle} = authContext;
      const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);    const handleSignup = async () =>{
        // Handle signup logic here
        setLoading(true);

        if(username === ""){
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        if(email === "" || password === ""){
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            setError("Please enter a valid email address");
            setLoading(false);
            return;
        }

        if(password !== confirmPassword){
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        if(password.length < 6){
            setError("Password must be at least 6 characters long");
            setLoading(false);
            return;
        }

        const result = await register(username, email, password);
        if(result !== "success"){
            setError(result);
            setLoading(false);
            return;
        }        setError("");
        setLoading(false);
        setSuccess(true);
        // Navigate after a short delay to show success state
        setTimeout(() => {
            navigate("../");
        }, 1500);
        
    }

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const result = await signInWithGoogle();
        if (result !== "success") {
            setError(result);
            setLoading(false);
            return;
        }
        setError("");
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
            navigate("/");
        }, 1500);
    };

    return (
        <div className="w-screen h-full min-h-screen pb-20 flex flex-col bg-gradient-to-br from-purple-200 via-pink-200 to-sky-200">
            < NavBar />
            <div className="w-full flex flex-row justify-center mt-8 items-center">
                <h2 className="text-5xl font-sans font-semibold text-[#FEE440] text-shadow-md text-shadow-slate-500">Garlic Text</h2>
                <img src={"/garlicTextNoBackground.png"} alt="garlicTextIcon" width={60} height={60} className=" animate-[--custom-bounce_0.65s_ease-in-out_infinite] ml-2"/>
            </div>
            <div className="w-full max-w-4xl shadow-xl shadow-slate-600 flex flex-col items-center mt-10 p-8 self-center bg-white rounded-xl mx-20">                <h1 className="text-[#00B8F5] text-4xl font-sans font-bold self-start">Sign Up</h1>
                {success ? 
                    <div className="w-full flex flex-col items-center mt-20 mb-20">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Account Created Successfully!</h2>
                        <p className="text-gray-600 text-center">Welcome to GarlicText! Redirecting you to the homepage...</p>
                    </div>
                :
                loading?
                    <div>
                        <svg className="mr-3 size-60 animate-spin" viewBox="0 0 24 24"></svg>
                    </div>
                    :
                    <>
                        <div className="w-full flex flex-row flex-wrap mt-7 justify-center gap-x-10 gap-y-4">
                        <div className="w-full max-w-80 flex flex-col">
                            <label htmlFor="name" className="text-black text-lg font-sans font-semibold">Username</label>
                            <input value={username} onChange={(e)=>setUsername(e.target.value)} onKeyDown={(e)=>{if(e.key === "Enter" && !e.ctrlKey){e.preventDefault(); emailRef.current?.focus()}}} type="text" id="name" className={`w-full h-10 border-2 ${error == ''? 'border-gray-300 focus:border-[#00F5D4]': 'border-red-500'} rounded-md mt-2 px-2 transition duration-200 focus:outline-hidden text-gray-900`}/>
                        </div>

                        <div className="w-full max-w-80 flex flex-col">
                            <label htmlFor="email" className="text-black text-lg font-sans font-semibold">Email</label>
                            <input ref={emailRef} value={email} onChange={(e)=>setEmail(e.target.value)} onKeyDown={(e)=>{if(e.key === "Enter" && !e.ctrlKey){e.preventDefault(); passwordRef.current?.focus()}}} type="email" id="email" className={`w-full h-10 border-2 ${error == ''? 'border-gray-300 focus:border-[#00F5D4]': 'border-red-500'} rounded-md mt-2 px-2 transition duration-200 focus:outline-hidden text-gray-900`}/>
                        </div>

                        <div className="w-full max-w-80 flex flex-col">
                            <label htmlFor="password" className="text-black text-lg font-sans font-semibold ">Password</label>
                            <input ref={passwordRef} value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e)=>{if(e.key === "Enter" && !e.ctrlKey){e.preventDefault(); confirmPasswordRef.current?.focus()}}} type="password" id="password" className={`w-full h-10 border-2 ${error == ''? 'border-gray-300 focus:border-[#00F5D4]': 'border-red-500'} rounded-md mt-2 px-2 transition duration-200 focus:outline-hidden text-gray-900`}/>
                        </div>

                        <div className="w-full max-w-80 flex flex-col">
                            <label htmlFor="confPassword" className="text-black text-lg font-sans font-semibold">Confirm Password</label>
                            <input ref={confirmPasswordRef} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} onKeyDown={(e)=>{if(e.key === "Enter" && !e.ctrlKey){e.preventDefault(); handleSignup()}}} type="password" id="confPassword" className={`w-full h-10 border-2 ${error == ''? 'border-gray-300 focus:border-[#00F5D4]': 'border-red-500'} rounded-md mt-2 px-2 transition duration-200 focus:outline-hidden text-gray-900`}/>
                        </div>
                    </div>
                    <p className="text-red-500 text-sm font-sans font-semibold mt-3">{error}</p>
                    <button onClick={handleSignup} className="w-full max-w-sm h-10 mt-8 bg-[#00CCB1] text-white font-sans font-semibold rounded-md hover:opacity-80 transition duration-200">Sign up</button>
                    <div className="w-full flex flex-col mt-10">
                        <div className="w-full flex flex-row justify-center mt-4">
                            <button 
                                onClick={handleGoogleSignIn} 
                                className="w-full max-w-xs h-12 bg-white border border-gray-300 rounded-md flex items-center justify-center shadow-xs hover:shadow-md transition duration-200"
                            >
                                <img src="/google.png" alt="Google Icon" className="w-6 h-6 mr-3" />
                                <span className="text-gray-700 text-md font-medium">Sign in with Google</span>
                            </button>
                        </div>
                    </div>
                </>}
            </div>
        </div>
    )
}