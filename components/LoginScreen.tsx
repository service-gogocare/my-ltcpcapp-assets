
import React, { useState } from 'react';
import { validateIdFormat, checkUserExists, registerPendingUser, verifyRegistration } from '../services/authService';
import { SpinnerIcon, InfoIcon, ExternalLinkIcon } from './icons';

interface LoginScreenProps {
  onLoginSuccess: (id: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [id, setId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowRegister(false);

    const upperId = id.toUpperCase().trim();

    if (!validateIdFormat(upperId)) {
      setError('身分證格式有誤。請確認：第一碼為大寫英文字母，第二碼為 1, 2 或 9，且總長度為 10 碼。');
      return;
    }

    setIsLoading(true);
    try {
      const exists = await checkUserExists(upperId);
      if (exists) {
        onLoginSuccess(upperId);
      } else {
        setError('資料庫查無此身分證字號或帳號尚未驗證。請確認您是否已完成註冊。');
        setShowRegister(true);
      }
    } catch (err) {
      setError('連線失敗，請檢查網路狀態或稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = async () => {
    const upperId = id.toUpperCase().trim();
    // 異步執行，不阻礙使用者跳轉頁面
    registerPendingUser(upperId);
    window.open("https://www.gogocare.com.tw/tw/mem/register", "_blank");
  };

  const handleReverify = async () => {
    const upperId = id.toUpperCase().trim();
    setIsLoading(true);
    setError(null);
    try {
      const success = await verifyRegistration(upperId);
      if (success) {
        onLoginSuccess(upperId);
      } else {
        setError('驗證失敗。請確保您已在官方網站完成註冊流程。');
      }
    } catch (err) {
        setError('連線失敗，請檢查網路狀態。');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-brand-dark p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="bg-brand-primary p-6 text-white text-center">
          <h2 className="text-2xl font-bold">長照積分智慧計算機</h2>
          <p className="text-brand-accent text-sm mt-1">學員身分驗證</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="id-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                請輸入您的身分證字號
              </label>
              <input
                id="id-input"
                type="text"
                maxLength={10}
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase())}
                placeholder="例如：A123456789"
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all outline-none"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-200 text-sm flex items-start">
                <InfoIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !id}
              className="w-full py-3 px-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-lg shadow-lg transform transition active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="animate-spin h-5 w-5 mr-2" />
                  驗證中...
                </>
              ) : (
                '開始使用'
              )}
            </button>
          </form>

          {showRegister && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center animate-fade-in-up">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                尚未加入學員？立即註冊以啟用計算機服務。
              </p>
              <button
                onClick={handleRegisterClick}
                className="inline-flex items-center px-6 py-2 border-2 border-brand-secondary text-brand-secondary dark:text-brand-accent font-semibold rounded-full hover:bg-brand-secondary hover:text-white transition-all"
              >
                前往註冊頁面
                <ExternalLinkIcon className="ml-2 h-4 w-4" />
              </button>
              <button 
                onClick={handleReverify}
                disabled={isLoading}
                className="block w-full mt-4 text-xs text-gray-400 hover:text-brand-primary underline transition-colors disabled:opacity-50"
              >
                已完成註冊？按此重新驗證
              </button>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center text-xs text-gray-500">
          GOGO CARE Copyright© 2024
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
