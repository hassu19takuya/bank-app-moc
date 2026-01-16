import React, { useState } from 'react';
import GenesisDashboard from './components/GenesisDashboard';
import ChatInterface from './components/ChatInterface';
import { MessageCircle } from 'lucide-react';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);

  return (
    <div className="relative overflow-hidden">
      {/* Background App */}
      <GenesisDashboard userProfile={userProfile} onSaveProfile={setUserProfile} />

      {/* Floating Action Button */}
      <div className={`fixed bottom-8 right-8 z-50 transition-all duration-300 ${isChatOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl hover:shadow-red-500/40 transition-all flex items-center gap-2 group"
        >
          <MessageCircle size={28} className="group-hover:rotate-12 transition-transform" />
          <span className="font-semibold pr-2">AI コンシェルジュ</span>
        </button>
      </div>

      {/* Chat Overlay/Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-8 pointer-events-none">
          {/* Backdrop (Only visual, not clickable to close) */}
          <div className="absolute inset-0 pointer-events-auto bg-black/5 sm:bg-transparent backdrop-blur-[1px] sm:backdrop-blur-none transition-all"></div>

          {/* Chat Window */}
          <div className="w-full h-[92vh] sm:w-[450px] sm:h-[650px] pointer-events-auto relative z-10 transition-all animate-in slide-in-from-bottom-10 fade-in duration-300 shadow-2xl rounded-t-2xl sm:rounded-2xl overflow-hidden ring-1 ring-black/5">
            <ChatInterface onClose={() => setIsChatOpen(false)} userProfile={userProfile} />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
