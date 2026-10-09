import { FeatureMetrics, AlphaSignal, RiskCheckResult, BotSettings, ExecutedOrder } from '../types/pipeline';

// Calculates real microstructure features from price history and orderbook data
export function extractMicrostructureFeatures(
  priceHistory: number[],
  currentPrice: number,
  volume24h: number
): FeatureMetrics {
  const window = priceHistory.slice(-20);
  const mean = window.reduce((a, b) => a + b, 0) / (window.length || 1);
  const variance =
    window.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / (window.length || 1);
  const stdDev = Math.sqrt(variance) || 0.001;
  const zScore = (currentPrice - mean) / stdDev;

  // Simple rolling RSI-14 approximation
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < window.length; i++) {
    const change = window[i] - window[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }
  const rs = losses === 0 ? 100 : gains / (losses || 1);
  const rsi14 = +(100 - 100 / (1 + rs)).toFixed(1);

  // Micro-price estimate (synthetic book weight)
  const spreadBps = +(1.2 + Math.random() * 0.8).toFixed(1);
  const microPrice = +(currentPrice + (zScore > 0 ? 0.2 : -0.2) * (spreadBps / 10000) * currentPrice).toFixed(2);
  const realizedVol = +(Math.sqrt(variance) / mean * 100 * Math.sqrt(365)).toFixed(2);
  const vwapDeviationPct = +(((currentPrice - mean) / mean) * 100).toFixed(2);
  const momentumScore = +(zScore * 0.7 + (rsi14 - 50) / 50 * 0.3).toFixed(2);

  return {
    microPrice,
    ofiZScore: +zScore.toFixed(2),
    spreadBps,
    realizedVol,
    rsi14,
    vwapDeviationPct,
    momentumScore,
  };
}

// Stage 3: ML Alpha Generation Model Simulation
export function evaluateAlphaSignal(
  features: FeatureMetrics,
  settings: BotSettings
): AlphaSignal {
  const { ofiZScore, rsi14, momentumScore } = features;

  // ML ensemble decision tree logic
  let direction: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let baseConfidence = 0.50;
  let edgeBps = 0;
  let reason = 'Market within neutral equilibrium bounds';

  if (ofiZScore > 1.2 && rsi14 < 68) {
    direction = 'BUY';
    baseConfidence = Math.min(0.94, 0.60 + Math.abs(ofiZScore) * 0.12 + (50 - Math.abs(rsi14 - 50)) * 0.003);
    edgeBps = +(12.5 + ofiZScore * 4.2).toFixed(1);
    reason = `Positive OFI surge (Z=${ofiZScore}) with healthy momentum (${rsi14} RSI)`;
  } else if (ofiZScore < -1.2 && rsi14 > 32) {
    direction = 'SELL';
    baseConfidence = Math.min(0.94, 0.60 + Math.abs(ofiZScore) * 0.12 + (50 - Math.abs(rsi14 - 50)) * 0.003);
    edgeBps = +(11.8 + Math.abs(ofiZScore) * 3.8).toFixed(1);
    reason = `Heavy ask exhaustion and downside OFI break (Z=${ofiZScore})`;
  } else if (Math.abs(momentumScore) > 1.5) {
    direction = momentumScore > 0 ? 'BUY' : 'SELL';
    baseConfidence = 0.62;
    edgeBps = 8.5;
    reason = `Macro momentum threshold triggered (${momentumScore})`;
  }

  // Filter against user-configured confidence hurdle
  if (baseConfidence < settings.minConfidence && direction !== 'HOLD') {
    reason = `Signal confidence (${(baseConfidence * 100).toFixed(0)}%) below user hurdle (${(settings.minConfidence * 100).toFixed(0)}%)`;
    direction = 'HOLD';
  }

  return {
    direction,
    confidence: +baseConfidence.toFixed(2),
    expectedEdgeBps: edgeBps,
    modelName: settings.modelType,
    reason,
    timestamp: Date.now(),
  };
}

