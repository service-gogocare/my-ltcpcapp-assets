import React, { useState } from 'react';
import { Step1 } from './guide-images/Step1';
import { Step2 } from './guide-images/Step2';
import { Step3 } from './guide-images/Step3';
import { Step4 } from './guide-images/Step4';
import { ImageModal } from './ImageModal';
import { GuideImage01_1 } from './guide-images/GuideImage01_1';
import { GuideImage01_2 } from './guide-images/GuideImage01_2';
import { GuideImage03 } from './guide-images/GuideImage03';
import { GuideImage04 } from './guide-images/GuideImage04';

export const UsageGuide: React.FC = () => {
  const [isStep1ModalOpen, setIsStep1ModalOpen] = useState(false);
  const [isStep2ModalOpen, setIsStep2ModalOpen] = useState(false);
  const [isStep3ModalOpen, setIsStep3ModalOpen] = useState(false);
  const [isStep4ModalOpen, setIsStep4ModalOpen] = useState(false);

  return (
    <>
      <div className="max-w-6xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        {/* Changed grid-cols-1 to grid-cols-2 for mobile side-by-side layout, and adjusted gap */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          <div
            className="transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
            onClick={() => setIsStep1ModalOpen(true)}
            role="button"
            aria-label="查看步驟一詳細圖文說明"
          >
            <Step1 />
          </div>
          <div
            className="transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
            onClick={() => setIsStep2ModalOpen(true)}
            role="button"
            aria-label="查看步驟二詳細圖文說明"
          >
            <Step2 />
          </div>
          <div
            className="transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
            onClick={() => setIsStep3ModalOpen(true)}
            role="button"
            aria-label="查看步驟三詳細圖文說明"
          >
            <Step3 />
          </div>
          <div
            className="transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
            onClick={() => setIsStep4ModalOpen(true)}
            role="button"
            aria-label="查看步驟四詳細圖文說明"
          >
            <Step4 />
          </div>
        </div>
      </div>

      <ImageModal
        isOpen={isStep1ModalOpen}
        onClose={() => setIsStep1ModalOpen(false)}
        title="步驟一：登入與查詢"
      >
        <GuideImage01_1 />
      </ImageModal>

      <ImageModal
        isOpen={isStep2ModalOpen}
        onClose={() => setIsStep2ModalOpen(false)}
        title="步驟二：下載積分證明"
      >
        <GuideImage01_2 />
      </ImageModal>

      <ImageModal
        isOpen={isStep3ModalOpen}
        onClose={() => setIsStep3ModalOpen(false)}
        title="步驟三：上傳PDF"
      >
        <GuideImage03 />
      </ImageModal>

      <ImageModal
        isOpen={isStep4ModalOpen}
        onClose={() => setIsStep4ModalOpen(false)}
        title="步驟四：完成"
      >
        <GuideImage04 />
      </ImageModal>
    </>
  );
};
