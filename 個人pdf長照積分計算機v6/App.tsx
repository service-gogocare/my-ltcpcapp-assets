
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Points, CoursePoints, CalculationResults } from './types';
import { usePointCalculator } from './hooks/usePointCalculator';
import { ResultDisplay } from './components/ResultDisplay';
import { parsePdfForPoints } from './services/geminiService';
import { UploadIcon, SpinnerIcon, ChevronLeftIcon, ExternalLinkIcon, ChevronDownIcon } from './components/icons';
import { EmailModal } from './components/EmailModal';
import { TermsModal } from './components/TermsModal';
import { UsageGuide } from './components/UsageGuide';
import { FooterIllustration } from './components/FooterIllustration';
import { UsageGuideTitle } from './components/guide-images/UsageGuideTitle';


const initialPoints: Points = {
  professional: { physical: 0, online: 0 },
  quality: { physical: 0, online: 0 },
  ethics: { physical: 0, online: 0 },
  regulations: { physical: 0, online: 0 },
  fireSafety: 0,
  emergencyResponse: 0,
  infectionControl: 0,
  genderSensitivity: 0,
  culturalOld: 0,
  culturalNew: { indigenous: 0, multicultural: 0 },
};

const PointInput: React.FC<{ label: string; value: number; onChange: (value: number) => void; }> = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm text-gray-900 dark:text-gray-100"
      />
    </div>
  );
};

const CoursePointInput: React.FC<{
    category: keyof Pick<Points, 'professional' | 'quality' | 'ethics' | 'regulations'>;
    values: CoursePoints;
    onChange: (category: keyof Pick<Points, 'professional' | 'quality' | 'ethics' | 'regulations'>, type: keyof CoursePoints, value: number) => void;
    label: string;
}> = ({ category, values, onChange, label }) => (
    <div className="col-span-1 md:col-span-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{label}</p>
        <div className="grid grid-cols-2 gap-4">
            <PointInput label="實體" value={values.physical} onChange={v => onChange(category, 'physical', v)} />
            <PointInput label="網路" value={values.online} onChange={v => onChange(category, 'online', v)} />
        </div>
    </div>
);

const CollapsibleSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen: boolean;
}> = ({ title, children, defaultOpen }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <h3 className="text-xl font-bold text-brand-primary dark:text-brand-accent text-left">{title}</h3>
        <ChevronDownIcon className={`w-6 h-6 text-gray-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        className={`transition-[max-height,opacity] duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 pt-0 border-t border-gray-100 dark:border-gray-700">
            <div className="pt-4">
                {children}
            </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [points, setPoints] = useState<Points>(initialPoints);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'initial' | 'manualInput' | 'detailed'>('initial');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple state to track if we are on mobile to handle default open/collapse state
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const results: CalculationResults = usePointCalculator(points);
  
  const handlePointChange = (key: keyof Points, value: any) => {
    setPoints(prev => ({ ...prev, [key]: value }));
  };
  
  const handleCoursePointChange = (
    category: keyof Pick<Points, 'professional' | 'quality' | 'ethics' | 'regulations'>,
    type: keyof CoursePoints,
    value: number
  ) => {
    setPoints(prev => ({
        ...prev,
        [category]: {
            ...prev[category],
            [type]: value
        }
    }));
  };

  const handleCulturalNewChange = (type: keyof Points['culturalNew'], value: number) => {
    setPoints(prev => ({
        ...prev,
        culturalNew: {
            ...prev.culturalNew,
            [type]: value,
        }
    }));
  };
  
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      const extractedPoints = await parsePdfForPoints(file);
      // Deep merge the extracted points into the existing state
      setPoints(prev => ({
        ...prev,
        ...extractedPoints,
        professional: { ...prev.professional, ...(extractedPoints.professional || {}) },
        quality: { ...prev.quality, ...(extractedPoints.quality || {}) },
        ethics: { ...prev.ethics, ...(extractedPoints.ethics || {}) },
        regulations: { ...prev.regulations, ...(extractedPoints.regulations || {}) },
        culturalNew: { ...prev.culturalNew, ...(extractedPoints.culturalNew || {}) },
      }));
      setViewMode('detailed');
    } catch (e) {
      setError(e instanceof Error ? e.message : '發生未知錯誤');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, []);

  const handleOpenEmailModal = () => setIsEmailModalOpen(true);

  const handleSendResult = useCallback(async (email: string) => {
    if (resultsRef.current === null) {
      throw new Error("結果元件未找到，無法生成圖片。");
    }
    
    // @ts-ignore
    const dataUrl = await window.htmlToImage.toJpeg(resultsRef.current, { 
        quality: 1.0,        // Max JPEG quality
        pixelRatio: 3,       // 3x resolution (Print quality) for sharper text and charts
        backgroundColor: '#ffffff',
        style: {
            backgroundColor: '#ffffff', // Force white background
        }
    });

    const payload = {
      email,
      imageData: dataUrl,
      points, // Raw input points
      results, // Calculated results
    };
    
    // The backend endpoint for sending results via email and saving to a Google Sheet.
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwflR8cuytm5kEgCHrCNqk0gPuTdVNRb9IOORPSKKiPyGgWZe0aIPcPR42ES74nGVYXtw/exec';

    // We use 'no-cors' mode to submit the data. This is a "fire and forget" approach.
    // Google Apps Script will execute successfully, but the browser's fetch promise 
    // will resolve with an 'opaque' response due to CORS policy, preventing us from reading the status.
    // We assume success if the fetch call itself doesn't throw an immediate network error (e.g., user is offline).
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // This is the key change to prevent client-side CORS errors.
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    // Because 'no-cors' mode is used, we cannot check `response.ok`.
    // The promise resolves without giving access to the response details.
    // If we reach this point, we assume the request was sent successfully.
  }, [points, results]);
  
  const handleGoBack = () => {
    // Always reset points when returning to the initial screen
    setPoints(initialPoints);
    setViewMode('initial');
    setError(null);
  };

  // Determine default state:
  // - In 'manualInput' mode: Defaults to OPEN (so user can type).
  // - In 'detailed' mode (after upload): Defaults to COLLAPSED on mobile (for cleanliness), OPEN on desktop.
  const defaultOpenState = viewMode === 'manualInput' || !isMobile;

  const InputForm = (
    <div className="space-y-4">
      <CollapsibleSection title="區段一：課程屬性積分" defaultOpen={defaultOpenState}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CoursePointInput category="professional" values={points.professional} onChange={handleCoursePointChange} label="專業課程" />
          <CoursePointInput category="quality" values={points.quality} onChange={handleCoursePointChange} label="專業品質" />
          <CoursePointInput category="ethics" values={points.ethics} onChange={handleCoursePointChange} label="專業倫理" />
          <CoursePointInput category="regulations" values={points.regulations} onChange={handleCoursePointChange} label="專業法規" />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="區段二：課程類別積分" defaultOpen={defaultOpenState}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PointInput label="消防安全" value={points.fireSafety} onChange={v => handlePointChange('fireSafety', v)} />
          <PointInput label="緊急應變" value={points.emergencyResponse} onChange={v => handlePointChange('emergencyResponse', v)} />
          <PointInput label="感染管制" value={points.infectionControl} onChange={v => handlePointChange('infectionControl', v)} />
          <PointInput label="性別敏感度" value={points.genderSensitivity} onChange={v => handlePointChange('genderSensitivity', v)} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="區段三：文化敏感度課程" defaultOpen={defaultOpenState}>
        <div className="space-y-6">
          <div>
            <PointInput label="舊制(2024/6/3前取得)累積積分" value={points.culturalOld} onChange={v => handlePointChange('culturalOld', v)} />
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">新制(2024/6/3後取得)累積積分</h4>
              <div className="mt-4 space-y-4">
                  <PointInput label="原住民族文化敏感度及能力" value={points.culturalNew.indigenous} onChange={v => handleCulturalNewChange('indigenous', v)} />
                  <PointInput label="多元族群文化敏感度及能力" value={points.culturalNew.multicultural} onChange={v => handleCulturalNewChange('multicultural', v)} />
              </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-brand-dark font-sans text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
        <style>{`
        @keyframes fade-in-up { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        } 
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        @keyframes jump-glow {
          0%, 100% {
            transform: translateY(0);
            text-shadow:
              /* Border */
              -1px -1px 0 #6b460d, 1px -1px 0 #6b460d, -1px 1px 0 #6b460d, 1px 1px 0 #6b460d,
              /* Subtle Glow */
              0 0 4px #fde047;
          }
          50% {
            transform: translateY(-4px); /* The "jump" */
            text-shadow:
              /* Border */
              -1px -1px 0 #6b460d, 1px -1px 0 #6b460d, -1px 1px 0 #6b460d, 1px 1px 0 #6b460d,
              /* Brighter Glow at peak */
              0 0 8px #fef08a, 0 0 12px #facc15;
          }
        }
        .animate-jump-glow {
          animation: jump-glow 1.8s ease-in-out infinite;
        }
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress-fill {
            animation: progress-fill 4s ease-out forwards;
        }
      `}</style>
        <div className="max-w-7xl mx-auto relative">
          <FooterIllustration className={viewMode === 'detailed' ? 'bottom-[-20px]' : 'bottom-6'} />
          <header className="text-center relative mb-8">
            {(viewMode === 'detailed' || viewMode === 'manualInput') && (
                <button 
                    onClick={handleGoBack}
                    className="absolute left-0 bottom-0 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 flex items-center px-2 py-1 text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-gray-100 dark:focus:ring-offset-brand-dark"
                    aria-label="返回首頁"
                >
                    <ChevronLeftIcon className="h-6 w-6 mr-1" />
                    <span>返回</span>
                </button>
            )}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#248dc5] dark:text-white">長照積分智慧計算機</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">GOGO CARE Copyright©</p>
            
            {viewMode === 'initial' && (
              <a
                href="https://ltcpap.mohw.gov.tw/molc/eg999/index"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-brand-secondary dark:text-brand-accent hover:underline transition-colors"
              >
                <ExternalLinkIcon className="w-5 h-5 mr-2" />
                <span>衛福部長照積分系統查詢</span>
              </a>
            )}
          </header>

          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" disabled={isLoading} />

          {viewMode === 'initial' && (
            <>
              <UsageGuideTitle alt="使用教學" />
              <UsageGuide />

              <div className="max-w-4xl mx-auto mt-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg relative z-10">
                  <h3 className="text-2xl font-bold text-[#248dc5] dark:text-brand-accent mb-2 text-center">開始您的積分計算</h3>
                  <p className="text-center text-gray-600 dark:text-gray-400 mb-8">上傳您的積分PDF文件，或選擇手動輸入。</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="relative overflow-hidden w-full sm:flex-1 flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-secondary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-slate-400 dark:disabled:bg-gray-600 disabled:cursor-wait transition-colors duration-300"
                    >
                      {isLoading ? (
                        <>
                          <div className="absolute top-0 left-0 h-full bg-brand-accent animate-progress-fill"></div>
                          <span className="relative z-10 font-semibold">AI分析中...</span>
                        </>
                      ) : (
                        <div className="flex items-center">
                          <UploadIcon className="h-5 w-5 mr-3" />
                          <span>上傳PDF</span>
                        </div>
                      )}
                    </button>
                    <button onClick={() => setViewMode('manualInput')} className="w-full sm:flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-brand-primary dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-all duration-300">
                      手動輸入
                    </button>
                  </div>
                </div>
                {error && <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md">{error}</div>}
              </div>
              
            </>
          )}
          
          {viewMode === 'manualInput' && (
              <div className="max-w-4xl mx-auto animate-fade-in-up">
                  {InputForm}
                  <div className="mt-8 text-center">
                      <button
                          onClick={() => setViewMode('detailed')}
                          className="px-8 py-3 border border-transparent text-lg font-bold rounded-md text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-transform transform hover:scale-105"
                      >
                          積分分析
                      </button>
                  </div>
              </div>
          )}

          {viewMode === 'detailed' && (
            <div>
              {error && <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {InputForm}
                
                <div className="sticky top-8 self-start">
                  <div ref={resultsRef}>
                    <ResultDisplay isLoading={isLoading} results={results} totalPointsGoal={120} onDownload={handleOpenEmailModal} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <EmailModal
              isOpen={isEmailModalOpen}
              onClose={() => setIsEmailModalOpen(false)}
              onSubmit={handleSendResult}
          />
          <TermsModal
              isOpen={isTermsModalOpen}
              onClose={() => setIsTermsModalOpen(false)}
          />
          <footer className="max-w-4xl mx-auto mt-12 pt-6 relative">
              <div className="relative z-10 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                      本計算機僅供參考，實際積分認定請以主管機關最終審核為準。
                  </p>
                  <div className="mt-2">
                      <button 
                          onClick={() => setIsTermsModalOpen(true)} 
                          className="text-sm text-gray-500 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-accent underline focus:outline-none focus:ring-2 focus:ring-brand-accent rounded"
                      >
                          《使用條款》
                      </button>
                  </div>
              </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;
