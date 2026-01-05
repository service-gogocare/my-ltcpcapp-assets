
import React, { useState } from 'react';
import { SpinnerIcon, XCircleIcon, CheckCircleIcon } from './icons';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>; // No longer needs email parameter
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      await onSubmit();
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '傳送失敗，請確認連線狀態或稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="email-modal-title">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md animate-fade-in-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 relative">
          <h4 id="email-modal-title" className="text-xl font-bold text-center text-brand-primary dark:text-brand-accent">
            傳送分析報告
          </h4>
          <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="關閉視窗">
             <XCircleIcon className="h-8 w-8" />
          </button>
        </div>
        <div className="p-6 text-center">
          {isSuccess ? (
            <div className="py-8 space-y-4">
              <CheckCircleIcon className="h-16 w-16 text-status-success mx-auto" />
              <h5 className="text-xl font-semibold text-status-success">已成功傳送！</h5>
              <p className="text-gray-600 dark:text-gray-400">
                積分結果圖片與免費課程資訊已寄送到您的註冊信箱，請至信箱查收。
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300">
                  系統將自動查找您的註冊信箱，並傳送詳細的積分分析報告。
                </p>
                <div className="p-4 bg-brand-accent/20 rounded-lg border border-brand-accent/50 text-brand-primary text-sm">
                  ✨ 包含免費課程領取連結 ✨
                </div>
              </div>
              
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md text-sm text-left">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform active:scale-95"
                >
                  {isLoading ? <SpinnerIcon className="animate-spin h-6 w-6 mr-3" /> : null}
                  {isLoading ? '處理中...' : '確認並傳送結果'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-sm text-gray-400 hover:text-gray-600 underline"
                >
                  先不用，我再看看
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
