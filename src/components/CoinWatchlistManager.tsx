import React, { useState } from 'react';
import { COIN_CATALOG, CoinItem } from '../data/coinCatalog';
import { Star, Search, Filter, Check, TrendingUp, Share2, Smartphone } from 'lucide-react';

interface CoinWatchlistManagerProps {
  currentSymbol: string;
  favoriteSymbols: string[];
  exchange: string;
  onSelectSymbol: (symbol: string) => void;
  onToggleFavorite: (symbol: string) => void;
  onOpenSyncModal?: () => void;
  language: 'TH' | 'EN';
}

export const CoinWatchlistManager: React.FC<CoinWatchlistManagerProps> = ({
  currentSymbol,
  favoriteSymbols,
  exchange,
  onSelectSymbol,
  onToggleFavorite,
  onOpenSyncModal,
  language,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  const categories = ['ALL', 'Major', 'Layer 1', 'Meme', 'AI', 'DeFi'];

  const filteredCoins = COIN_CATALOG.filter((coin) => {
    // Search match
    const matchesSearch =
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Category match
    const matchesCategory = categoryFilter === 'ALL' || coin.category === categoryFilter;

    // Favorite only match
    const matchesFavorites = !showOnlyFavorites || favoriteSymbols.includes(coin.symbol);

    return matchesSearch && matchesCategory && matchesFavorites;
  });

  return (
    <div className="w-full bg-[#090b14] border border-[#1e2238] rounded-[24px] p-4 sm:p-5 space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      {/* Title & Quick summary */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm sm:text-base font-bold text-[#f4f4f5]">
              {language === 'TH' ? 'รายการเหรียญที่เทรด & ติดดาวรายการโปรด' : 'Select Coin & Bookmark Watchlist'}
            </h4>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-950/60 to-pink-950/60 text-purple-200 border border-purple-500/30 shadow-xs">
              {favoriteSymbols.length} เหรียญติดดาว ⭐
            </span>
          </div>
          <p className="text-[11px] text-[#9ca3af] mt-0.5">
            {language === 'TH'
              ? 'กดรูปดาว ⭐ เพื่อบุ๊กมาร์กเหรียญที่ชอบ (จำในเครื่องอัตโนมัติ) หรือคลิกซิงค์เพื่อย้ายไปเปิดบนมือถือ/iPad'
              : 'Star your favorite coins to build your personal watchlist. Auto-saved locally, or sync to mobile/tablet.'}
          </p>
        </div>

        {/* Buttons: Sync cross-device & Favorite toggle switch */}
        <div className="flex items-center gap-2">
          {onOpenSyncModal && (
            <button
              type="button"
              onClick={onOpenSyncModal}
              className="px-3 py-1.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 text-purple-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer btn-micro shadow-xs"
              title="วิธีซิงค์เหรียญดาวข้ามเครื่องไป iPad หรือมือถือ"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">{language === 'TH' ? 'ซิงค์ข้ามมือถือ/iPad' : 'Sync Devices'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border btn-micro ${
              showOnlyFavorites
                ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-[#121524] border-[#232840] text-[#9ca3af] hover:text-[#f4f4f5]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-current text-amber-300' : ''}`} />
            <span>{language === 'TH' ? 'แสดงเฉพาะที่ติดดาว' : 'Favorites Only'}</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar: Search & Category tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อเหรียญ เช่น BTC, SOL, KUB, DOGE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0d101c] border border-[#232840] rounded-xl pl-8 pr-3 py-1.5 text-xs font-mono text-[#f4f4f5] placeholder:text-[#64748b] focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-gradient-to-r from-purple-950/70 to-blue-950/70 text-purple-200 border border-purple-500/40 font-semibold shadow-xs'
                  : 'text-[#9ca3af] hover:text-white bg-[#0e111e] hover:bg-[#15192c]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Coins Grid / Scroll Area */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
        {filteredCoins.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-[#9ca3af]">
            ไม่พบเหรียญที่ตรงกับคำค้นหา
          </div>
        ) : (
          filteredCoins.map((coin) => {
            const isSelected = currentSymbol === coin.symbol;
            const isFav = favoriteSymbols.includes(coin.symbol);

            return (
              <div
                key={coin.symbol}
                className={`p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between select-none btn-micro ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#181a33] to-[#101222] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] ring-1 ring-purple-400'
                    : 'bg-[#0d101c] border-[#1e2338] hover:border-purple-500/40 hover:bg-[#121626]'
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div
                    onClick={() => onSelectSymbol(coin.symbol)}
                    className="cursor-pointer flex-1 min-w-0"
                  >
                    <div className="font-mono font-bold text-xs text-[#f4f4f5] flex items-center gap-1 truncate">
                      <span>{coin.symbol}</span>
                      {isSelected && <span className="text-[10px] text-purple-400">✓</span>}
                    </div>
                    <div className="text-[10px] text-[#9ca3af] truncate mt-0.5">{coin.name}</div>
                  </div>

                  {/* Star Bookmark Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(coin.symbol);
                    }}
                    className="p-1 rounded-md text-[#9ca3af] hover:text-amber-300 transition-colors cursor-pointer shrink-0"
                    title={isFav ? 'ยกเลิกติดดาว' : 'ติดดาวเหรียญโปรด'}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isFav ? 'text-amber-300 fill-current' : 'text-[#64748b]'
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-2 pt-2 border-t border-[#1d2238] flex items-center justify-between text-[10px] font-mono">
                  <span className="text-purple-300/80">{coin.category}</span>
                  <span className="text-blue-300 font-semibold">
                    {coin.baseCurrency === 'THB'
                      ? `฿${coin.basePrice.toLocaleString()}`
                      : `$${coin.basePrice.toLocaleString()}`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
