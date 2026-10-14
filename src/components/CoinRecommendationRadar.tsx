import React, { useState } from 'react';
import { COIN_CATALOG, CoinItem, RecommendationTimeframe } from '../data/coinCatalog';
import {
  Sparkles,
  Calendar,
  Clock,
  Award,
  Crown,
  Star,
  Zap,
  ArrowUpRight,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  Share2,
  ExternalLink,
  Info,
} from 'lucide-react';

interface CoinRecommendationRadarProps {
  currentSymbol: string;
  favoriteSymbols: string[];
  onSelectSymbol: (symbol: string) => void;
  onToggleFavorite: (symbol: string) => void;
  onOpenSyncModal: () => void;
  language: 'TH' | 'EN';
}

export const CoinRecommendationRadar: React.FC<CoinRecommendationRadarProps> = ({
  currentSymbol,
  favoriteSymbols,
  onSelectSymbol,
  onToggleFavorite,
  onOpenSyncModal,
  language,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<RecommendationTimeframe | 'ALL'>('DAILY');
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'THB' | 'USDT'>('ALL');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Timeframe descriptions
  const timeframeDescriptions = {
    DAILY: {
      titleTh: '☀️ แนะนำประจำวัน (Daily Picks - 24H Momentum)',
      titleEn: '☀️ Daily Picks (24H Momentum & Breakouts)',
      descTh:
        'คัดเฉพาะเหรียญที่มีโวลุ่มและแรงซื้อพุ่งแรงใน 24 ชม. กราฟเหวี่ยงมีรอบชัดเจน เหมาะสำหรับบอทสไนเปอร์ (Scalping & Intraday Breaker)',
      badge: 'bg-[#f59e0b]/20 text-[#fbbf24] border-[#d97706]/40',
      icon: Clock,
    },
    MONTHLY: {
      titleTh: '🌙 แนะนำประจำเดือน (Monthly Trends - 30D Swing)',
      titleEn: '🌙 Monthly Trends (30D Swing & Trend Following)',
      descTh:
        'เหรียญที่มีปัจจัยหนุนระดับเดือน เทรนด์โครงสร้างแข็งแกร่ง มีการอัปเกรดเครือข่ายหรือเงินทุนไหลเข้า เหมาะสำหรับบอท Trend Following และ Grid Trading',
      badge: 'bg-[#3b82f6]/20 text-[#60a5fa] border-[#2563eb]/40',
      icon: Calendar,
    },
    YEARLY: {
      titleTh: '🏆 แนะนำประจำปี (Yearly Growth & Fundamentals)',
      titleEn: '🏆 Yearly Growth (Macro Cycle & Fundamentals)',
      descTh:
        'เหรียญโครงสร้างพื้นฐานระดับแถวหน้าของโลก เติบโตมั่นคงตลอดทั้งปี ทนทานทุกสภาวะ เหมาะสำหรับบอทสะสมระยะยาว (VWAP Maker & Rebalance)',
      badge: 'bg-[#8b5cf6]/20 text-[#c084fc] border-[#7c3aed]/40',
      icon: Award,
    },
    ALL_TIME: {
      titleTh: '💎 แนะนำตลอดกาล / บลูชิปปลอดภัย (All-Time Safe Haven)',
      titleEn: '💎 All-Time Blue Chips & Safe Haven',
      descTh:
        'เหรียญราชาที่ไม่เคยตาย สภาพคล่องระดับโลกอันดับ 1 เสี่ยงต่ำที่สุด เหมาะสำหรับมือใหม่หรือผู้ที่ต้องการปล่อยบอทระยะยาวแบบนอนหลับสบาย',
      badge: 'bg-[#10b981]/20 text-[#34d399] border-[#059669]/40',
      icon: Crown,
    },
  };

  // Filter coins based on timeframe and currency
  const recommendedCoins = COIN_CATALOG.filter((coin) => {
    // Currency match
    if (currencyFilter !== 'ALL' && coin.baseCurrency !== currencyFilter) return false;

    // Timeframe match
    if (selectedTimeframe === 'ALL') {
      return coin.recommendationTimeframes && coin.recommendationTimeframes.length > 0;
    }
    return coin.recommendationTimeframes?.includes(selectedTimeframe);
  }).sort((a, b) => b.aiScore - a.aiScore);

  return (
    <div className="w-full bg-[#090b14] border border-[#1e2238] rounded-[26px] p-5 sm:p-6 space-y-5 transition-all shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
      {/* Top Banner / Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600/30 via-pink-600/20 to-blue-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
            <Sparkles className="w-5 h-5 text-pink-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#f4f4f5] tracking-tight">
                {language === 'TH'
                  ? '🎯 เรดาร์วิเคราะห์เหรียญแนะนำน่าเทรด (Coin Recommendation Radar)'
                  : '🎯 Smart Coin Recommendation Radar'}
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-950/50 text-purple-200 border border-purple-500/40 shadow-xs">
                AI Alpha Screener
              </span>
            </div>
            <p className="text-xs text-[#9ca3af] mt-0.5">
              {language === 'TH'
                ? 'คำแนะนำการคัดเลือกเหรียญตามกรอบเวลา: ประจำวัน / ประจำเดือน / ประจำปี / ตลอดกาล พร้อมคลิกติดดาวหรือเลือกเทรดทันที'
                : 'Curated trading selections categorized by Daily, Monthly, Yearly, and All-Time horizons.'}
            </p>
          </div>
        </div>

        {/* Action Controls: Cross-device Sync + Show/Hide Collapse */}
        <div className="flex items-center gap-2">
          {/* Cross Device Sync Button */}
          <button
            type="button"
            onClick={onOpenSyncModal}
            className="px-3 py-1.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/35 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer btn-micro shadow-[0_0_12px_rgba(168,85,247,0.15)]"
            title="คลิกเพื่อดูวิธีจำเหรียญที่ติดดาว และซิงค์ไปใช้ในมือถือหรือ iPad"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'TH' ? '📱 ซิงค์ข้ามมือถือ / iPad' : '📱 Sync Mobile/iPad'}</span>
          </button>

          {/* Toggle Expand / Collapse */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="px-2.5 py-1.5 rounded-xl bg-[#0f1220] hover:bg-[#15192e] border border-[#212740] text-[#9ca3af] hover:text-[#f4f4f5] text-xs font-medium flex items-center gap-1 transition-all cursor-pointer btn-micro"
          >
            {isCollapsed ? (
              <>
                <span>{language === 'TH' ? 'เปิดดูคำแนะนำ' : 'Expand'}</span>
                <ChevronDown className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>{language === 'TH' ? 'ซ่อน' : 'Collapse'}</span>
                <ChevronUp className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Timeframe Selector Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#1f2029]">
            {/* 4 Horizon Tabs + All */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedTimeframe('DAILY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  selectedTimeframe === 'DAILY'
                    ? 'bg-[#3d2e10] border-[#d97706] text-[#fbbf24] shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                    : 'bg-[#16161d] border-[#262632] text-[#a1a1aa] hover:text-[#f4f4f5]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{language === 'TH' ? '☀️ ประจำวัน (Daily)' : '☀️ Daily Picks'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTimeframe('MONTHLY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  selectedTimeframe === 'MONTHLY'
                    ? 'bg-[#1e2d4d] border-[#3b82f6] text-[#60a5fa] shadow-[0_0_12px_rgba(59,130,246,0.25)]'
                    : 'bg-[#16161d] border-[#262632] text-[#a1a1aa] hover:text-[#f4f4f5]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{language === 'TH' ? '🌙 ประจำเดือน (Monthly)' : '🌙 Monthly Trends'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTimeframe('YEARLY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  selectedTimeframe === 'YEARLY'
                    ? 'bg-[#31204d] border-[#8b5cf6] text-[#c084fc] shadow-[0_0_12px_rgba(139,92,246,0.25)]'
                    : 'bg-[#16161d] border-[#262632] text-[#a1a1aa] hover:text-[#f4f4f5]'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{language === 'TH' ? '🏆 ประจำปี (Yearly)' : '🏆 Yearly Growth'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTimeframe('ALL_TIME')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  selectedTimeframe === 'ALL_TIME'
                    ? 'bg-[#103426] border-[#10b981] text-[#34d399] shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-[#16161d] border-[#262632] text-[#a1a1aa] hover:text-[#f4f4f5]'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>{language === 'TH' ? '💎 ตลอดกาล (All-Time)' : '💎 All-Time Blue Chips'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTimeframe('ALL')}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                  selectedTimeframe === 'ALL'
                    ? 'bg-[#272733] border-[#3f3f50] text-[#f4f4f5]'
                    : 'bg-[#16161d] border-[#262632] text-[#71717a] hover:text-[#d4d4d8]'
                }`}
              >
                <span>{language === 'TH' ? 'ดูทั้งหมด' : 'All Horizon'}</span>
              </button>
            </div>

            {/* Currency Filter (THB / USDT) */}
            <div className="flex items-center gap-1 bg-[#16161d] p-1 rounded-xl border border-[#252530]">
              <span className="text-[10px] text-[#71717a] px-2 font-mono">กระดาน:</span>
              <button
                type="button"
                onClick={() => setCurrencyFilter('ALL')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  currencyFilter === 'ALL' ? 'bg-[#262634] text-white font-semibold' : 'text-[#71717a] hover:text-white'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                type="button"
                onClick={() => setCurrencyFilter('THB')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  currencyFilter === 'THB' ? 'bg-[#1d2b45] text-[#60a5fa] font-semibold' : 'text-[#71717a] hover:text-white'
                }`}
              >
                🇹🇭 Bitkub (THB)
              </button>
              <button
                type="button"
                onClick={() => setCurrencyFilter('USDT')}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  currencyFilter === 'USDT' ? 'bg-[#1d2b45] text-[#34d399] font-semibold' : 'text-[#71717a] hover:text-white'
                }`}
              >
                🌐 Binance (USDT)
              </button>
            </div>
          </div>

          {/* Timeframe Info Header Box */}
          {selectedTimeframe !== 'ALL' && (
            <div className="bg-[#161822] border border-[#262c3e] rounded-xl p-3 flex items-start gap-3">
              <Info className="w-4 h-4 text-[#60a5fa] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#f4f4f5]">
                  {language === 'TH'
                    ? timeframeDescriptions[selectedTimeframe].titleTh
                    : timeframeDescriptions[selectedTimeframe].titleEn}
                </div>
                <div className="text-[11px] text-[#94a3b8] leading-relaxed">
                  {timeframeDescriptions[selectedTimeframe].descTh}
                </div>
              </div>
            </div>
          )}

          {/* Recommended Coins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {recommendedCoins.map((coin, idx) => {
              const isSelected = currentSymbol === coin.symbol;
              const isFav = favoriteSymbols.includes(coin.symbol);

              return (
                <div
                  key={coin.symbol}
                  className={`rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 select-none ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#181a33] to-[#101222] border-purple-500 shadow-[0_0_22px_rgba(168,85,247,0.35)] ring-1 ring-purple-400'
                      : 'bg-[#0d101c] border-[#1e2338] hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(168,85,247,0.12)]'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: AI Score + Symbol + Star Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {/* Rank / AI Score Badge */}
                        <div
                          className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${
                            coin.aiScore >= 95
                              ? 'bg-amber-950/50 text-amber-300 border border-amber-500/50'
                              : coin.aiScore >= 90
                              ? 'bg-blue-950/50 text-blue-300 border border-blue-500/50'
                              : 'bg-purple-950/50 text-purple-300 border border-purple-500/50'
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-pink-300" />
                          <span>AI {coin.aiScore}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-sm text-[#f4f4f5]">{coin.symbol}</span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-600 text-white font-semibold shadow-xs">
                                กำลังเทรด
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#9ca3af]">{coin.name}</div>
                        </div>
                      </div>

                      {/* Bookmark Star Button with smooth hover scale */}
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(coin.symbol)}
                        className={`p-1.5 rounded-xl border transition-all cursor-pointer btn-micro ${
                          isFav
                            ? 'bg-amber-950/60 border-amber-500/70 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-105'
                            : 'bg-[#141727] border-[#252b45] text-[#64748b] hover:text-amber-300 hover:border-amber-500/50'
                        }`}
                        title={isFav ? 'ยกเลิกติดดาว' : 'ติดดาวเหรียญโปรด'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Timeframe Badges & Risk */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {coin.recommendationTimeframes?.map((tf) => (
                        <span
                          key={tf}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${timeframeDescriptions[tf].badge}`}
                        >
                          {tf === 'DAILY' && '☀️ ประจำวัน'}
                          {tf === 'MONTHLY' && '🌙 ประจำเดือน'}
                          {tf === 'YEARLY' && '🏆 ประจำปี'}
                          {tf === 'ALL_TIME' && '💎 ตลอดกาล'}
                        </span>
                      ))}

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                          coin.riskLevel === 'LOW'
                            ? 'bg-[#14532d]/40 text-[#4ade80] border border-[#22c55e]/30'
                            : coin.riskLevel === 'MEDIUM'
                            ? 'bg-[#713f12]/40 text-[#fde047] border border-[#eab308]/30'
                            : 'bg-[#7f1d1d]/40 text-[#f87171] border border-[#ef4444]/30'
                        }`}
                      >
                        ความเสี่ยง: {coin.riskLevel === 'LOW' ? 'ต่ำ' : coin.riskLevel === 'MEDIUM' ? 'ปานกลาง' : 'สูง'}
                      </span>
                    </div>

                    {/* Detailed Reason & Catalyst */}
                    <div className="bg-[#101116] border border-[#1e1f29] rounded-xl p-2.5 space-y-1 text-xs">
                      <p className="text-[#d4d4d8] leading-relaxed text-[11px]">{coin.recommendationReason}</p>
                      <div className="text-[10px] text-[#60a5fa] flex items-start gap-1 pt-1 border-t border-[#1a1b24]">
                        <span className="font-semibold shrink-0">⚡ Catalyst:</span>
                        <span className="text-[#93c5fd]">{coin.catalystTh}</span>
                      </div>
                    </div>

                    {/* Key Metrics: Price, 24h Change, Strategy */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                      <div className="bg-[#111218] p-2 rounded-lg border border-[#20212c]">
                        <div className="text-[10px] text-[#71717a]">ราคาปัจจุบัน:</div>
                        <div className="text-[#f4f4f5] font-bold mt-0.5">
                          {coin.baseCurrency === 'THB'
                            ? `฿${coin.basePrice.toLocaleString()}`
                            : `$${coin.basePrice.toLocaleString()}`}
                        </div>
                      </div>

                      <div className="bg-[#111218] p-2 rounded-lg border border-[#20212c]">
                        <div className="text-[10px] text-[#71717a]">รอบ 24h / 30d:</div>
                        <div className="text-[#4ade80] font-bold mt-0.5">
                          +{coin.change24hPct}% / +{coin.change30dPct}%
                        </div>
                      </div>
                    </div>

                    {/* Strategy Recommendation */}
                    <div className="text-[10px] text-[#a1a1aa] font-mono flex items-center justify-between">
                      <span className="text-[#71717a]">กลยุทธ์แนะนำ:</span>
                      <span className="text-[#c084fc] font-semibold truncate max-w-[170px]">
                        {coin.recommendedStrategy}
                      </span>
                    </div>

                    {coin.keyLevels && (
                      <div className="text-[10px] text-[#71717a] font-mono">
                        <span>🎯 กรอบราคา: </span>
                        <span className="text-[#e4e4e7]">{coin.keyLevels}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button: Choose this coin for live/paper bot trading */}
                  <div className="mt-3.5 pt-3 border-t border-[#1f202b]">
                    <button
                      type="button"
                      onClick={() => onSelectSymbol(coin.symbol)}
                      disabled={isSelected}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer btn-micro active:scale-95 ${
                        isSelected
                          ? 'bg-purple-950/40 text-purple-200 border border-purple-500/40 cursor-default shadow-xs'
                          : 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-500 hover:via-pink-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 text-yellow-300" />
                      <span>{isSelected ? 'บอทกำลังรันคู่นี้อยู่ 🟢' : 'เลือกคู่นี้ให้บอทเทรดทันที (Trade Now)'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
