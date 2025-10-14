import React, { useState } from 'react';
import { CalculationResults, RecommendedCourse } from '@/lib/types';
import { CheckCircleIcon, XCircleIcon, InfoIcon, ExternalLinkIcon, DownloadIcon } from './icons';
import { recommendedCourses } from '@/data/courses';
import { CircularProgress } from './CircularProgress';

interface ResultDisplayProps {
  results: CalculationResults;
  totalPointsGoal: number;
  isLoading: boolean;
  onDownload: () => void;
}

const RecommendationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  courses: RecommendedCourse[];
}> = ({ isOpen, onClose, title, courses }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="recommendation-modal-title">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h4 id="recommendation-modal-title" className="text-xl font-bold text-brand-primary dark:text-brand-accent">{title}</h4>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" aria-label="關閉視窗">
             <XCircleIcon className="h-8 w-8" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {courses.length > 0 ? courses.map(course => (
             <a
                key={course.id}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-brand-accent dark:hover:bg-brand-secondary hover:text-brand-dark dark:hover:text-white transition-all duration-300 group"
            >
                <span className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-brand-dark dark:group-hover:text-white">
                    {course.name}
                </span>
                <ExternalLinkIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-brand-dark dark:group-hover:text-white transition-colors" />
            </a>
          )) : (
            <p className="text-gray-600 dark:text-gray-400">目前沒有針對此項目的特定課程推薦。</p>
          )}
        </div>
      </div>
    </div>
  );
};


const ResultItem: React.FC<{ isMet: boolean; label: string; details?: React.ReactNode; onRecommendClick?: () => void; }> = ({ isMet, label, details, onRecommendClick }) => (
  <li className="flex items-start sm:items-center space-x-3">
    <div className="flex-shrink-0 mt-1 sm:mt-0">
      {isMet ? (
        <CheckCircleIcon className="h-6 w-6 text-status-success" />
      ) : (
        <XCircleIcon className="h-6 w-6 text-status-danger" />
      )}
    </div>
    <div className="flex-grow">
      <p className="text-gray-800 dark:text-gray-200">{label}</p>
      {details && <div className="text-sm text-gray-500 dark:text-gray-400">{details}</div>}
    </div>
    {!isMet && onRecommendClick && (
        <button onClick={onRecommendClick} className="ml-4 flex-shrink-0 px-3 py-1 text-xs font-semibold text-brand-secondary dark:text-brand-accent border border-brand-secondary dark:border-brand-accent rounded-full hover:bg-brand-secondary hover:text-white dark:hover:bg-brand-accent dark:hover:text-brand-dark transition-colors whitespace-nowrap">
            推薦課程
        </button>
    )}
  </li>
);


