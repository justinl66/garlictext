import { Link } from 'react-router-dom';
import {useContext} from 'react';
import { AuthContext } from '../../firebase/firebaseAuth';

export default function NavBar() {
  const { user } = useContext(AuthContext);

  return (
    // <nav className="top-0 left-0 z-50 bg-gradient-to-r from-[#9B5DE5] via-[#00BBF9] to-[#F15BB5] px-6 py-3 flex justify-between items-center shadow-lg">
      
    //   <div className="flex items-center">
    //     <Link to="/" className="text-white font-bold text-xl hover:text-[#FEE440] transition">
    //       garlictext
    //     </Link>
    //   </div>

    //   <div className="flex space-x-6 items-center text-white font-sans font-semibold text-sm">
    //     <Link to="/Login" className="hover:text-[#FEE440] transition">Login</Link>
    //     <Link to="/signup" className="hover:text-[#FEE440] transition">Signup</Link>
    //   </div>
    // </nav>
    <div className='w-full bg-transparent px-5'>
      <nav className='self-center w-full mt-3 bg-white/20 backdrop-blur-md shadow-sm z-50 py-3.5 px-10 flex flex-row items-center rounded-2xl'>
          <p className='text-amber-50 font-medium font-sans text-3xl '>Garlic Text</p>
          <div className='flex flex-row ml-auto space-x-10 items-center text-amber-50 font-sans font-semibold text-lg mr-5'>
              <Link to="/" className='hover:text-amber-100 transition'>Home</Link>
              <Link to="/findGame" className='hover:text-amber-100 transition'>Find Game</Link>
              <Link to="/help" className='hover:text-amber-100 transition'>Help</Link>
              {
                user?
                <Link to="/profile" className='hover:text-amber-100 transition flex flex-row items-center'>
                  {user.displayName} 
                  <div className='w-10 h-10 rounded-full bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] flex items-center justify-center text-white font-bold ml-4'>
                    {
                      user.photoUrl?
                      <img src={user.photoUrl} alt="user photo" width={40} height={40} className='ml-6 rounded-full '/>
                      :
                      user.displayName.charAt(0).toUpperCase()
                    }
                  </div>
                </Link>

                :
                <>
                  <Link to="/Login" className='hover:text-amber-100 transition'>Login</Link>
                  <Link to="/signup" className='hover:text-amber-100 transition'>Signup</Link>
                </>
              }
              </div>
      </nav>
    </div>
  );
}