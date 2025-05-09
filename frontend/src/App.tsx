// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginPages/login';
import SignUpPage from './pages/loginPages/signup';
import HomePage from './pages/home/home';
import {AuthContextWrapper} from './firebase/firebaseAuth.tsx';

const App = () => {
  return (
    <AuthContextWrapper>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </Router>
    </AuthContextWrapper>
  );
};

export default App;
