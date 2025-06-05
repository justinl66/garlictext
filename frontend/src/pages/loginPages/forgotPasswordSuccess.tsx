import { useNavigate } from "react-router-dom"

export default function ForgotPasswordSuccessPage(){
    const navigate = useNavigate()

    return(
        <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-purple-200 via-pink-200 to-sky-200">
            <div className="w-full flex flex-row justify-center mt-8 items-center">
                <h2 className="text-5xl font-sans font-semibold text-[#FEE440] text-shadow-md text-shadow-slate-500">Garlic Text</h2>
                <img src={"/garlicTextNoBackground.png"} alt="garlicTextIcon" width={60} height={60} className=" animate-[--custom-bounce_0.65s_ease-in-out_infinite] ml-2"/>
            </div>
            <div className="w-full max-w-96 shadow-xl shadow-slate-600 flex flex-col items-center mt-10 p-8 self-center bg-white rounded-xl transition duration-700 ease-in-out">
                <h1 className="text-[#00B8F5] text-4xl font-sans font-bold self-start">Reset link sent</h1>
                <div className="w-full flex flex-col mt-8">
                    <button onClick={()=>navigate('../login')} className="w-full h-10 bg-[#00CCB1] text-white font-sans font-semibold rounded-md hover:opacity-80 transition duration-200">Ready to Login</button>
                </div>
            </div>
        </div>
    )
}