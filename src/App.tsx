import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StageConfig,
  LiveMarketTick,
  FeatureMetrics,
  AlphaSignal,
  RiskCheckResult,
  ExecutedOrder,
  PipelineAuditLog,
  BotSettings,
  DEFAULT_STAGES,
} from './types/pipeline';
import {
  extractMicrostructureFeatures,
  evaluateAlphaSignal,
  evaluateRiskGuardrails,
  simulateExecutionFill,
} from './utils/quantEngine';
import { PipelineDiagramView } from './components/PipelineDiagramView';
import { StageDetailPanel } from './components/StageDetailPanel';
import { LiveExecutionEngine } from './components/LiveExecutionEngine';
import { QuickStartGuide } from './components/QuickStartGuide';
import { ParameterGuideAccordion } from './components/ParameterGuideAccordion';
import { AutoConfigQuizModal } from './components/AutoConfigQuizModal';
import { FullAppGuideModal } from './components/FullAppGuideModal';
import { HowItWorksExplainer } from './components/HowItWorksExplainer';
import { CoinWatchlistManager } from './components/CoinWatchlistManager';
import { CoinRecommendationRadar } from './components/CoinRecommendationRadar';
import { CrossDeviceSyncModal } from './components/CrossDeviceSyncModal';
import { LiveTradingBotChart } from './components/LiveTradingBotChart';
import { BotLiveStatusCockpit } from './components/BotLiveStatusCockpit';
import { Wifi, WifiOff, HelpCircle, Share2, Smartphone, Play, Pause, Activity } from 'lucide-react';

const DEFAULT_BOT_SETTINGS: BotSettings = {
  mode: 'PAPER',
  apiKey: '',
  apiSecret: '',
  exchange: 'Bitkub',
  symbol: 'THB_BTC',
  favoriteSymbols: ['THB_BTC', 'THB_ETH', 'THB_SOL', 'BTCUSDT', 'SOLUSDT', 'THB_DOGE'],
  initialCapitalUsd: 1000,
  capitalCurrency: 'THB',
  minConfidence: 0.70,
  modelType: 'XGBoost + Transformer',
  maxDrawdownLimitPct: 3.0,
  var99LimitPct: 2.0,
  kellyFraction: 0.25,
  maxOrderNotionalUsd: 1500,
  stopLossPct: 1.5,
  takeProfitPct: 3.0,
  executionAlgo: 'VWAP Post-Only Maker',
  maxSlippageBps: 3.5,
  alertChannel: 'DISCORD',
  discordWebhookUrl: '',
  telegramBotToken: '',
  telegramChatId: '',
  lineNotifyToken: '',
  customWebhookUrl: '',
  alertOnExecution: true,
  alertOnRiskReject: true,
};

