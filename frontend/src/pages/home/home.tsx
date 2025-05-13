import { useContext } from 'react';
import { AuthContext } from '../../firebase/firebaseAuth.tsx';
import NavBar from '../General/NavBar.tsx';

export default function HomePage() {
    const {user, logout} = useContext(AuthContext);


    return(
        <div className="w-full h-screen flex flex-col bg-linear-to-br from-[#9B5DE5] to-[#F15BB5] via-[#00BBF9] ">
            <NavBar />
            <div className="w-full flex flex-row justify-center mt-8 items-center">
                <h2 className="text-5xl font-sans font-semibold text-[#FEE440] text-shadow-md text-shadow-slate-500">Garlic Text</h2>
                <img src={"/garlicTextNoBackground.png"} alt="garlicTextIcon" width={60} height={60} className=" animate-[--custom-bounce_0.65s_ease-in-out_infinite] ml-2"/>
            </div>
            <div className="w-full max-w-96 shadow-xl shadow-slate-600 flex flex-col items-center mt-10 p-8 self-center bg-white rounded-xl">
                <h1 className="text-[#00B8F5] text-4xl font-sans font-bold self-start">{user? user.displayName:"not logged in"}</h1>
                <button onClick={logout} className="w-full h-10 bg-[#00B8F5] text-white font-sans font-semibold rounded-md mt-4 hover:bg-[#00F5D4] transition duration-200">Logout</button>
            </div>
        </div>
    )

}
