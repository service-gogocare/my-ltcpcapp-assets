import React, { useMemo } from 'react';
import { Points, CalculationResults } from '../types';

export const usePointCalculator = (points: Points): CalculationResults => {
  return useMemo(() => {
    // Section 1: Course Attribute Points
    const professionalPhysical = points.professional.physical || 0;
    const professionalOnline = points.professional.online || 0;
    const qerPhysical = (points.quality.physical || 0) + (points.ethics.physical || 0) + (points.regulations.physical || 0);
    const qerOnline = (points.quality.online || 0) + (points.ethics.online || 0) + (points.regulations.online || 0);
    
    // Total raw online points from user input for display
    const totalOnlineSum = professionalOnline + qerOnline;

    // Sum for Quality/Ethics/Regulations check (>= 24)
    const qualityEthicsRegulationsSum = qerPhysical + qerOnline;
    const isQualityEthicsRegulationsSumMet = qualityEthicsRegulationsSum >= 24;

    // Apply QER 36-point cap, removing from online points first to maximize score
    const qerOverflow = Math.max(0, qualityEthicsRegulationsSum - 36);
    const qerOnlineContribution = Math.max(0, qerOnline - qerOverflow);
    const qerPhysicalContribution = Math.max(0, qerPhysical - Math.max(0, qerOverflow - qerOnline));
    const cappedQualityEthicsRegulationsSum = qerOnlineContribution + qerPhysicalContribution;
    
    // Calculate total points before applying the global online cap
    const professionalSum = professionalPhysical + professionalOnline;
    const totalPointsBeforeOnlineCap = professionalSum + cappedQualityEthicsRegulationsSum;
    
    // Total online points that are currently contributing to the score
    const totalOnlineContribution = professionalOnline + qerOnlineContribution;

    // Determine Online Cap and Expiry Date. Default to latest rule (40 points cap).
    const onlineCap: number = 40;
    const expiryDate = '請依您的證書為準';

    // Apply the global online cap
    const onlinePointsCounted = onlineCap !== null ? Math.min(totalOnlineContribution, onlineCap) : totalOnlineContribution;
    const onlineOverflow = totalOnlineContribution - onlinePointsCounted;

    // Final Total Points
    const totalPoints = totalPointsBeforeOnlineCap - onlineOverflow;
    const isTotalPointsMet = totalPoints >= 120;

    // Section 2: Core Courses
    const coreCoursesSum = points.fireSafety + points.emergencyResponse + points.infectionControl + points.genderSensitivity;
    const isCoreCoursesSumMet = coreCoursesSum >= 10;
    const areAllCoreCoursesTaken =
      points.fireSafety >= 1 &&
      points.emergencyResponse >= 1 &&
      points.infectionControl >= 1 &&
      points.genderSensitivity >= 1;

    // Section 3: Cultural Sensitivity
    const culturalOldCapped = Math.min(points.culturalOld, 2);
    const culturalNewTotal = (points.culturalNew.indigenous || 0) + (points.culturalNew.multicultural || 0);

    return {
      professionalSum,
      qualityEthicsRegulationsSum,
      cappedQualityEthicsRegulationsSum,
      isQualityEthicsRegulationsSumMet,
      coreCoursesSum,
      isCoreCoursesSumMet,
      areAllCoreCoursesTaken,
      culturalOldCapped,
      culturalNewTotal,
      totalPoints,
      isTotalPointsMet,
      expiryDate,
      onlineCap,
      totalOnlineSum,
      onlinePointsCounted,
    };
  }, [points]);
};