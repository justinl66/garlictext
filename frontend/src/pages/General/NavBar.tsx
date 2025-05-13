import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../firebase/firebaseAuth';

export default function NavBar() {
  const { user } = useContext<any>(AuthContext);
  const profilePicUrl = user ? user.photoURL : "";

  return (
    <nav className="top-0 left-0 z-50 bg-gradient-to-r from-[#9B5DE5] via-[#00BBF9] to-[#F15BB5] px-6 py-3 flex justify-between items-center shadow-lg">
      
      <div className="flex items-center">
        {profilePicUrl ? (
          <img
            src={profilePicUrl}
            alt="Profile"
            className="h-10 w-10 rounded-full border-2 border-white shadow-md"
          />
        ) : (
          <div className="h-10 w-10 rounded-full border-2 border-white shadow-md bg-white/20" />
        )}
      </div>

      <div className="flex space-x-6 items-center text-white font-sans font-semibold text-sm">
        <Link to="/help" className="hover:text-[#FEE440] transition">Help</Link>
        <Link to="/settings" className="hover:text-[#FEE440] transition">Settings</Link>
        <Link to="/Logout" className="hover:text-[#FEE440] transition">Log Out</Link>
      </div>
    </nav>
  );
}