import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { AGE_GROUPS, PREFECTURES, OCCUPATIONS, INTERESTS } from '../constants';

interface UserProfileModalProps {
  onClose: () => void;
  initialProfile?: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose, initialProfile, onSave }) => {
  const [profile, setProfile] = useState<UserProfile>(initialProfile || {
    ageGroup: '',
    prefecture: '',
    occupation: '',
    interests: []
  });

  const toggleInterest = (interest: string) => {
    setProfile(prev => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleSave = () => {
    onSave(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 flex justify-between items-center text-white">
            <h2 className="text-xl font-bold">ユーザープロファイル設定</h2>
            <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={24} />
            </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Age */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">年齢</label>
                <select 
                    value={profile.ageGroup}
                    onChange={(e) => setProfile({...profile, ageGroup: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="">選択してください</option>
                    {AGE_GROUPS.map(age => <option key={age} value={age}>{age}</option>)}
                </select>
            </div>

            {/* Address */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">お住まい（都道府県）</label>
                <select 
                    value={profile.prefecture}
                    onChange={(e) => setProfile({...profile, prefecture: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="">選択してください</option>
                    {PREFECTURES.map(pref => <option key={pref} value={pref}>{pref}</option>)}
                </select>
            </div>

            {/* Occupation */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">職業</label>
                <select 
                    value={profile.occupation}
                    onChange={(e) => setProfile({...profile, occupation: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="">選択してください</option>
                    {OCCUPATIONS.map(occ => <option key={occ} value={occ}>{occ}</option>)}
                </select>
            </div>

            {/* Interests */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">興味・関心</label>
                <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(interest => {
                        const isSelected = profile.interests.includes(interest);
                        return (
                            <button
                                key={interest}
                                onClick={() => toggleInterest(interest)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                    isSelected 
                                    ? 'bg-red-50 border-red-500 text-red-700' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {interest} {isSelected && <Check size={14} className="inline ml-1"/>}
                            </button>
                        );
                    })}
                </div>
            </div>

        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end">
            <button 
                onClick={handleSave}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-red-200 transition-colors flex items-center gap-2"
            >
                保存する
            </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
