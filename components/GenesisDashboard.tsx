import React, { useState } from 'react';
import { CreditCard, TrendingUp, DollarSign, Activity, PieChart, Menu, Bell, Search, ArrowRight } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../constants';
import UserProfileModal from './UserProfileModal';
import { UserProfile } from '../types';

interface GenesisDashboardProps {
  userProfile?: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

const GenesisDashboard: React.FC<GenesisDashboardProps> = ({ userProfile, onSaveProfile }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-24">
      {/* Top Navigation - Red Gradient */}
      <nav className="bg-gradient-to-r from-red-700 to-red-900 text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Menu className="text-red-100 cursor-pointer hover:text-white transition-colors" />
            <h1 className="text-2xl font-bold tracking-widest">GENESIS</h1>
          </div>
          <div className="flex items-center gap-5">
            <Search className="text-red-100 cursor-pointer hover:text-white transition-colors" size={20} />
            <div className="relative">
              <Bell className="text-red-100 cursor-pointer hover:text-white transition-colors" size={20} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
            {/* User Profile Trigger */}
            <button 
                onClick={() => setIsProfileOpen(true)}
                className="w-10 h-10 rounded-full bg-white text-red-700 flex items-center justify-center text-sm font-bold shadow-md hover:bg-red-50 transition-colors focus:ring-2 focus:ring-white/50"
            >
              JD
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Balance Card - Red/Pink Gradient */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl group-hover:opacity-15 transition-opacity duration-500"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300 opacity-10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="text-red-100 text-sm font-medium mb-1">総資産</p>
                    <h2 className="text-4xl font-bold mb-8 tracking-tight">¥ 4,250,300</h2>
                  </div>
                  <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <CreditCard className="text-white" />
                  </div>
              </div>
              
              <div className="flex items-center gap-12">
                 <div>
                    <p className="text-[10px] text-red-100 uppercase tracking-widest mb-1">口座名義</p>
                    <p className="font-medium tracking-wide text-lg">YAMADA TARO</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-red-100 uppercase tracking-widest mb-1">口座番号</p>
                    <p className="font-medium font-mono text-lg tracking-wider">**** 4589</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
            <div>
               <p className="text-gray-500 text-sm font-medium">今月の支出</p>
               <h3 className="text-3xl font-bold mt-2 text-gray-900">¥ 124,500</h3>
               <div className="flex items-center gap-2 mt-3 text-emerald-600 text-sm bg-emerald-50 w-fit px-2 py-1 rounded-md">
                 <TrendingUp size={16} />
                 <span className="font-medium">先月比 -12%</span>
               </div>
            </div>
            <div className="mt-4 flex gap-3">
                <button className="flex-1 bg-red-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-red-200 shadow-md">振込</button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">詳細</button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
            <h3 className="text-sm font-bold text-gray-400 mb-3 px-1 uppercase tracking-wider">クイックアクション</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {[
                    { label: '送金', icon: <ArrowRight /> },
                    { label: '支払い', icon: <CreditCard /> },
                    { label: 'チャージ', icon: <DollarSign /> },
                    { label: '明細', icon: <Activity /> },
                    { label: 'カード', icon: <CreditCard /> },
                    { label: 'ローン', icon: <TrendingUp /> }
                ].map((action, i) => (
                    <button key={i} className="flex flex-col items-center gap-3 min-w-[80px] group">
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm group-hover:shadow-md flex items-center justify-center text-red-600 border border-gray-100 transition-all group-hover:-translate-y-1">
                            {React.cloneElement(action.icon as React.ReactElement<any>, { size: 24 })}
                        </div>
                        <span className="text-xs font-bold text-gray-600 group-hover:text-red-600 transition-colors">{action.label}</span>
                    </button>
                ))}
            </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-gray-900">最近の取引</h3>
            <button className="text-red-600 text-sm font-bold hover:text-red-800 transition-colors">全て見る</button>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {MOCK_TRANSACTIONS.slice(0, 5).map((t, i) => (
              <div key={t.id} className={`p-4 flex items-center justify-between hover:bg-red-50/50 transition-colors cursor-pointer group ${i !== 0 ? 'border-t border-gray-50' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${t.amount > 0 ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200' : 'bg-red-50 text-red-500 group-hover:bg-red-100'}`}>
                    {t.amount > 0 ? <DollarSign size={22} /> : <Activity size={22} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{t.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{t.category} • {t.date}</p>
                  </div>
                </div>
                <div className={`font-bold text-sm sm:text-base ${t.amount > 0 ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()}円
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                        <PieChart size={20}/>
                    </div>
                    <h3 className="font-bold text-gray-900">支出分析</h3>
                </div>
                <div className="h-40 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                    <PieChart size={32} className="opacity-20"/>
                    <span>チャート表示エリア</span>
                </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <TrendingUp size={20}/>
                    </div>
                    <h3 className="font-bold text-gray-900">投資ポートフォリオ</h3>
                </div>
                <div className="h-40 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                    <TrendingUp size={32} className="opacity-20"/>
                    <span>チャート表示エリア</span>
                </div>
            </div>
        </section>

      </main>

      {/* User Profile Modal */}
      {isProfileOpen && (
        <UserProfileModal 
            onClose={() => setIsProfileOpen(false)} 
            initialProfile={userProfile}
            onSave={onSaveProfile}
        />
      )}
    </div>
  );
};

export default GenesisDashboard;
