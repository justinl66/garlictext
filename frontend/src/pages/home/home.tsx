import {auth} from '../../firebase/firebaseConfig'

export default function HomePage() {
    return(
        <div className="w-screen h-screen flex flex-col bg-linear-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9] ">
            <div className="w-full flex flex-row justify-center mt-8 items-center">
                <h2 className="text-5xl font-sans font-semibold text-[#FEE440] text-shadow-md text-shadow-slate-500">Garlic Text</h2>
                <img src={"/garlicTextNoBackground.png"} alt="garlicTextIcon" width={60} height={60} className=" animate-[--custom-bounce_0.65s_ease-in-out_infinite] ml-2"/>
            </div>
            <div className="w-full max-w-96 shadow-xl shadow-slate-600 flex flex-col items-center mt-10 p-8 self-center bg-white rounded-xl">
                <h1 className="text-[#00B8F5] text-4xl font-sans font-bold self-start">{auth.currentUser?.email? "yes":"no"}</h1>
            </div>
        </div>
    )

}
