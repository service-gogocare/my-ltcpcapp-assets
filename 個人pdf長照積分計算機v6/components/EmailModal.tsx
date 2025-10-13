import React, { useState } from 'react';
import { SpinnerIcon, XCircleIcon } from './icons';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('請輸入有效的電子郵件地址。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      await onSubmit(email);
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '傳送失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setEmail('');
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="email-modal-title">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 relative">
          <h4 id="email-modal-title" className="text-xl font-bold text-center text-brand-primary dark:text-brand-accent">下載並透過Email接收結果</h4>
          <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="關閉視窗">
             <XCircleIcon className="h-8 w-8" />
          </button>
        </div>
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-8">
              <h5 className="text-lg font-semibold text-status-success">傳送成功！</h5>
              <p className="text-gray-600 dark:text-gray-400 mt-2">結果圖片已寄送至您的信箱，請稍後查收。</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  電子郵件地址
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm text-gray-900 dark:text-gray-100"
                  placeholder="your.email@example.com"
                  aria-describedby="email-description"
                />
                <p id="email-description" className="mt-2 text-xs text-gray-500 dark:text-gray-400">我們會將結果圖片寄送給您，並將您的積分資料匿名記錄以供分析。</p>
              </div>

              <div className="text-center font-bold text-lg text-yellow-500 animate-jump-glow py-2">
                ✨ 領取免費課程 ✨
              </div>
              
              {error && <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md text-sm">{error}</div>}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-brand-secondary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5 mr-3" /> : null}
                {isLoading ? '處理中...' : '送出並接收結果'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};