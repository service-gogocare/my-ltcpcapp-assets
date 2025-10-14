
export interface CoursePoints {
  physical: number;
  online: number;
}

export interface Points {
  professional: CoursePoints;
  quality: CoursePoints;
  ethics: CoursePoints;
  regulations: CoursePoints;
  fireSafety: number;
  emergencyResponse: number;
  infectionControl: number;
  genderSensitivity: number;
  culturalOld: number;
  culturalNew: {
    indigenous: number;
    multicultural: number;
  };
}

export interface CalculationResults {
  professionalSum: number;
  qualityEthicsRegulationsSum: number;
  cappedQualityEthicsRegulationsSum: number;
  isQualityEthicsRegulationsSumMet: boolean;
  coreCoursesSum: number;
  isCoreCoursesSumMet: boolean;

  areAllCoreCoursesTaken: boolean;
  culturalOldCapped: number;
  culturalNewTotal: number;
  totalPoints: number;
  isTotalPointsMet: boolean;
  expiryDate: string;
  onlineCap: number | null;
  totalOnlineSum: number;
  onlinePointsCounted: number;
}

export interface RecommendedCourse {
  id: number;
  name: string;
  url: string;
  category: 'PROFESSIONAL' | 'QER' | 'CORE' | 'CULTURAL_NEW';
}