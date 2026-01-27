import AerobicThresholdChart, { type AerobicThresholdData } from "./AerobicThresholdChart";

const data: AerobicThresholdData[] = [
  {
    date: "2025-12-13",
    stravaURL: "",
    test: {
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
];

const AerobicThreshold = () => {
  return <AerobicThresholdChart data={data} />;
};

export default AerobicThreshold;
