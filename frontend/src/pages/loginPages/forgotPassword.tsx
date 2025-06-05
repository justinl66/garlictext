import {useState, useContext, useEffect} from 'react'
import { AuthContext } from '../../firebase/firebaseAuth'
import { useNavigate } from 'react-router-dom'
import { startBubbleAnimation } from '../../utils/bubbleAnimation.ts'

export default function ForgotPasswordPage(){
    const navigate = useNavigate();

    const authContext = useContext(AuthContext);
    
    // Handle null context
    if (!authContext) {
        return <div>Loading...</div>;
    }
    
    const {resetPassword, loading} = authContext;


    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const cleanup = startBubbleAnimation();
        return cleanup;
    }, []);

    const handleClick = async ()=>{
        if(email === ""){
            setError("Please fill in all fields");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            setError("Please enter a valid email address");
            return;
        }

        const result = await resetPassword(email)
        if(result !== "success"){
            setError(result);
            return;
        }
        setError("");
        navigate('../resetPasswordSuccess');
    }

    return(
         <div className="w-screen h-screen flex flex-col bg-linear-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9] relative overflow-hidden">
            <div id="bubble-container" className="absolute inset-0 z-0"></div>
            
            <div className="w-full flex flex-row justify-center mt-8 items-center relative z-10">
                <h2 className="text-5xl font-sans font-semibold text-[#FEE440] text-shadow-md text-shadow-slate-500">Garlic Text</h2>
                <img src={"/garlicTextNoBackground.png"} alt="garlicTextIcon" width={60} height={60} className=" animate-[--custom-bounce_0.65s_ease-in-out_infinite] ml-2"/>
            </div>
            <div className="w-full max-w-md mx-auto flex flex-col items-center mt-10 p-8 bg-white rounded-xl shadow-2xl relative z-10">
                <h1 className="text-[#00B8F5] text-3xl font-sans font-bold self-start mb-6">Reset Password</h1>
                {loading?
                    <div className="flex justify-center items-center h-48">
                        <div className="w-16 h-16 border-8 border-t-[#FEE440] border-gray-200 rounded-full animate-spin"></div>
                    </div>
                :
                <>
                    <div className="w-full flex flex-col mt-7">
                        <label htmlFor="email" className="text-black text-lg font-sans font-semibold">Email</label>
                        <input value={email} onChange={(e)=>setEmail(e.target.value)} onKeyDown={(e)=>{if(e.key == "Enter"){handleClick()}}} type="email" id="email" className={`w-full h-10 border-2 ${error == ''? 'border-gray-300 focus:border-[#00F5D4]': 'border-red-500'} rounded-md mt-2 px-2 transition duration-200 focus:outline-hidden  text-black`}/>
                        <p className="text-red-500 text-sm font-sans font-semibold mt-1">{error}</p>
                    </div>
                    <div className="w-full flex flex-col mt-8">
                        <button onClick={handleClick} className="w-full h-10 bg-[#00CCB1] text-white font-sans font-semibold rounded-md hover:opacity-80 transition duration-200">Send reset link</button>
                    </div>
                    
                </>}
            </div>
        </div>
    )
}
