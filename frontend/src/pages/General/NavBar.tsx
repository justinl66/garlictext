import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="top-0 left-0 z-50 bg-gradient-to-r from-[#9B5DE5] via-[#00BBF9] to-[#F15BB5] px-6 py-3 flex justify-between items-center shadow-lg">
      
      <div className="flex items-center">
        <Link to="/" className="text-white font-bold text-xl hover:text-[#FEE440] transition">
          garlictext
        </Link>
      </div>

      <div className="flex space-x-6 items-center text-white font-sans font-semibold text-sm">
        <Link to="/Login" className="hover:text-[#FEE440] transition">Login</Link>
        <Link to="/signup" className="hover:text-[#FEE440] transition">Signup</Link>
      </div>
    </nav>
  );
}