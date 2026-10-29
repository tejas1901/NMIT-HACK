import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Modal from '../components/Modal';
import '../App.css';

export function LandingPage({ onNavigateLogin, onLoginSuccess }) {
  const [modal, setModal] = useState(null);

  return (
    <div className="landing-root">
      <Navbar
        onSignIn={(role = 'customer') => onNavigateLogin(role)}
        onGetStarted={() => onNavigateLogin('customer', 'register')}
        onHowItWorks={() => setModal('howitworks')}
        onOpenModal={(type) => setModal(type)}
      />

      <HeroSection
        onExplore={() => onNavigateLogin('customer')}
        onHowItWorks={() => setModal('howitworks')}
        onOpenModal={(type) => setModal(type)}
      />

      {modal && (
        <Modal
          type={modal}
          onClose={() => setModal(null)}
          onLoginSuccess={(u) => {
            setModal(null);
            onLoginSuccess(u);
          }}
          onRegisterSuccess={(u) => {
            setModal(null);
            onLoginSuccess(u);
          }}
          onOpenRegister={() => onNavigateLogin('customer', 'register')}
        />
      )}
    </div>
  );
}

export default LandingPage;
