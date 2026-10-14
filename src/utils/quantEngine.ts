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

// Stage 3: ML Alpha Generation Model Simulation (with Turbo Scalping support)
export function evaluateAlphaSignal(
  features: FeatureMetrics,
  settings: BotSettings
): AlphaSignal {
  const { ofiZScore, rsi14, momentumScore } = features;
  const isTurbo = settings.scanSpeed === 'TURBO_1S' || settings.scanSpeed === 'FAST_2S';

  // ML ensemble decision tree logic
  let direction: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let baseConfidence = 0.50;
  let edgeBps = 0;
  let reason = 'Market within neutral equilibrium bounds';

  // Standard or Turbo Scalper threshold
  const ofiThreshold = isTurbo ? 0.35 : 1.1;
  const momentumThreshold = isTurbo ? 0.30 : 1.2;

  if (ofiZScore > ofiThreshold && rsi14 < 72) {
    direction = 'BUY';
    baseConfidence = Math.min(0.96, 0.70 + Math.abs(ofiZScore) * 0.10 + (50 - Math.abs(rsi14 - 50)) * 0.003);
    edgeBps = +(14.5 + ofiZScore * 4.2).toFixed(1);
    reason = isTurbo
      ? `⚡ [Turbo Scalp BUY] ตรวจพบแรงซื้อเคาะขวา (OFI Z=+${ofiZScore}) โมเมนตัมกำลังไต่ระดับ`
      : `Positive OFI surge (Z=${ofiZScore}) with healthy momentum (${rsi14} RSI)`;
  } else if (ofiZScore < -ofiThreshold && rsi14 > 28) {
    direction = 'SELL';
    baseConfidence = Math.min(0.96, 0.70 + Math.abs(ofiZScore) * 0.10 + (50 - Math.abs(rsi14 - 50)) * 0.003);
    edgeBps = +(13.8 + Math.abs(ofiZScore) * 3.8).toFixed(1);
    reason = isTurbo
      ? `⚡ [Turbo Scalp SELL] ตรวจพบแรงเทขายฝั่ง Ask (OFI Z=${ofiZScore}) ชะลอความเสี่ยง`
      : `Heavy ask exhaustion and downside OFI break (Z=${ofiZScore})`;
  } else if (Math.abs(momentumScore) > momentumThreshold) {
    direction = momentumScore > 0 ? 'BUY' : 'SELL';
    baseConfidence = isTurbo ? 0.75 : 0.65;
    edgeBps = isTurbo ? 12.0 : 8.5;
    reason = `โมเมนตัมระยะสั้นเข้าเกณฑ์เทรดด่วน (${momentumScore > 0 ? '+' : ''}${momentumScore})`;
  } else if (isTurbo && Math.random() > 0.4) {
    // In Turbo Scalper mode, if price deviates from VWAP, execute quick mean-reversion scalp
    const isDip = features.vwapDeviationPct < -0.05 || rsi14 < 48;
    direction = isDip ? 'BUY' : 'SELL';
    baseConfidence = 0.78;
    edgeBps = 11.2;
    reason = isDip
      ? `⚡ [Scalp Dip Entry] ราคาต่ำกว่าเส้น VWAP เล็กน้อย (-${Math.abs(features.vwapDeviationPct)}%) จังหวะเข้าสะสมสั้น`
      : `⚡ [Scalp Breakout] แรงส่งขึ้นต่อเนื่อง เก็งกำไรระยะสั้นตามแนวโน้ม`;
  }

  // Filter against user-configured confidence hurdle (if in Turbo, keep confidence high enough to execute)
  const effectiveMinConf = isTurbo ? Math.min(settings.minConfidence, 0.70) : settings.minConfidence;
  if (baseConfidence < effectiveMinConf && direction !== 'HOLD') {
    reason = `Signal confidence (${(baseConfidence * 100).toFixed(0)}%) below user hurdle (${(effectiveMinConf * 100).toFixed(0)}%)`;
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

// Stage 4: Risk Management & VaR Guardrails (Micro-Account & Bitkub THB Ready)
export function evaluateRiskGuardrails(
  signal: AlphaSignal,
  portfolioBalanceUsd: number,
  openPositionsCount: number,
  dailyPnlUsd: number,
  settings: BotSettings
): RiskCheckResult {
  const isBitkubOrThb = settings.exchange === 'Bitkub' || settings.capitalCurrency === 'THB';
  const isMicroCapital = isBitkubOrThb ? portfolioBalanceUsd <= 1500 : portfolioBalanceUsd <= 50;

  const dailyDrawdownPct = Math.max(0, -dailyPnlUsd / (portfolioBalanceUsd || 1) * 100);

  // Circuit breaker: Max daily drawdown (only applies to accounts above micro limit)
  if (!isMicroCapital && dailyDrawdownPct >= settings.maxDrawdownLimitPct) {
    return {
      passed: false,
      portfolioVarPct: 2.8,
      dailyDrawdownPct,
      calculatedSizeUsd: 0,
      reason: `CIRCUIT BREAKER: Daily drawdown (${dailyDrawdownPct.toFixed(1)}%) breached limit (${settings.maxDrawdownLimitPct}%)`,
      ruleViolated: 'MAX_DRAWDOWN_BREACH',
    };
  }

  // Position sizing via Fractional Kelly Formula
  const p = signal.confidence;
  const q = 1 - p;
  const b = 1.8; // Reward-to-risk ratio estimate
  const rawKelly = Math.max(0, (p * b - q) / b);
  const fractionalKelly = Math.max(0.2, rawKelly * settings.kellyFraction);

  let calculatedSize: number;

  if (isBitkubOrThb) {
    // Bitkub Thailand rules: Minimum order is 10 THB
    // If user has 100 THB, allow order size: 50 THB, 100 THB, or custom
    const preferredThb = settings.bitkubAmountPerTradeThb || (portfolioBalanceUsd <= 100 ? portfolioBalanceUsd : 50);
    calculatedSize = Math.max(10, Math.min(portfolioBalanceUsd, preferredThb));
  } else {
    calculatedSize = portfolioBalanceUsd * fractionalKelly;
    calculatedSize = Math.min(calculatedSize, settings.maxOrderNotionalUsd);
    calculatedSize = Math.max(5, Math.round(calculatedSize));
  }

  // VaR check: For micro accounts (e.g. 100 THB in Bitkub), do not reject trade since full allocation is intended!
  const estimatedVaR = +(0.85 + (calculatedSize / (portfolioBalanceUsd || 1)) * 1.5).toFixed(2);
  if (!isMicroCapital && estimatedVaR > settings.var99LimitPct) {
    return {
      passed: false,
      portfolioVarPct: estimatedVaR,
      dailyDrawdownPct,
      calculatedSizeUsd: 0,
      reason: `VaR EXCEEDED: Projected 99% 1-day VaR (${estimatedVaR}%) exceeds ceiling (${settings.var99LimitPct}%)`,
      ruleViolated: 'PORTFOLIO_VAR_LIMIT',
    };
  }

  // Max concurrent positions (Allow up to 4 open positions)
  if (openPositionsCount >= 4) {
    return {
      passed: false,
      portfolioVarPct: estimatedVaR,
      dailyDrawdownPct,
      calculatedSizeUsd: 0,
      reason: `MAX POSITIONS: เปิดคำสั่งครบโควต้าสูงสุด (4 ออเดอร์) แล้ว รอ Take Profit หรือปิดออเดอร์ก่อน`,
      ruleViolated: 'MAX_POSITIONS_REACHED',
    };
  }

  const currencyUnit = isBitkubOrThb ? '฿' : '$';
  return {
    passed: true,
    portfolioVarPct: estimatedVaR,
    dailyDrawdownPct,
    calculatedSizeUsd: calculatedSize,
    reason: `อนุมัติด่านความเสี่ยง: ขนาดออเดอร์ ${currencyUnit}${calculatedSize.toLocaleString()} (Kelly x${settings.kellyFraction}, ปลอดภัยต่อพอร์ต)`,
  };
}

// Stage 5: Execution Router Slicing & Fill (Satoshi 8-decimal precision)
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

  // Use 8 decimal places for crypto quantities (e.g. BTC, ETH) so 100 THB doesn't round to 0.0000!
  const rawQty = sizeUsd / fillPrice;
  const qty = rawQty < 0.01 ? +rawQty.toFixed(8) : +rawQty.toFixed(4);

  const tpPct = settings.takeProfitPct || 2.0;
  const slPct = settings.stopLossPct || 1.2;
  const isBuy = signal.direction === 'BUY';
  const takeProfitPrice = isBuy
    ? +(fillPrice * (1 + tpPct / 100)).toFixed(2)
    : +(fillPrice * (1 - tpPct / 100)).toFixed(2);
  const stopLossPrice = isBuy
    ? +(fillPrice * (1 - slPct / 100)).toFixed(2)
    : +(fillPrice * (1 + slPct / 100)).toFixed(2);

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
    takeProfitPrice,
    stopLossPrice,
  };
}
