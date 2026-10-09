export interface StageConfig {
  id: number;
  name: string;
  subtitle: string;
  tech: string;
  role: string;
  thaiRole: string;
  purpose: string;
  thaiPurpose: string;
  // Specific live metrics
  latencyMs: number;
  processedCount: number;
}

export interface LiveMarketTick {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume24h: number;
  priceChange24h: number;
  timestamp: number;
  isRealWs: boolean;
}

export interface FeatureMetrics {
  microPrice: number;
  ofiZScore: number;
  spreadBps: number;
  realizedVol: number;
  rsi14: number;
  vwapDeviationPct: number;
  momentumScore: number;
}

export interface AlphaSignal {
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  expectedEdgeBps: number;
  modelName: string;
  reason: string;
  timestamp: number;
}

export interface RiskCheckResult {
  passed: boolean;
  portfolioVarPct: number;
  dailyDrawdownPct: number;
  calculatedSizeUsd: number;
  reason: string;
  ruleViolated?: string;
}

export interface ExecutedOrder {
  orderId: string;
  timestamp: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  qty: number;
  notionalUsd: number;
  slippageBps: number;
  status: 'OPEN' | 'FILLED' | 'CLOSED';
  pnlUsd: number;
  pnlPct: number;
  executionAlgo: string;
  executionType: 'PAPER' | 'LIVE_EXCHANGE';
}

export interface PipelineAuditLog {
  id: string;
  timestamp: string;
  stageId: number;
  stageName: string;
  level: 'INFO' | 'SIGNAL' | 'WARN' | 'EXEC' | 'ALERT';
  message: string;
  payload?: any;
}

export interface BotSettings {
  mode: 'PAPER' | 'LIVE';
  apiKey: string;
  apiSecret: string;
  exchange: 'Binance' | 'Bybit' | 'OKX';
  symbol: string;
  // Strategy settings
  minConfidence: number; // 0.5 - 0.95
  modelType: 'XGBoost + Transformer' | 'DeepLOB Orderbook' | 'Statistical Arbitrage';
  // Risk settings
  maxDrawdownLimitPct: number; // e.g. 3.0%
  var99LimitPct: number; // e.g. 2.0%
  kellyFraction: number; // 0.1 - 0.5
  maxOrderNotionalUsd: number;
  stopLossPct: number;
  takeProfitPct: number;
  // Execution settings
  executionAlgo: 'TWAP Micro-Slices' | 'VWAP Post-Only Maker' | 'IOC Direct Fill';
  maxSlippageBps: number;
  // Alerts
  discordWebhookUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
  alertOnExecution: boolean;
  alertOnRiskReject: boolean;
}

export const DEFAULT_STAGES: StageConfig[] = [
  {
    id: 1,
    name: 'Exchange API',
    subtitle: 'WebSocket / FIX',
    tech: 'Binance Public WSS / FIX 4.4',
    role: 'Low-Latency Market Ingestion',
    thaiRole: 'รับข้อมูลตลาดสดความเร็วสูง (Market Ingestion)',
    purpose: 'Maintains zero-drop streaming connections to Binance Spot & Perps Level 2 orderbook and trade ticks.',
    thaiPurpose: 'เชื่อมต่อ WebSocket ตรงกับกระดานเทรด รับข้อมูล Orderbook Depth, Ticker และ Trades สดแบบมิลลิวินาที',
    latencyMs: 1.4,
    processedCount: 0,
  },
  {
    id: 2,
    name: 'Data Preprocessing',
    subtitle: 'Features & Cleansing',
    tech: 'Rust Microstructure Core / Polars',
    role: 'Real-time Normalization & OFI Extraction',
    thaiRole: 'ประมวลผลข้อมูลและสกัดฟีเจอร์ (Feature Engineering)',
    purpose: 'Cleans outliers, aligns tick timestamps, and continuously computes Order Flow Imbalance (OFI), RSI, VWAP deviation.',
    thaiPurpose: 'คำนวณ Z-Score, Order Flow Imbalance (OFI), RSI, ความผันผวน และ Micro-price แบบเรียลไทม์เพื่อส่งต่อให้ AI',
    latencyMs: 0.8,
    processedCount: 0,
  },
  {
    id: 3,
    name: 'AI Strategy Engine',
    subtitle: 'ML Alpha Generation',
    tech: 'PyTorch / XGBoost Ensemble',
    role: 'Predictive Intelligence',
    thaiRole: 'ระบบปัญญาประดิษฐ์สร้างสัญญาณเทรด (Alpha Engine)',
    purpose: 'Evaluates multi-factor market features against ML models to output probability-weighted Alpha trade signals (Buy/Sell/Hold).',
    thaiPurpose: 'วิเคราะห์เวกเตอร์ข้อมูลตลาดผ่านโมเดล Machine Learning เพื่อคาดคะเนทิศทางราคาและปล่อยสัญญาณ Buy / Sell / Hold พร้อมค่าความน่าจะเป็น',
    latencyMs: 2.8,
    processedCount: 0,
  },
  {
    id: 4,
    name: 'Risk Management',
    subtitle: 'VaR & Drawdown Limits',
    tech: 'Rust Risk Engine / Kelly Sizing',
    role: 'Capital Preservation & Exposure Control',
    purpose: 'Enforces hard circuit breakers: Daily Max Drawdown, Parametric VaR (99%), Net Exposure limits, and dynamic Kelly position sizing.',
    thaiRole: 'ระบบควบคุมความเสี่ยงและจำกัดการขาดทุน (Risk Guardrails)',
    thaiPurpose: 'ตรวจสอบและสกัดกั้นคำสั่งหากเสี่ยงเกินเกณฑ์ คุม Max Drawdown, คำนวณ VaR และปรับขนาดสัญญาด้วยสมการ Fractional Kelly',
    latencyMs: 0.3,
    processedCount: 0,
  },
  {
    id: 5,
    name: 'Order Execution',
    subtitle: 'SOR & TWAP/VWAP',
    tech: 'Smart Order Router / C++20 Core',
    role: 'Optimal Liquidity Slicing & Fill Execution',
    purpose: 'Partitions approved parent orders into child limit slices (VWAP/TWAP) to capture maker rebates and prevent adverse slippage.',
    thaiRole: 'ระบบส่งคำสั่งซื้อขายอัจฉริยะ (Smart Order Router)',
    thaiPurpose: 'ซอยคำสั่งใหญ่เป็นคำสั่งย่อยด้วยอัลกอริทึม TWAP/VWAP เพื่อลด Slippage และประหยัดค่าธรรมเนียม Maker',
    latencyMs: 1.9,
    processedCount: 0,
  },
  {
    id: 6,
    name: 'Notifications',
    subtitle: 'Webhooks & Alerts',
    tech: 'Webhook Dispatcher / Audit Ledger',
    role: 'Audit Trail & Telemetry Dispatch',
    purpose: 'Dispatches signed cryptographic execution receipts to Discord/Telegram webhooks and records all state transitions in audit log.',
    thaiRole: 'ระบบแจ้งเตือนและบันทึกประวัติ (Audit & Dispatch)',
    thaiPurpose: 'ส่งแจ้งเตือนการแมตช์ออเดอร์, กำไรขาดทุน (PnL), หรือเตือนสติความเสี่ยงไปยัง Discord/Telegram ทันที',
    latencyMs: 11.2,
    processedCount: 0,
  },
];
