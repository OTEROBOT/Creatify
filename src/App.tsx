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
import { Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [stages, setStages] = useState<StageConfig[]>(DEFAULT_STAGES);
  const [selectedStageId, setSelectedStageId] = useState<number>(3); // Default Stage 3 (AI Strategy Engine)
  const [language, setLanguage] = useState<'TH' | 'EN'>('EN');
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [activePulseStageId, setActivePulseStageId] = useState<number | null>(3);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  // Bot Configuration Settings
  const [settings, setSettings] = useState<BotSettings>({
    mode: 'PAPER',
    apiKey: '',
    apiSecret: '',
    exchange: 'Binance',
    symbol: 'BTCUSDT',
    minConfidence: 0.65,
    modelType: 'XGBoost + Transformer',
    maxDrawdownLimitPct: 3.0,
    var99LimitPct: 2.0,
    kellyFraction: 0.25,
    maxOrderNotionalUsd: 1500,
    stopLossPct: 1.5,
    takeProfitPct: 3.0,
    executionAlgo: 'VWAP Post-Only Maker',
    maxSlippageBps: 3.5,
    discordWebhookUrl: '',
    telegramBotToken: '',
    telegramChatId: '',
    alertOnExecution: true,
    alertOnRiskReject: true,
  });

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

    const streamPair = settings.symbol.toLowerCase();
    const wsUrl = `wss://stream.binance.com:9443/ws/${streamPair}@trade`;

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
            handleNewMarketPrice(price, true);
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
        const last = priceHistoryRef.current[priceHistoryRef.current.length - 1] || 91400;
        const drift = (Math.random() - 0.492) * (last * 0.0008);
        handleNewMarketPrice(+(last + drift).toFixed(2), false);
      }
    }, 2200);

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [settings.symbol, wsConnected, isRunning]);

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

    // Update open positions real-time PnL
    setOrders((prevOrders) =>
      prevOrders.map((o) => {
        if (o.status !== 'OPEN') return o;
        const delta = o.side === 'BUY' ? price - o.entryPrice : o.entryPrice - price;
        const pnlUsd = +(delta * o.qty).toFixed(2);
        const pnlPct = +((delta / o.entryPrice) * 100).toFixed(2);
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
  const executePipelineLoop = useCallback(() => {
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
      const signal = evaluateAlphaSignal(newFeatures, settings);
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
        const riskResult = evaluateRiskGuardrails(
          signal,
          portfolioBalanceUsd,
          openPosCount,
          dailyPnlUsd,
          settings
        );
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
            riskResult.calculatedSizeUsd,
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

  // Automated recurring execution loop
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      executePipelineLoop();
    }, 4500);
    return () => clearInterval(interval);
  }, [isRunning, executePipelineLoop]);

  const handleClosePosition = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderId !== orderId) return o;
        setDailyPnlUsd((d) => +(d + o.pnlUsd).toFixed(2));
        setPortfolioBalanceUsd((p) => +(p + o.pnlUsd).toFixed(2));
        return { ...o, status: 'CLOSED' };
      })
    );
  };

  const selectedStage = stages.find((s) => s.id === selectedStageId) || stages[2];

  return (
    <div className="min-h-screen bg-[#0e0e11] text-[#f4f4f5] flex flex-col">
      {/* Top Bar Header */}
      <header className="flex items-center justify-between gap-8 px-6 lg:px-10 py-4 border-b border-[#222227] bg-[#0e0e11]/90 backdrop-blur-md sticky top-0 z-30">
        <a href="#top" className="text-base font-bold tracking-tight text-[#f4f4f5] whitespace-nowrap shrink-0">
          QuantFlow Bot Pipeline
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#a1a1aa]">
          <a href="#diagram" className="hover:text-[#f4f4f5] transition-colors whitespace-nowrap shrink-0">
            Pipeline Architecture
          </a>
          <a href="#inspector" className="hover:text-[#f4f4f5] transition-colors whitespace-nowrap shrink-0">
            Stage Inspector
          </a>
          <a href="#execution" className="hover:text-[#f4f4f5] transition-colors whitespace-nowrap shrink-0">
            Execution Engine
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {/* WebSocket Status Indicator */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#a1a1aa]">
            {wsConnected ? (
              <span className="flex items-center gap-1 text-[#4ade80]">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Binance Live</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#f59e0b]">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Synthetic Feed</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setLanguage((l) => (l === 'EN' ? 'TH' : 'EN'))}
            className="px-3 py-1.5 text-xs font-medium text-[#f4f4f5] bg-[#1e293b] hover:bg-[#28374f] border border-[#334155] rounded-lg transition-colors cursor-pointer"
          >
            {language === 'EN' ? 'ภาษาไทย (TH)' : 'English (EN)'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="top" className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-8 flex-1">
        {/* Exact Hero Title & Subtitle matching the user's uploaded screenshot */}
        <div className="max-w-3xl">
          <h1 className="text-[32px] sm:text-[42px] font-semibold tracking-tight text-[#f4f4f5] leading-[1.15]">
            Algorithmic Trading Bot Pipeline
          </h1>
          <p className="mt-3 text-[18px] sm:text-[22px] text-[#8e8e96] leading-[1.45] font-normal">
            {language === 'TH'
              ? 'สายพานข้อมูลแบบครบวงจรตั้งแต่การรับราคาตลาดสดไปจนถึงการส่งคำสั่งซื้อขายและการแจ้งเตือน คลิกเลือกแต่ละโมดูลเพื่อตรวจสอบรายละเอียด'
              : 'End-to-end data flow from live market intake to order execution & alerts. Select a component to inspect.'}
          </p>
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
              onManualTrigger={executePipelineLoop}
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
    </div>
  );
}