const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const percentage = Math.min((value / max) * 100, 100);
  const remaining = max - value;
  return (
    <div>
      <div className="flex justify-between items-baseline flex-wrap gap-x-2 mb-1">
        <span className="text-base font-medium text-brand-primary dark:text-white">
          {`總積分: ${value.toFixed(2)} / ${max}`}
          {remaining > 0 && (
            <span className="text-sm font-medium text-status-danger ml-2 whitespace-nowrap">
              {`(尚缺 ${remaining.toFixed(2)} 點)`}
            </span>
          )}
        </span>
        <span className="text-sm font-medium text-brand-primary dark:text-white">{`${Math.round(percentage)}%`}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
        <div
          className="bg-brand-secondary h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ results, totalPointsGoal, isLoading, onDownload }) => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; courses: RecommendedCourse[] }>({ isOpen: false, title: '', courses: [] });

  const showRecommendations = (category: 'PROFESSIONAL' | 'QER' | 'CORE' | 'CULTURAL_NEW') => {
    let title = '';
    let courses: RecommendedCourse[] = [];

    switch (category) {
        case 'PROFESSIONAL':
            title = '專業課程 推薦課程';
            courses = recommendedCourses.filter(c => c.category === 'PROFESSIONAL');
            break;
        case 'QER':
            title = '專業品質/倫理/法規 推薦課程';
            courses = recommendedCourses.filter(c => c.category === 'QER');
            break;
        case 'CORE':
            title = '消防、應變、感控、性別 推薦課程';
            courses = recommendedCourses.filter(c => c.category === 'CORE');
            break;
        case 'CULTURAL_NEW':
            title = '文化敏感度 推薦課程';
            courses = recommendedCourses.filter(c => c.category === 'CULTURAL_NEW');
            break;
    }
    setModalState({ isOpen: true, title, courses });
  };
  
  const qerGoal = 24;
  const qerDetails = results.isQualityEthicsRegulationsSumMet ? (
    <span>
        目前 <span className="font-bold text-status-success">{results.qualityEthicsRegulationsSum.toFixed(2)}</span> 點，已達標 {`(≧ ${qerGoal} 點)`}
    </span>
  ) : (
    <span>
      目前 {results.qualityEthicsRegulationsSum.toFixed(2)} 點，
      <span className="font-bold text-status-danger">
        尚缺 {(qerGoal - results.qualityEthicsRegulationsSum).toFixed(2)} 點
      </span>
    </span>
  );

  const coreGoal = 10;
  const coreDetails = results.isCoreCoursesSumMet ? (
      <span>
          目前 <span className="font-bold text-status-success">{results.coreCoursesSum.toFixed(2)}</span> 點，已達標 {`(≧ ${coreGoal} 點)`}
      </span>
  ) : (
      <span>
          目前 {results.coreCoursesSum.toFixed(2)} 點，
          <span className="font-bold text-status-danger">
              尚缺 {(coreGoal - results.coreCoursesSum).toFixed(2)} 點
          </span>
      </span>
  );

  return (
    <>
      <RecommendationModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        courses={modalState.courses}
      />
      <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-brand-primary dark:text-brand-accent">積分審核結果</h3>
            <button
                onClick={onDownload}
                disabled={isLoading}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-brand-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                aria-label="下載結果為JPEG圖片"
            >
                <DownloadIcon className="h-5 w-5 mr-2" />
                <span>下載結果</span>
            </button>
        </div>

        <div className="mb-6">
          <ProgressBar value={results.totalPoints} max={totalPointsGoal} />
          <ul className="mt-2">
            <ResultItem
              isMet={results.isTotalPointsMet}
              label={`總積分目標: 需達 ${totalPointsGoal} 點`}
            />
          </ul>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-100 mb-3">課程屬性積分</h4>
            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x divide-gray-200 dark:divide-gray-700">
                {/* Professional Column */}
                <div className="flex flex-col">
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
                    <CircularProgress value={results.professionalSum} size={110} strokeWidth={9} />
                    <div className="mt-3 flex-grow flex flex-col items-center justify-center">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">專業課程</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">目前 {results.professionalSum.toFixed(2)} 點</p>
                        <button
                            onClick={() => showRecommendations('PROFESSIONAL')}
                            className="mt-2 px-3 py-1 text-xs font-semibold text-brand-secondary dark:text-brand-accent border border-brand-secondary dark:border-brand-accent rounded-full hover:bg-brand-secondary hover:text-white dark:hover:bg-brand-accent dark:hover:text-brand-dark transition-colors whitespace-nowrap"
                        >
                            推薦課程
                        </button>
                    </div>
                  </div>
                </div>

                {/* QER Column with Footer */}
                <div className="flex flex-col">
                  <div className="flex-grow flex flex-col items-center text-center p-4">
                    <CircularProgress value={results.qualityEthicsRegulationsSum} max={qerGoal} size={110} strokeWidth={9} isMet={results.isQualityEthicsRegulationsSumMet} />
                    <div className="mt-3 flex-grow flex flex-col items-center justify-center">
                      <div className="flex items-center justify-center space-x-2">
                        {results.isQualityEthicsRegulationsSumMet ? (
                          <CheckCircleIcon className="h-5 w-5 text-status-success flex-shrink-0" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-status-danger flex-shrink-0" />
                        )}
                        <p className="font-semibold text-gray-800 dark:text-gray-200">專業品質/倫理/法規</p>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{qerDetails}</div>
                      {!results.isQualityEthicsRegulationsSumMet && (
                        <button onClick={() => showRecommendations('QER')} className="mt-2 px-3 py-1 text-xs font-semibold text-brand-secondary dark:text-brand-accent border border-brand-secondary dark:border-brand-accent rounded-full hover:bg-brand-secondary hover:text-white dark:hover:bg-brand-accent dark:hover:text-brand-dark transition-colors whitespace-nowrap">
                          推薦課程
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 p-3 text-center text-sm text-gray-600 dark:text-gray-400">
                    此部分合計採計上限為36點，您計入總分的點數為: {results.cappedQualityEthicsRegulationsSum.toFixed(2)} 點。
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-100 mb-3">消防、應變、感控、性別積分</h4>
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl">
              <div className="flex-shrink-0">
                <CircularProgress value={results.coreCoursesSum} max={coreGoal} size={110} strokeWidth={9} isMet={results.isCoreCoursesSumMet && results.areAllCoreCoursesTaken} />
              </div>
              <div className="flex-grow w-full">
                <ul className="space-y-2">
                  <ResultItem
                    isMet={results.isCoreCoursesSumMet && results.areAllCoreCoursesTaken}
                    label="消防、應變、感控、性別積分"
                    details={coreDetails}
                    onRecommendClick={() => showRecommendations('CORE')}
                  />
                  {!results.areAllCoreCoursesTaken && results.coreCoursesSum > 0 && (
                      <li className="text-xs text-status-warning sm:pl-9 flex items-start">
                          <InfoIcon className="h-4 w-4 mr-1.5 flex-shrink-0 mt-0.5" />
                          <span>提醒：消防、應變、感控、性別四項課程<span className="font-bold">皆須有積分</span>才算達標。</span>
                      </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-100">文化敏感度課程</h4>
                <button
                    onClick={() => showRecommendations('CULTURAL_NEW')}
                    className="px-3 py-1 text-xs font-semibold text-brand-secondary dark:text-brand-accent border border-brand-secondary dark:border-brand-accent rounded-full hover:bg-brand-secondary hover:text-white dark:hover:bg-brand-accent dark:hover:text-brand-dark transition-colors whitespace-nowrap"
                >
                    推薦課程
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                  {/* Old System Card */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">舊制 (2024/6/3前)</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">原住民族與多元文化</p>
                      <p className="text-3xl font-bold text-brand-secondary">
                          {results.culturalOldCapped.toFixed(2)}
                          <span className="text-base font-medium text-gray-600 dark:text-gray-400"> / 2 點</span>
                      </p>
                  </div>
                  {/* New System Card */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                      <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">新制 (2024/6/3後)</h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">原住民 + 多元文化</p>
                      <p className="text-3xl font-bold text-brand-secondary">
                          {results.culturalNewTotal.toFixed(2)}
                          <span className="text-base font-medium text-gray-600 dark:text-gray-400"> 點</span>
                      </p>
                  </div>
              </div>
              <div className="!mt-4 p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-md flex items-start text-sm">
                  <InfoIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                      <span><span className="font-bold">重要提醒：</span>2024/6/3後，每年需完成原住民及多元文化課程<span className="font-bold">各1點</span>。</span>
                      <span className="block mt-1">此為逐年規定，本工具無法驗證，請務必自行確認。</span>
                  </div>
              </div>
            </div>
          </div>

        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">證書效期: <span className="font-medium">{results.expiryDate}</span></p>
        </div>
      </div>
    </>
  );
};