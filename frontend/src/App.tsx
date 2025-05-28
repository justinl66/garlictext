// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginPages/login';
import SignUpPage from './pages/loginPages/signup';
import ForgotPasswordPage from './pages/loginPages/forgotPassword.tsx';
import ForgotPasswordSuccessPage from './pages/loginPages/forgotPasswordSuccess.tsx';
import ProfilePage from './pages/user/myProfile.tsx';
import HomePage from './pages/home/home';
import Help from './pages/General/Help.tsx';
import GameLobby from './pages/game/GameLobby.tsx';
import GamePlay from './pages/game/GamePlay.tsx';
import PromptPage from './pages/game/PromptPage.tsx';
import CaptionPage from './pages/game/CaptionPage.tsx';
import VotingPage from './pages/game/VotingPage.tsx';
import {AuthContextWrapper} from './firebase/firebaseAuth.tsx';

const App = () => {
  return (
    <AuthContextWrapper>
      <Router>        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/resetPassword" element={<ForgotPasswordPage />} />
          <Route path="/resetPasswordSuccess" element={<ForgotPasswordSuccessPage />}/>
          <Route path="/help" element={<Help />} />          <Route path="/profile" element={<ProfilePage />} />
          {/* Game routes */}
          <Route path="/game/lobby" element={<GameLobby />} />          <Route path="/game/lobby/:roomId" element={<GameLobby />} />
          <Route path="/game/play" element={<GamePlay />} />
          <Route path="/game/prompts" element={<PromptPage />} />
          <Route path="/game/caption" element={<CaptionPage />} />
          <Route path="/game/voting" element={<VotingPage />} />
        </Routes>
      </Router>
    </AuthContextWrapper>
  );
};

export default App;
