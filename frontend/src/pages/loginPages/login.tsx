import {useState, useRef, useContext, useEffect} from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../firebase/firebaseAuth.tsx";
import NavBar from "../General/NavBar.tsx";
import { startBubbleAnimation } from '../../utils/bubbleAnimation.ts';

export default function LoginPage() {
    const navigate = useNavigate();

    const authContext = useContext(AuthContext);
    
    // Handle null context
    if (!authContext) {
        return <div>Loading...</div>;
    }
    
    const {login, signInWithGoogle} = authContext;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const cleanup = startBubbleAnimation();
        return cleanup;
    }, []);

    const handleLogin = async () =>{
        // Handle login logic here
        // alert(import.meta.env.VITE_API_KEY);
        setLoading(true);

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
        }        const result = await login(email, password);
        if(result !== "success"){
            setError(result);
            setLoading(false);
            return;
        }
        setError("");
        setLoading(false);
        navigate("../");
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
        navigate("/");
    };

    return (
        <div className="w-screen min-h-screen pb-10 flex flex-col bg-linear-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9] relative">
            <div id="bubble-container" className="absolute inset-0 z-0"></div>
            <NavBar />
            <div className="w-full flex flex-row justify-center mt-8 items-center relative z-10">
                <h2 className="text-5xl font-sans font-semibold text-[#FEE440] text-shadow-md text-shadow-slate-500">Garlic Text</h2>
                <img src={"/garlicTextNoBackground.png"} alt="garlicTextIcon" width={60} height={60} className=" animate-[--custom-bounce_0.65s_ease-in-out_infinite] ml-2"/>
            </div>
            <div className="w-full max-w-96 shadow-xl shadow-slate-600 flex flex-col items-center mt-10 p-8 self-center bg-white rounded-xl transition duration-700 ease-in-out relative z-10">
                <h1 className="text-[#00B8F5] text-4xl font-sans font-bold self-start">Sign in</h1>
                {loading ? 
                    <div className="w-24 h-24 mt-36 mb-36 border-8 border-t-[#FEE440] border-white rounded-full animate-spin"></div>
                :
                <>
                    <div className="w-full flex flex-col mt-7">
                        <label htmlFor="email" className="text-black text-lg font-sans font-semibold">Email</label>
                        <input value={email} onChange={(e)=>setEmail(e.target.value)} onKeyDown={(e)=>{if(e.key === "Enter" && !e.ctrlKey){e.preventDefault(); passwordRef.current?.focus()}}} type="email" id="email" className={`w-full h-10 border-2 ${error == ''? 'border-gray-300 focus:border-[#00F5D4]': 'border-red-500'} rounded-md mt-2 px-2 transition duration-200 focus:outline-hidden text-gray-900`}/>
                        <label htmlFor="password" className="text-black text-lg font-sans font-semibold mt-4">Password</label>
                        <input ref={passwordRef} value={password} onChange={(e)=>setPassword(e.target.value)} onKeyDown={(e)=>{if(e.key === "Enter" && !e.ctrlKey){e.preventDefault(); handleLogin()}}} type="password" id="password" className={`w-full h-10 border-2 ${error == ''? 'border-gray-300 focus:border-[#00F5D4]': 'border-red-500'} rounded-md mt-2 px-2 transition duration-200 focus:outline-hidden text-gray-900`}/>
                        <p className="text-red-500 text-sm font-sans font-semibold mt-1">{error}</p>
                        <button onClick={()=>navigate('../resetPassword')} className="text-black text-sm font-sans font-semibold mt-2">Forgot your password? <span className="text-[#00CCB1] cursor-pointer">Reset it</span></button>
                    </div>
                    <div className="w-full flex flex-col mt-8">
                        <button onClick={handleLogin} className="w-full h-10 bg-[#00CCB1] text-white font-sans font-semibold rounded-md hover:opacity-80 transition duration-200">Sign in</button>
                        <button onClick={()=>navigate('../signup')}><p className="text-black text-sm font-sans font-semibold mt-4">Don't have an account? <span className="text-[#00CCB1] cursor-pointer">Sign up</span></p></button>
                    </div>
                    <div className="w-full flex flex-col mt-8">
                        <div className="relative flex items-center justify-center">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="flex-shrink mx-4 text-gray-600">Or</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>
                        <div className="w-full flex flex-row justify-center mt-4">
                            <button 
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="w-full h-12 bg-white border border-gray-300 rounded-md flex items-center justify-center shadow-sm hover:shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <img 
                                    src="/google.png" 
                                    alt="Google Icon" 
                                    className="w-5 h-5 mr-3"
                                />
                                <span className="text-gray-700 text-sm font-medium">
                                    Sign in with Google
                                </span>
                            </button>
                        </div>
                    </div>
                </>}
            </div>
        </div>
    )
}