import AerobicThresholdChart, { type AerobicThresholdData } from "./AerobicThresholdChart";

const data: AerobicThresholdData[] = [
  {
    date: "2025-12-13",
    stravaURL: "",
    test: {
      pace: "8min/km",
      inclinePercent: 7.0,
      result: {
        totalTimeSeconds: 3240,
        firstHalfAvgHRbpm: 153.54,
        secondHalfAvgHRbpm: 162.34,
        rawDrift: 8.8,
        simpleDriftPercentage: 5.73,
      },
    },
    score: {
      value: 529,
      efficiencyFactor: 1.63,
      validityMultiplier: 0.93,
      workingHeartRate: 111.94,
    },
  },
  {
    date: "2026-01-23",
    stravaURL: "",
    test: {
      pace: "7:53min/km",
      inclinePercent: 7.0,
      result: {
        totalTimeSeconds: 3180,
        firstHalfAvgHRbpm: 149.63,
        secondHalfAvgHRbpm: 155.23,
        rawDrift: 5.59,
        simpleDriftPercentage: 3.74,
      },
    },
    score: {
      value: 600,
      efficiencyFactor: 1.71,
      validityMultiplier: 1.0,
      workingHeartRate: 106.43,
    },
  },
  {
    date: "2026-03-13",
    stravaURL: "",
    test: {
      pace: "7:41min/km",
      inclinePercent: 7.0,
      result: {
        totalTimeSeconds: 3180,
        firstHalfAvgHRbpm: 151.72,
        secondHalfAvgHRbpm: 157.95,
        rawDrift: 6.23,
        simpleDriftPercentage: 4.11,
      },
    },
    score: {
      value: 602,
      efficiencyFactor: 1.72,
      validityMultiplier: 1.0,
      workingHeartRate: 108.83,
    },
  },
];

const AerobicThreshold = () => {
  return <AerobicThresholdChart data={data} />;
};

export default AerobicThreshold;
