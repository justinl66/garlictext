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
            <nav className='self-center w-full mt-3 bg-white/30 backdrop-blur-md shadow-lg z-50 py-4 px-10 flex flex-row items-center rounded-3xl border border-purple-300'>
                <Link to="/" className='text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 font-bold font-sans text-4xl hover:opacity-90 transition cursor-pointer'>GarlicText</Link>
                <div className='flex flex-row ml-auto space-x-8 items-center text-purple-500 font-sans font-semibold text-lg'>
                    <Link to="/" className='hover:text-purple-700 transition'>Home</Link>
                    <Link to="/findGame" className='hover:text-purple-700 transition'>Find Game</Link>
                    <Link to="/help" className='hover:text-purple-700 transition'>Help</Link>
                    {
                        user ? (
                            <Link to="/profile" className='hover:text-purple-700 transition flex flex-row items-center'>
                                {user.displayName}
                                <div className='w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold ml-4'>
                                    {
                                        user.photoUrl ? (
                                            <img src={user.photoUrl} alt="user photo" width={40} height={40} className='rounded-full' />
                                        ) : (
                                            (user.displayName && user.displayName.charAt(0).toUpperCase()) || 'U'
                                        )
                                    }
                                </div>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className='hover:text-purple-700 transition'>Login</Link>
                                <Link to="/signup" className='hover:text-purple-700 transition'>Signup</Link>
                            </>
                        )
                    }
                </div>
            </nav>
        </div>
    );
}