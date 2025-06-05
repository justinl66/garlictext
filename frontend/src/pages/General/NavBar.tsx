import { Link } from 'react-router-dom';
import {useContext} from 'react';
import { AuthContext } from '../../firebase/firebaseAuth';

export default function NavBar() {
  const authContext = useContext(AuthContext);
  
  // Handle null context
  if (!authContext) {
    return <div>Loading...</div>;
  }
  
  const { user } = authContext;
  return (
    <div className='w-full bg-transparent px-5'>
      <nav className='self-center w-full mt-3 bg-white/20 backdrop-blur-md shadow-sm z-50 py-3.5 px-10 flex flex-row items-center rounded-2xl'>
          <Link to="/" className='text-amber-50 font-medium font-sans text-3xl hover:text-amber-100 transition cursor-pointer'>GarlicText</Link>
          <div className='flex flex-row ml-auto space-x-10 items-center text-amber-50 font-sans font-semibold text-lg mr-5'>
              <Link to="/" className='hover:text-amber-100 transition'>Home</Link>
              <Link to="/findGame" className='hover:text-amber-100 transition'>Find Game</Link>
              <Link to="/help" className='hover:text-amber-100 transition'>Help</Link>
              {user ? (
              <Link to="/profile" className='hover:text-amber-100 transition flex flex-row items-center gap-2'>
                <div className='w-10 h-10 rounded-full bg-gradient-to-r from-[#9B5DE5] to-[#00BBF9] flex items-center justify-center text-white font-bold'>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="user photo" className='w-full h-full rounded-full object-cover' />
                  ) : (
                    (user.displayName && user.displayName.charAt(0).toUpperCase()) || 'U'
                  )}
                </div>
                <span>{user.displayName || "User"}</span>
              </Link>
            ) : (
              <>
                <Link to="/Login" className='hover:text-amber-100 transition'>Login</Link>
                <Link to="/signup" className='hover:text-amber-100 transition'>Signup</Link>
              </>
            )}

              </div>
      </nav>
    </div>
  );
}