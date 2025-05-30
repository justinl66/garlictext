import {useState, useContext} from 'react'
import { AuthContext } from '../../firebase/firebaseAuth'
import { useNavigate } from 'react-router-dom'

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
         <div className="w-screen h-screen flex flex-col bg-linear-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9] ">
            <div className="w-full flex flex-row justify-center mt-8 items-center">
                <h2 className="text-5xl font-sans font-semibold text-[#FEE440] text-shadow-md text-shadow-slate-500">Garlic Text</h2>
                <img src={"/garlicTextNoBackground.png"} alt="garlicTextIcon" width={60} height={60} className=" animate-[--custom-bounce_0.65s_ease-in-out_infinite] ml-2"/>
            </div>
            <div className="w-full max-w-96 shadow-xl shadow-slate-600 flex flex-col items-center mt-10 p-8 self-center bg-white rounded-xl transition duration-700 ease-in-out">
                <h1 className="text-[#00B8F5] text-4xl font-sans font-bold self-start">Reset Password</h1>
                {loading? 
                    <div className="w-24 h-24 mt-36 mb-36 border-8 border-t-[#FEE440] border-white rounded-full animate-spin"></div>
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