import React from 'react';
import { XCircleIcon } from './icons';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FormattedTermsContent: React.FC = () => (
    <>
        <h3 className="text-lg font-bold mb-4">服務目的</h3>
        <p className="mb-4">本工具係協助長照人員透過自行匯出之「長照人員積分查詢資料」進行整理與分析，讓使用者了解現有積分狀況。</p>

        <h3 className="text-lg font-bold mb-4">資料來源與責任</h3>
        <p className="mb-4">使用者須自行匯出並上傳相關資料，資料內容包含部分個人資訊。使用者應確認其擁有該資料之合法使用權，並對資料正確性自行負責。</p>

        <h3 className="text-lg font-bold mb-4">個人資料使用</h3>
        <p className="mb-4">本工具僅於使用當下進行計算與分析，系統將留存、分析並做為課程推廣所用，不做其他使用。使用者須自行妥善保管匯出檔案，以避免資料外洩風險。</p>

        <h3 className="text-lg font-bold mb-4">結果參考性</h3>
        <p className="mb-4">本工具所提供之計算結果，僅供使用者參考，不代表官方最終審核或認定。實際積分累計與資格判定，仍以主管機關公告與審核結果為準。</p>

        <h3 className="text-lg font-bold mb-4">免責聲明</h3>
        <p className="mb-4">因使用本工具所導致之任何直接或間接損失，本平台與開發團隊概不負責。</p>

        <h3 className="text-lg font-bold mb-4">使用者義務</h3>
        <p className="mb-4">使用本工具即表示使用者已了解並同意上述條款，並承諾不將本工具用於違反法令或侵害他人權益之行為。</p>

        <div className="mt-6 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md">
            <p><span className="font-bold">⚠️ 提醒：</span>本工具僅為輔助性分析平台，正確積分資訊請務必以主管機關之公告結果為依據。</p>
        </div>
    </>
);


export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="terms-modal-title">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 relative flex-shrink-0">
          <h4 id="terms-modal-title" className="text-xl font-bold text-center text-brand-primary dark:text-brand-accent">《使用條款》</h4>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="關閉視窗">
             <XCircleIcon className="h-8 w-8" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-gray-700 dark:text-gray-300">
          <p className="mb-6">感謝您使用積分計算機(以下簡稱本工具)。為確保您的權益，請於操作前詳閱以下內容，並於同意後再進行使用：</p>
          <FormattedTermsContent />
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-right flex-shrink-0">
            <button
                onClick={onClose}
                className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
            >
                我已閱讀並同意
            </button>
        </div>
      </div>
    </div>
  );
};