export default function App() {
  const [stages, setStages] = useState<StageConfig[]>(DEFAULT_STAGES);
  const [selectedStageId, setSelectedStageId] = useState<number>(3); // Default Stage 3 (AI Strategy Engine)
  const [language, setLanguage] = useState<'TH' | 'EN'>('TH');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [activePulseStageId, setActivePulseStageId] = useState<number | null>(3);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(false);
  const [isFullGuideOpen, setIsFullGuideOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [quizProfileApplied, setQuizProfileApplied] = useState<string | null>(null);
  const [scanCountdown, setScanCountdown] = useState<number>(4);
  const [totalScansCount, setTotalScansCount] = useState<number>(0);

  // Bot Configuration Settings with LocalStorage Persistence
  const [settings, setSettings] = useState<BotSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('quantflow_bot_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_BOT_SETTINGS,
            ...parsed,
            favoriteSymbols:
              Array.isArray(parsed.favoriteSymbols) && parsed.favoriteSymbols.length > 0
                ? parsed.favoriteSymbols
                : DEFAULT_BOT_SETTINGS.favoriteSymbols,
          };
        }
      } catch {
        // Fallback
      }
    }
    return DEFAULT_BOT_SETTINGS;
  });

  // Automatically persist settings and starred coins to LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('quantflow_bot_settings', JSON.stringify(settings));
      } catch {
        // Fallback
      }
    }
  }, [settings]);

  // Check URL Hash for Cross-Device Sync on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#sync=')) {
      try {
        const code = window.location.hash.replace('#sync=', '');
        const decoded = decodeURIComponent(escape(atob(code)));
        const parsed = JSON.parse(decoded);
        if (parsed && Array.isArray(parsed.fav)) {
          setSettings((prev) => ({
            ...prev,
            favoriteSymbols: parsed.fav || prev.favoriteSymbols,
            symbol: parsed.sym || prev.symbol,
            exchange: parsed.exc || prev.exchange,
            initialCapitalUsd: parsed.cap || prev.initialCapitalUsd,
            capitalCurrency: parsed.cur || prev.capitalCurrency,
            modelType: parsed.mod || prev.modelType,
            minConfidence: parsed.con !== undefined ? parsed.con : prev.minConfidence,
            maxDrawdownLimitPct: parsed.dd !== undefined ? parsed.dd : prev.maxDrawdownLimitPct,
            kellyFraction: parsed.kel !== undefined ? parsed.kel : prev.kellyFraction,
            executionAlgo: parsed.alg || prev.executionAlgo,
          }));
          setQuizProfileApplied('ซิงค์ข้อมูลโปรไฟล์และเหรียญที่ติดดาวจากลิงก์สำเร็จ!');
          setTimeout(() => setQuizProfileApplied(null), 5000);
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch {
        // Fallback
      }
    }
  }, []);

  // Quant states
  const [currentTick, setCurrentTick] = useState<LiveMarketTick | null>({
    symbol: 'BTCUSDT',
    price: 91420.5,
    bid: 91420.0,
    ask: 91421.0,
    volume24h: 34120.5,
    priceChange24h: 2.45,
    timestamp: Date.now(),
    isRealWs: false,
  });

  const priceHistoryRef = useRef<number[]>([
    91380, 91395, 91410, 91405, 91422, 91418, 91430, 91425, 91440, 91435, 91420,
  ]);

  const [features, setFeatures] = useState<FeatureMetrics>({
    microPrice: 91420.8,
    ofiZScore: 1.45,
    spreadBps: 1.2,
    realizedVol: 42.5,
    rsi14: 58.4,
    vwapDeviationPct: 0.12,
    momentumScore: 1.15,
  });

  const [latestSignal, setLatestSignal] = useState<AlphaSignal | null>({
    direction: 'BUY',
    confidence: 0.78,
    expectedEdgeBps: 14.2,
    modelName: 'XGBoost + Transformer',
    reason: 'Positive OFI surge with healthy momentum',
    timestamp: Date.now(),
  });

  const [latestRiskResult, setLatestRiskResult] = useState<RiskCheckResult | null>({
    passed: true,
    portfolioVarPct: 1.25,
    dailyDrawdownPct: 0.45,
    calculatedSizeUsd: 650,
    reason: 'Risk approval granted. Sized with Kelly x0.25',
  });

  const [portfolioBalanceUsd, setPortfolioBalanceUsd] = useState<number>(10000.0);
  const [dailyPnlUsd, setDailyPnlUsd] = useState<number>(142.5);

  const [orders, setOrders] = useState<ExecutedOrder[]>([
    {
      orderId: 'ORD-INIT-891',
      timestamp: new Date(Date.now() - 120000).toISOString().slice(11, 23),
      symbol: 'BTCUSDT',
      side: 'BUY',
      entryPrice: 91280.0,
      currentPrice: 91420.5,
      qty: 0.008,
      notionalUsd: 730,
      slippageBps: 0.8,
      status: 'OPEN',
      pnlUsd: 1.12,
      pnlPct: 0.15,
      executionAlgo: 'VWAP Post-Only Maker',
      executionType: 'PAPER',
      takeProfitPrice: 94018.4,
      stopLossPrice: 89910.8,
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<PipelineAuditLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toISOString().slice(11, 23),
      stageId: 1,
      stageName: 'Exchange API',
      level: 'INFO',
      message: 'Binance public trade stream ingested (Mark: $91,420.50)',
    },
    {
      id: 'log-2',
      timestamp: new Date().toISOString().slice(11, 23),
      stageId: 2,
      stageName: 'Data Preprocessing',
      level: 'INFO',
      message: 'Rolling features normalized: OFI Z-Score = +1.45σ, RSI = 58.4',
    },
    {
      id: 'log-3',
      timestamp: new Date().toISOString().slice(11, 23),
      stageId: 3,
      stageName: 'AI Strategy Engine',
      level: 'SIGNAL',
      message: 'Alpha model emitted BUY (P=78% >= hurdle 65%)',
    },
    {
      id: 'log-4',
      timestamp: new Date().toISOString().slice(11, 23),
      stageId: 4,
      stageName: 'Risk Management',
      level: 'INFO',
      message: 'Pre-trade VaR pass (1.25% <= 2.0%). Position sized to $650 via Kelly',
    },
    {
      id: 'log-5',
      timestamp: new Date().toISOString().slice(11, 23),
      stageId: 5,
      stageName: 'Order Execution',
      level: 'EXEC',
      message: 'Filled BUY 0.008 BTC via VWAP Post-Only Maker (Slippage: 0.8 bps)',
    },
  ]);

  // Connect to real Binance WebSocket stream
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    // Map local pairs like THB_BTC to standard global Binance feed 'btcusdt'
    let binanceStream = 'btcusdt';
    const sym = settings.symbol.toLowerCase();
    if (sym.includes('eth')) binanceStream = 'ethusdt';
    else if (sym.includes('sol')) binanceStream = 'solusdt';
    else binanceStream = 'btcusdt';

    const wsUrl = `wss://stream.binance.com:9443/ws/${binanceStream}@trade`;

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.p) {
            const price = parseFloat(data.p);
            // If trading in THB on Bitkub, convert approx USDT price to THB (~36.5 THB/USD)
            const displayPrice = settings.exchange === 'Bitkub' ? +(price * 36.5).toFixed(0) : price;
            handleNewMarketPrice(displayPrice, true);
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onerror = () => {
        setWsConnected(false);
      };

      ws.onclose = () => {
        setWsConnected(false);
      };
    } catch {
      setWsConnected(false);
    }

    // High quality synthetic ticker fallback in case sandbox environment restricts external WebSockets
    fallbackInterval = setInterval(() => {
      if (!wsConnected && isRunning) {
        const last = priceHistoryRef.current[priceHistoryRef.current.length - 1] || (settings.exchange === 'Bitkub' ? 3350000 : 91400);
        const drift = (Math.random() - 0.492) * (last * 0.0008);
        handleNewMarketPrice(+(last + drift).toFixed(2), false);
      }
    }, 2200);

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [settings.symbol, settings.exchange, isRunning]);

  // Update open positions PnL whenever market price moves
  const handleNewMarketPrice = (price: number, isRealWs: boolean) => {
    priceHistoryRef.current.push(price);
    if (priceHistoryRef.current.length > 50) {
      priceHistoryRef.current.shift();
    }

    setCurrentTick({
      symbol: settings.symbol,
      price,
      bid: +(price * 0.9999).toFixed(2),
      ask: +(price * 1.0001).toFixed(2),
      volume24h: 34150,
      priceChange24h: 2.15,
      timestamp: Date.now(),
      isRealWs,
    });

    // Update open positions real-time PnL and check auto TP/SL
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (o.status !== 'OPEN') return o;
        const delta = o.side === 'BUY' ? price - o.entryPrice : o.entryPrice - price;
        const pnlUsd = +(delta * o.qty).toFixed(2);
        const pnlPct = +((delta / o.entryPrice) * 100).toFixed(2);

        const isBuy = o.side === 'BUY';
        const hitTp = isBuy
          ? (o.takeProfitPrice !== undefined && price >= o.takeProfitPrice)
          : (o.takeProfitPrice !== undefined && price <= o.takeProfitPrice);
        const hitSl = isBuy
          ? (o.stopLossPrice !== undefined && price <= o.stopLossPrice)
          : (o.stopLossPrice !== undefined && price >= o.stopLossPrice);

        if (hitTp) {
          setDailyPnlUsd((d) => +(d + pnlUsd).toFixed(2));
          setPortfolioBalanceUsd((p) => +(p + pnlUsd).toFixed(2));
          setAuditLogs((prev) => [
            {
              id: `log-tp-${Date.now()}`,
              timestamp: new Date().toISOString().slice(11, 23),
              stageId: 5,
              stageName: 'Order Execution',
              level: 'EXEC',
              message: `🎯 AUTO TAKE PROFIT: แตะเป้ากำไร ${price} บอทส่งคำสั่งขายปิดออเดอร์ ${o.orderId} (+${pnlPct}%, กำไร +$${pnlUsd}) เรียบร้อย`,
            },
            ...prev.slice(0, 30),
          ]);
          return {
            ...o,
            currentPrice: price,
            pnlUsd,
            pnlPct,
            status: 'CLOSED',
            closeReason: 'TAKE_PROFIT',
            closedAtPrice: price,
          };
        }

        if (hitSl) {
          setDailyPnlUsd((d) => +(d + pnlUsd).toFixed(2));
          setPortfolioBalanceUsd((p) => +(p + pnlUsd).toFixed(2));
          setAuditLogs((prev) => [
            {
              id: `log-sl-${Date.now()}`,
              timestamp: new Date().toISOString().slice(11, 23),
              stageId: 4,
              stageName: 'Risk Management',
              level: 'WARN',
              message: `🛡️ AUTO STOP LOSS: แตะจุดคัทลอส ${price} บอทตัดขาดทุน ${o.orderId} (${pnlPct}%, -$${Math.abs(pnlUsd)}) รักษาเงินต้น`,
            },
            ...prev.slice(0, 30),
          ]);
          return {
            ...o,
            currentPrice: price,
            pnlUsd,
            pnlPct,
            status: 'CLOSED',
            closeReason: 'STOP_LOSS',
            closedAtPrice: price,
          };
        }

        return {
          ...o,
          currentPrice: price,
          pnlUsd,
          pnlPct,
        };
      })
    );
  };

  // Main End-to-End Pipeline Loop
  const executePipelineLoop = useCallback((forceGenerate: boolean = false) => {
    if (!currentTick) return;

    // Stage 1: Ingest tick
    setActivePulseStageId(1);
    const tickTime = new Date().toISOString().slice(11, 23);

    // Stage 2: Extract microstructure features
    const newFeatures = extractMicrostructureFeatures(
      priceHistoryRef.current,
      currentTick.price,
      currentTick.volume24h
    );
    setFeatures(newFeatures);

    setTimeout(() => {
      // Stage 3: Evaluate ML Alpha
      setActivePulseStageId(3);
      let signal = evaluateAlphaSignal(newFeatures, settings);

      // If user clicked manual trigger button, guarantee an active signal (BUY or SELL)
      if (forceGenerate && signal.direction === 'HOLD') {
        signal = {
          direction: Math.random() > 0.5 ? 'BUY' : 'SELL',
          confidence: Math.max(settings.minConfidence + 0.05, 0.78),
          expectedEdgeBps: 15.4,
          modelName: settings.modelType,
          reason: 'คำสั่งจำลองทดสอบผ่านระบบ Manual Injection (สร้างสัญญาณสำเร็จ)',
          timestamp: Date.now(),
        };
      }

      setLatestSignal(signal);

      if (signal.direction === 'HOLD') {
        setAuditLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            timestamp: tickTime,
            stageId: 3,
            stageName: 'AI Strategy Engine',
            level: 'INFO',
            message: `Market tick filtered: ${signal.reason}`,
          },
          ...prev.slice(0, 30),
        ]);
        return;
      }

      setAuditLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          timestamp: tickTime,
          stageId: 3,
          stageName: 'AI Strategy Engine',
          level: 'SIGNAL',
          message: `Alpha ${signal.direction} emitted (${(signal.confidence * 100).toFixed(0)}% conf). ${signal.reason}`,
        },
        ...prev.slice(0, 30),
      ]);

      setTimeout(() => {
        // Stage 4: Risk Management & VaR Gate
        setActivePulseStageId(4);
        const openPosCount = orders.filter((o) => o.status === 'OPEN').length;
        let riskResult = evaluateRiskGuardrails(
          signal,
          portfolioBalanceUsd,
          openPosCount,
          dailyPnlUsd,
          settings
        );

        // If forceGenerate is true, guarantee pass for testing demonstration
        if (forceGenerate && !riskResult.passed) {
          riskResult = {
            passed: true,
            portfolioVarPct: 1.15,
            dailyDrawdownPct: 0.2,
            calculatedSizeUsd: 500,
            reason: 'อนุมัติผ่านด่านความเสี่ยงพิเศษสำหรับการทดสอบระบบ (Force Test Approval)',
          };
        }

        setLatestRiskResult(riskResult);

        if (!riskResult.passed) {
          setAuditLogs((prev) => [
            {
              id: `log-${Date.now()}`,
              timestamp: tickTime,
              stageId: 4,
              stageName: 'Risk Management',
              level: 'WARN',
              message: `Risk Intercept: ${riskResult.reason}`,
            },
            ...prev.slice(0, 30),
          ]);
          return;
        }

        setTimeout(() => {
          // Stage 5: Execution Router
          setActivePulseStageId(5);
          const newOrder = simulateExecutionFill(
            signal,
            riskResult.calculatedSizeUsd || 500,
            currentTick.price,
            settings
          );
          setOrders((prev) => [newOrder, ...prev]);

          setAuditLogs((prev) => [
            {
              id: `log-${Date.now()}`,
              timestamp: tickTime,
              stageId: 5,
              stageName: 'Order Execution',
              level: 'EXEC',
              message: `Filled ${newOrder.side} ${newOrder.qty} ${newOrder.symbol} @ $${newOrder.entryPrice} (${newOrder.executionAlgo}, ${newOrder.slippageBps} bps slippage)`,
            },
            ...prev.slice(0, 30),
          ]);

          setTimeout(() => {
            // Stage 6: Telemetry & Webhook Alert
            setActivePulseStageId(6);
            setAuditLogs((prev) => [
              {
                id: `log-${Date.now()}`,
                timestamp: tickTime,
                stageId: 6,
                stageName: 'Notifications',
                level: 'ALERT',
                message: `Order receipt dispatched -> Audit ledger updated (ID: ${newOrder.orderId})`,
              },
              ...prev.slice(0, 30),
            ]);

            // Dispatch external Discord webhook if configured
            if (settings.discordWebhookUrl && settings.alertOnExecution) {
              try {
                const fetchFn = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch;
                fetchFn(settings.discordWebhookUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    content: `🚨 **Algo Trade Filled**: ${newOrder.side} ${newOrder.symbol} @ $${newOrder.entryPrice} | Sized: $${newOrder.notionalUsd} | P_Win: ${(signal.confidence * 100).toFixed(0)}%`,
                  }),
                }).catch(() => {});
              } catch {
                // Ignore webhook errors
              }
            }
          }, 400);
        }, 400);
      }, 400);
    }, 400);
  }, [currentTick, settings, portfolioBalanceUsd, dailyPnlUsd, orders]);

  // Keep latest executePipelineLoop reference without tearing down the timer on every tick
  const executePipelineLoopRef = useRef(executePipelineLoop);
  useEffect(() => {
    executePipelineLoopRef.current = executePipelineLoop;
  }, [executePipelineLoop]);

  // Automated recurring execution loop with 1-second live countdown
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setScanCountdown((prev) => {
        if (prev <= 1) {
          executePipelineLoopRef.current?.(false);
          setTotalScansCount((c) => c + 1);
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleClosePosition = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId !== orderId) return o;
        setDailyPnlUsd((d) => +(d + o.pnlUsd).toFixed(2));
        setPortfolioBalanceUsd((p) => +(p + o.pnlUsd).toFixed(2));
        setAuditLogs((prevLogs) => [
          {
            id: `log-manual-close-${Date.now()}`,
            timestamp: new Date().toISOString().slice(11, 23),
            stageId: 5,
            stageName: 'Order Execution',
            level: 'EXEC',
            message: `🚨 ผู้ใช้กดสั่งปิดออเดอร์ทันที (Manual Market Close) ไม้ ${o.orderId} ที่ราคา ${o.currentPrice} (PnL: ${o.pnlUsd >= 0 ? '+' : ''}$${o.pnlUsd})`,
          },
          ...prevLogs.slice(0, 30),
        ]);
        return {
          ...o,
          status: 'CLOSED',
          closeReason: 'MANUAL_APP',
          closedAtPrice: o.currentPrice,
        };
      })
    );
  };

  // UI/UX Optimization: Memoize handlers เพื่อป้องกัน unnecessary re-renders ของคอมโพเนนต์ลูก
  const handleResetDefaults = useCallback(() => {
    setSettings((prev) => ({
      ...DEFAULT_BOT_SETTINGS,
      favoriteSymbols: prev.favoriteSymbols.length > 0 ? prev.favoriteSymbols : DEFAULT_BOT_SETTINGS.favoriteSymbols,
    }));
    setQuizProfileApplied('รีเซ็ตเป็นค่าเริ่มต้นมาตรฐานเรียบร้อยแล้ว (Default Balanced)');
    setTimeout(() => setQuizProfileApplied(null), 4000);
  }, []);

  const handleApplyQuizProfile = useCallback((patch: Partial<BotSettings>, profileTitle: string, newBalance?: number) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    if (newBalance && newBalance > 0) {
      setPortfolioBalanceUsd(newBalance);
    }
    setQuizProfileApplied(`ใช้โปรไฟล์: ${profileTitle}`);
    setTimeout(() => setQuizProfileApplied(null), 5000);
  }, []);

  const handleToggleFavorite = useCallback((sym: string) => {
    setSettings((prev) => {
      const exists = prev.favoriteSymbols.includes(sym);
      const updated = exists
        ? prev.favoriteSymbols.filter((s) => s !== sym)
        : [...prev.favoriteSymbols, sym];
      return { ...prev, favoriteSymbols: updated };
    });
  }, []);

  const selectedStage = stages.find((s) => s.id === selectedStageId) || stages[2];

  return (
    <div className="relative min-h-screen bg-[#07080e] text-[#f4f4f5] flex flex-col selection:bg-purple-500/30 selection:text-white">
      {/* 
        🎨 UX/UI Atmospheric Ambient Glow (Dark Theme + Purple, Pink, Blue neo-accents)
        แสง Ambient ล่องหนเพื่อสร้างมิติ Depth ล้ำสมัย สบายตา ไม่แยงตา
      */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[180px] left-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute -top-[140px] right-1/4 w-[450px] h-[450px] bg-pink-600/8 rounded-full blur-[130px]" />
        <div className="absolute top-[35%] left-1/3 w-[600px] h-[400px] bg-blue-600/6 rounded-full blur-[160px]" />
      </div>

      {/* Top Bar Header - Modern Glassmorphism with subtle purple border */}
      <header className="relative z-30 flex items-center justify-between gap-6 px-5 lg:px-10 py-3.5 border-b border-[#1b1f33]/80 bg-[#07080e]/85 backdrop-blur-xl sticky top-0 transition-all shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        {/* Logo / Brand Name */}
        <a href="#top" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-blue-500 p-[1.5px] shadow-[0_0_15px_rgba(168,85,247,0.35)] transition-transform duration-200 group-hover:scale-105">
            <div className="w-full h-full bg-[#090b14] rounded-[10px] flex items-center justify-center font-black text-xs text-transparent bg-clip-text bg-gradient-to-tr from-purple-300 via-pink-300 to-blue-300">
              QF
            </div>
          </div>
          <span className="text-base font-bold tracking-tight text-[#f4f4f5] whitespace-nowrap group-hover:text-white transition-colors">
            QuantFlow <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 font-extrabold">Pipeline</span>
          </span>
        </a>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#9ca3af]">
          <a
            href="#live-chart"
            className="text-purple-300 hover:text-white transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 font-semibold px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-blue-500/15 border border-purple-500/30 hover:border-pink-500/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
          >
            <span>📈</span>
            <span>Live Chart &amp; Action</span>
          </a>
          <a href="#diagram" className="hover:text-purple-300 transition-colors whitespace-nowrap shrink-0">
            Pipeline Architecture
          </a>
          <a href="#inspector" className="hover:text-pink-300 transition-colors whitespace-nowrap shrink-0">
            Stage Inspector
          </a>
          <a href="#execution" className="hover:text-blue-300 transition-colors whitespace-nowrap shrink-0">
            Execution Engine
          </a>
        </nav>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Bot Live Operational Pill & Toggle */}
          <button
            type="button"
            onClick={() => setIsRunning((r) => !r)}
            className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-xs ${
              isRunning
                ? 'bg-purple-950/40 text-purple-200 border-purple-500/40 hover:border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:border-amber-400'
            }`}
            title={isRunning ? 'คลิกเพื่อหยุดบอทชั่วคราว' : 'คลิกเพื่อเริ่มการทำงานบอท'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-purple-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-bold">
              {isRunning ? `BOT RUNNING (${scanCountdown}s)` : 'BOT PAUSED'}
            </span>
          </button>

          {/* WebSocket Status Indicator - Clickable */}
          <button
            type="button"
            onClick={() => setIsFullGuideOpen(true)}
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-[#0f121d] border border-[#232840] hover:border-purple-500/50 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:scale-95 shadow-xs"
            title="คลิกเพื่ออ่านคำอธิบายไฟสถานะนี้"
          >
            {wsConnected ? (
              <span className="flex items-center gap-1.5 text-[#4ade80]">
                <span className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />
                <span className="hidden sm:inline font-semibold">Binance Live</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[#f59e0b]">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
                <span className="hidden sm:inline font-semibold">Synthetic Feed</span>
              </span>
            )}
            <span className="text-[10px] text-[#9ca3af] ml-0.5">ℹ️</span>
          </button>

          {/* Cross-Device Sync & Star Persistence Info Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-purple-300 hover:text-white bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/35 hover:border-purple-400 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(168,85,247,0.15)]"
            title="วิธีจำเหรียญดาว และซิงค์ข้ามมือถือ/iPad"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">📱 ซิงค์มือถือ/iPad</span>
          </button>

          {/* API Help & Explainer */}
          <button
            type="button"
            onClick={() => setIsFullGuideOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-pink-300 hover:text-white bg-pink-950/25 hover:bg-pink-900/35 border border-pink-500/30 hover:border-pink-400 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(236,72,153,0.12)]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">วิธีเอา API &amp; คำอธิบาย</span>
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLanguage((l) => (l === 'EN' ? 'TH' : 'EN'))}
            className="px-3 py-1.5 text-xs font-medium text-blue-200 bg-blue-950/30 hover:bg-blue-900/40 border border-blue-500/30 hover:border-blue-400 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95 cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.12)]"
          >
            {language === 'EN' ? '🇹🇭 ภาษาไทย' : '🌐 English'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="top" className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8 flex-1">
        {/* Hero Title & Subtitle with Modern Dark & Gradient Accents */}
        <div className="max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-blue-500/15 border border-purple-500/30 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
            <span>Quantitative Trading Engine &amp; Live Execution Console</span>
          </div>

          <h1 className="text-[32px] sm:text-[44px] font-bold tracking-tight text-[#f4f4f5] leading-[1.12]">
            Algorithmic Trading{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Bot Pipeline
            </span>
          </h1>
          <p className="text-[16px] sm:text-[19px] text-[#9ca3af] leading-[1.5] font-normal">
            {language === 'TH'
              ? 'สายพานข้อมูลควอนต์แบบครบวงจร ตั้งแต่รับราคาตลาดสด สกัดฟีเจอร์ AI คำนวณความเสี่ยง ส่งคำสั่งซื้อขายอัตโนมัติ และแจ้งเตือนเข้ามือถือ'
              : 'End-to-end quantitative pipeline from real-time tick ingestion to ML inference, risk bounds, auto-execution, and multi-channel alerts.'}
          </p>
        </div>

        {/* Beginner Onboarding & Quick Start Guide */}
        <QuickStartGuide
          language={language}
          onQuickSimulate={() => executePipelineLoop(true)}
          onJumpToStage={(stageId) => setSelectedStageId(stageId)}
        />

        {/* Prominent Explainer: How Does This Bot Work? (Fully Automated vs Mobile Alerts) */}
        <HowItWorksExplainer
          language={language}
          onOpenSettings={() => {
            const el = document.getElementById('execution');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Notification toast if quiz profile or reset applied */}
        {quizProfileApplied && (
          <div className="p-3.5 bg-gradient-to-r from-purple-950/60 via-pink-950/40 to-blue-950/60 border border-purple-500/50 text-purple-200 rounded-2xl text-xs flex items-center justify-between shadow-[0_0_20px_rgba(168,85,247,0.25)] animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="font-semibold flex items-center gap-2">
              <span className="text-pink-400">✓</span> {quizProfileApplied}
            </span>
            <span className="text-[11px] text-purple-300/80">ระบบปรับแต่งพารามิเตอร์ให้เรียบร้อยแล้ว</span>
          </div>
        )}

        {/* Parameter Explanation Guide with Show/Hide, Reset, and Quiz Trigger */}
        <ParameterGuideAccordion
          language={language}
          onOpenQuiz={() => setIsQuizOpen(true)}
          onResetDefaults={handleResetDefaults}
        />

        {/* Primary Bot Live Status & Cockpit Command Center */}
        <BotLiveStatusCockpit
          isRunning={isRunning}
          onToggleRun={() => setIsRunning((r) => !r)}
          onForceTestTrade={() => executePipelineLoop(true)}
          onClosePosition={handleClosePosition}
          orders={orders}
          settings={settings}
          currentTick={currentTick}
          latestSignal={latestSignal}
          latestRiskResult={latestRiskResult}
          scanCountdown={scanCountdown}
          totalScansCount={totalScansCount}
          language={language}
          onOpenGuide={() => setIsFullGuideOpen(true)}
        />

        {/* Smart Coin Recommendation Radar: Daily, Monthly, Yearly, All-Time Horizons */}
        <CoinRecommendationRadar
          currentSymbol={settings.symbol}
          favoriteSymbols={settings.favoriteSymbols}
          onSelectSymbol={(sym) => setSettings((prev) => ({ ...prev, symbol: sym }))}
          onToggleFavorite={handleToggleFavorite}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          language={language}
        />

        {/* Enhanced Coin Catalog & Starred Favorite Watchlist Manager */}
        <CoinWatchlistManager
          currentSymbol={settings.symbol}
          favoriteSymbols={settings.favoriteSymbols}
          exchange={settings.exchange}
          onSelectSymbol={(sym) => setSettings((prev) => ({ ...prev, symbol: sym }))}
          onToggleFavorite={handleToggleFavorite}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          language={language}
        />

        {/* Live Interactive Bot Trading Chart: Shows Exchange, Symbol, Timeframes, Entry, TP, SL, Status & Exit Rules */}
        <div id="live-chart">
          <LiveTradingBotChart
            settings={settings}
            onUpdateSettings={(patch) => setSettings((prev) => ({ ...prev, ...patch }))}
            currentTick={currentTick}
            orders={orders}
            isRunning={isRunning}
            onToggleRun={() => setIsRunning((r) => !r)}
            onManualTrigger={() => executePipelineLoop(true)}
            onClosePosition={handleClosePosition}
            language={language}
            latestSignal={latestSignal}
            scanCountdown={scanCountdown}
          />
        </div>

        {/* 2-Column Split Workspace: Left = Diagram + Inspector, Right = Live Execution Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (Cols 1-6): Exact match of screenshot layout */}
          <div className="lg:col-span-6 space-y-6">
            <div id="diagram">
              <PipelineDiagramView
                stages={stages}
                selectedStageId={selectedStageId}
                onSelectStage={(id) => setSelectedStageId(id)}
                activePulseStageId={activePulseStageId}
                isRunning={isRunning}
              />
            </div>

            <div id="inspector">
              <StageDetailPanel
                stage={selectedStage}
                features={features}
                signal={latestSignal}
                riskResult={latestRiskResult}
                settings={settings}
                onUpdateSettings={(patch) => setSettings((prev) => ({ ...prev, ...patch }))}
                language={language}
                onSelectNext={() => setSelectedStageId((id) => (id % 6) + 1)}
                onSelectPrev={() => setSelectedStageId((id) => (id === 1 ? 6 : id - 1))}
              />
            </div>
          </div>

          {/* Right Column (Cols 7-12): Real execution engine, position book & audit trail */}
          <div id="execution" className="lg:col-span-6 h-full">
            <LiveExecutionEngine
              orders={orders}
              auditLogs={auditLogs}
              settings={settings}
              onUpdateSettings={(patch) => setSettings((prev) => ({ ...prev, ...patch }))}
              isRunning={isRunning}
              onToggleRun={() => setIsRunning((r) => !r)}
              onManualTrigger={() => executePipelineLoop(true)}
              onClearLogs={() => setAuditLogs([])}
              onClosePosition={handleClosePosition}
              currentTick={currentTick}
              portfolioBalanceUsd={portfolioBalanceUsd}
              dailyPnlUsd={dailyPnlUsd}
              language={language}
              onInspectStage={(stageId) => setSelectedStageId(stageId)}
            />
          </div>
        </div>
      </main>

      {/* Auto-Configuration Quiz Modal */}
      <AutoConfigQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onApplySettings={handleApplyQuizProfile}
        currentCapital={portfolioBalanceUsd}
      />

      {/* Comprehensive App Guide Modal */}
      <FullAppGuideModal
        isOpen={isFullGuideOpen}
        onClose={() => setIsFullGuideOpen(false)}
        language={language}
      />

      {/* Cross-Device Sync & Starred Watchlist Persistence Modal */}
      <CrossDeviceSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        settings={settings}
        favoriteSymbols={settings.favoriteSymbols}
        onImportSettings={(newSettings) => {
          setSettings(newSettings);
          setQuizProfileApplied('ซิงค์ข้อมูลและเหรียญที่ติดดาวเรียบร้อยแล้ว!');
          setTimeout(() => setQuizProfileApplied(null), 4000);
        }}
        language={language}
      />
    </div>
  );
}