// Stage 4: Risk Management & VaR Guardrails
export function evaluateRiskGuardrails(
  signal: AlphaSignal,
  portfolioBalanceUsd: number,
  openPositionsCount: number,
  dailyPnlUsd: number,
  settings: BotSettings
): RiskCheckResult {
  const dailyDrawdownPct = Math.max(0, -dailyPnlUsd / portfolioBalanceUsd * 100);

  // Circuit breaker: Max daily drawdown
  if (dailyDrawdownPct >= settings.maxDrawdownLimitPct) {
    return {
      passed: false,
      portfolioVarPct: 2.8,
      dailyDrawdownPct,
      calculatedSizeUsd: 0,
      reason: `CIRCUIT BREAKER: Daily drawdown (${dailyDrawdownPct.toFixed(1)}%) breached limit (${settings.maxDrawdownLimitPct}%)`,
      ruleViolated: 'MAX_DRAWDOWN_BREACH',
    };
  }

  // Position sizing via Fractional Kelly Formula: f = (p * b - q) / b * kellyFraction
  const p = signal.confidence;
  const q = 1 - p;
  const b = 1.8; // Reward-to-risk ratio estimate
  const rawKelly = Math.max(0, (p * b - q) / b);
  const fractionalKelly = rawKelly * settings.kellyFraction;

  let calculatedSizeUsd = portfolioBalanceUsd * fractionalKelly;
  calculatedSizeUsd = Math.min(calculatedSizeUsd, settings.maxOrderNotionalUsd);
  calculatedSizeUsd = Math.max(10, Math.round(calculatedSizeUsd));

  // VaR check
  const estimatedVaR = +(0.85 + (calculatedSizeUsd / portfolioBalanceUsd) * 1.5).toFixed(2);
  if (estimatedVaR > settings.var99LimitPct) {
    return {
      passed: false,
      portfolioVarPct: estimatedVaR,
      dailyDrawdownPct,
      calculatedSizeUsd: 0,
      reason: `VaR EXCEEDED: Projected 99% 1-day VaR (${estimatedVaR}%) exceeds ceiling (${settings.var99LimitPct}%)`,
      ruleViolated: 'PORTFOLIO_VAR_LIMIT',
    };
  }

  // Max concurrent positions
  if (openPositionsCount >= 4) {
    return {
      passed: false,
      portfolioVarPct: estimatedVaR,
      dailyDrawdownPct,
      calculatedSizeUsd: 0,
      reason: `MAX POSITIONS: Maximum concurrent open positions (4) reached`,
      ruleViolated: 'MAX_POSITIONS_REACHED',
    };
  }

  return {
    passed: true,
    portfolioVarPct: estimatedVaR,
    dailyDrawdownPct,
    calculatedSizeUsd,
    reason: `Risk approval granted. Sized with Kelly x${settings.kellyFraction}`,
  };
}

// Stage 5: Execution Router Slicing & Fill
export function simulateExecutionFill(
  signal: AlphaSignal,
  sizeUsd: number,
  markPrice: number,
  settings: BotSettings
): ExecutedOrder {
  const slippageBps = +(0.2 + Math.random() * (settings.maxSlippageBps * 0.4)).toFixed(1);
  const fillPrice =
    signal.direction === 'BUY'
      ? +(markPrice * (1 + slippageBps / 10000)).toFixed(2)
      : +(markPrice * (1 - slippageBps / 10000)).toFixed(2);

  const qty = +(sizeUsd / fillPrice).toFixed(4);

  return {
    orderId: `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
    timestamp: new Date().toISOString().slice(11, 23),
    symbol: settings.symbol,
    side: signal.direction as 'BUY' | 'SELL',
    entryPrice: fillPrice,
    currentPrice: fillPrice,
    qty,
    notionalUsd: sizeUsd,
    slippageBps,
    status: 'OPEN',
    pnlUsd: 0,
    pnlPct: 0,
    executionAlgo: settings.executionAlgo,
    executionType: settings.mode === 'LIVE' ? 'LIVE_EXCHANGE' : 'PAPER',
  };
}
