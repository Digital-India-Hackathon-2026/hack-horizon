/**
 * AI Wait Time Predictor
 * Uses a weighted-average heuristic with historical throughput data
 * to estimate wait time for a farmer in the queue.
 */

function predictWaitTime(queuePosition, avgProcessingMinutes, activeCounters, timeOfDay) {
  if (queuePosition <= 0) {
    return { estimatedMinutes: 0, confidenceLow: 0, confidenceHigh: 0, confidence: 'high' };
  }

  // Base calculation: people ahead × avg time per person / parallel counters
  const baseWait = (queuePosition * avgProcessingMinutes) / Math.max(activeCounters, 1);

  // Time-of-day factor: mornings are faster (farmers arrive early), midday slows down
  let timeOfDayFactor = 1.0;
  const hour = typeof timeOfDay === 'number' ? timeOfDay : new Date().getHours();
  
  if (hour >= 6 && hour < 9) {
    timeOfDayFactor = 0.85;  // Early morning: faster processing
  } else if (hour >= 9 && hour < 12) {
    timeOfDayFactor = 1.0;   // Peak morning: normal
  } else if (hour >= 12 && hour < 14) {
    timeOfDayFactor = 1.3;   // Midday: lunch breaks, slower
  } else if (hour >= 14 && hour < 17) {
    timeOfDayFactor = 1.1;   // Afternoon: slightly slower
  } else {
    timeOfDayFactor = 0.9;   // Late: fewer people, faster
  }

  // Queue depth factor: longer queues tend to slow down slightly
  let queueDepthFactor = 1.0;
  if (queuePosition > 20) {
    queueDepthFactor = 1.15;
  } else if (queuePosition > 10) {
    queueDepthFactor = 1.08;
  }

  const adjustedWait = baseWait * timeOfDayFactor * queueDepthFactor;

  // Confidence range: ±20% for small queues, ±30% for larger ones
  const confidencePercent = queuePosition > 15 ? 0.30 : 0.20;
  const confidenceLow = Math.max(0, Math.round(adjustedWait * (1 - confidencePercent)));
  const confidenceHigh = Math.round(adjustedWait * (1 + confidencePercent));
  const estimatedMinutes = Math.round(adjustedWait);

  let confidence = 'high';
  if (queuePosition > 20) confidence = 'low';
  else if (queuePosition > 10) confidence = 'medium';

  return {
    estimatedMinutes,
    confidenceLow,
    confidenceHigh,
    confidence,
    factors: {
      baseWait: Math.round(baseWait),
      timeOfDayFactor,
      queueDepthFactor,
      activeCounters,
      avgProcessingMinutes
    }
  };
}

module.exports = { predictWaitTime };
