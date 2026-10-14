import React, { useState } from 'react';
import { BotSettings } from '../types/pipeline';
import {
  Smartphone,
  Tablet,
  Laptop,
  Copy,
  Check,
  Share2,
  Download,
  AlertCircle,
  X,
  QrCode,
  ShieldCheck,
  Database,
  RefreshCw,
} from 'lucide-react';

interface CrossDeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BotSettings;
  favoriteSymbols: string[];
  onImportSettings: (newSettings: BotSettings) => void;
  language: 'TH' | 'EN';
}

export const CrossDeviceSyncModal: React.FC<CrossDeviceSyncModalProps> = ({
  isOpen,
  onClose,
  settings,
  favoriteSymbols,
  onImportSettings,
  language,
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [inputCode, setInputCode] = useState<string>('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  // Generate sync payload containing favorites and core preferences
  const syncPayload = {
    v: 1,
    fav: favoriteSymbols,
    sym: settings.symbol,
    exc: settings.exchange,
    cap: settings.initialCapitalUsd,
    cur: settings.capitalCurrency,
    mod: settings.modelType,
    con: settings.minConfidence,
    dd: settings.maxDrawdownLimitPct,
    kel: settings.kellyFraction,
    alg: settings.executionAlgo,
    ts: Date.now(),
  };

  const syncCode = btoa(unescape(encodeURIComponent(JSON.stringify(syncPayload))));
  const shareableUrl = `${window.location.origin}${window.location.pathname}#sync=${syncCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(syncCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleImport = () => {
    try {
      setImportStatus('idle');
      setErrorMessage('');
      const cleaned = inputCode.trim();
      if (!cleaned) {
        setErrorMessage('กรุณากรอกรหัสซิงค์ก่อนกดนำเข้า');
        setImportStatus('error');
        return;
      }

      const decoded = decodeURIComponent(escape(atob(cleaned)));
      const parsed = JSON.parse(decoded);

      if (!parsed || !Array.isArray(parsed.fav)) {
        throw new Error('รูปแบบรหัสไม่ถูกต้อง');
      }

      const updatedSettings: BotSettings = {
        ...settings,
        favoriteSymbols: parsed.fav || settings.favoriteSymbols,
        symbol: parsed.sym || settings.symbol,
        exchange: parsed.exc || settings.exchange,
        initialCapitalUsd: parsed.cap || settings.initialCapitalUsd,
        capitalCurrency: parsed.cur || settings.capitalCurrency,
        modelType: parsed.mod || settings.modelType,
        minConfidence: parsed.con !== undefined ? parsed.con : settings.minConfidence,
        maxDrawdownLimitPct: parsed.dd !== undefined ? parsed.dd : settings.maxDrawdownLimitPct,
        kellyFraction: parsed.kel !== undefined ? parsed.kel : settings.kellyFraction,
        executionAlgo: parsed.alg || settings.executionAlgo,
      };

      onImportSettings(updatedSettings);
      setImportStatus('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setImportStatus('error');
      setErrorMessage('รหัสซิงค์ไม่ถูกต้องหรือหมดอายุ โปรดตรวจสอบรหัสอีกครั้ง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#141419] border border-[#2c2c38] rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-6 text-[#f4f4f5]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#242430]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1e293b] border border-[#3b82f6]/40 flex items-center justify-center text-[#60a5fa]">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#f4f4f5]">
                {language === 'TH'
                  ? 'ระบบจำเหรียญ & ซิงค์ข้ามอุปกรณ์ (มือถือ / iPad / คอม)'
                  : 'Cross-Device Watchlist & Settings Sync'}
              </h3>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                {language === 'TH'
                  ? 'ตอบข้อสงสัย: กดดาวแล้วจะจำยังไง? และจะย้ายไปเปิดบนมือถือหรือ iPad ได้อย่างไร?'
                  : 'How stars are remembered and how to sync across mobile, iPad, and other devices.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#202028] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Part 1: How it is currently remembered (LocalStorage) */}
        <div className="bg-[#181822] border border-[#2a2a38] rounded-2xl p-4.5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#38bdf8]">
            <Database className="w-4 h-4 text-[#38bdf8]" />
            <span>
              {language === 'TH'
                ? '1. ในเครื่องปัจจุบันของคุณ จำอย่างไร?'
                : '1. How does your current device remember?'}
            </span>
          </div>
          <p className="text-xs text-[#d4d4d8] leading-relaxed">
            {language === 'TH' ? (
              <>
                ทุกครั้งที่คุณกดรูปดาว ⭐ ที่เหรียญใดก็ตาม ระบบจะ{' '}
                <strong className="text-white underline decoration-[#38bdf8]">
                  บันทึกลงในเบราว์เซอร์อัตโนมัติ (LocalStorage) ทันที
                </strong>
                ! แม้คุณจะรีเฟรชหน้าจอ (F5), ปิดแท็บ, หรือปิดคอมพิวเตอร์ไป{' '}
                <span className="text-[#4ade80] font-semibold">
                  เหรียญที่ติดดาวและการตั้งค่าพอร์ตจะไม่หายไป
                </span>{' '}
                โดยจะอยู่ครบถ้วนในเครื่องนี้ตลอดไป
              </>
            ) : (
              'Whenever you star a coin, it is automatically saved to your browser localStorage. It persists across refreshes and restarts.'
            )}
          </p>
        </div>

        {/* Part 2: Cross-Device Solution (Transfer to iPad / Mobile / Other PC) */}
        <div className="bg-[#181c2b] border border-[#2d3a5a] rounded-2xl p-4.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-[#60a5fa]">
              <div className="flex items-center gap-1">
                <Laptop className="w-4 h-4" />
                <span>↔</span>
                <Tablet className="w-4 h-4" />
                <span>↔</span>
                <Smartphone className="w-4 h-4" />
              </div>
              <span>
                {language === 'TH'
                  ? '2. ถ้าอยากเปิดดูในมือถือ หรือ iPad ให้ทำตามนี้'
                  : '2. How to sync to Mobile or iPad'}
              </span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#1e293b] text-[#93c5fd]">
              {favoriteSymbols.length} เหรียญที่ติดดาว
            </span>
          </div>

          <p className="text-xs text-[#94a3b8] leading-relaxed">
            {language === 'TH'
              ? 'เนื่องจาก Apple Safari ในมือถือ/iPad และคอมพิวเตอร์เป็นคนละเครื่องกัน คุณสามารถเลือก 1 ใน 2 วิธีด้านล่างเพื่อย้ายข้อมูลไปใช้งานต่อได้ทันทีใน 5 วินาที:'
              : 'Transfer your favorites and settings to your mobile or tablet using either method below:'}
          </p>

          {/* Option A: One-Click Share Link */}
          <div className="bg-[#11131c] border border-[#242b40] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#f4f4f5]">
              <span className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#60a5fa]" />
                {language === 'TH' ? 'วิธี A: คัดลอกลิงก์ซิงค์ตรง (เปิดในมือถือปุ๊บ ซิงค์ทันที)' : 'Option A: Instant Sync URL'}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
              </button>
            </div>
            <div className="text-[11px] font-mono text-[#94a3b8] truncate bg-[#0c0d14] p-2 rounded-lg border border-[#1b2030]">
              {shareableUrl}
            </div>
          </div>

          {/* Option B: Copy Sync Code */}
          <div className="bg-[#11131c] border border-[#242b40] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#f4f4f5]">
              <span className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-[#a78bfa]" />
                {language === 'TH' ? 'วิธี B: คัดลอกรหัสโปรไฟล์ (Profile Sync Code)' : 'Option B: Profile Sync Code'}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1 rounded-lg bg-[#3b2d54] hover:bg-[#4c3a6c] text-[#c084fc] border border-[#a855f7]/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'คัดลอกแล้ว!' : 'คัดลอกรหัส'}</span>
              </button>
            </div>
            <div className="text-[10px] font-mono text-[#a1a1aa] break-all bg-[#0c0d14] p-2 rounded-lg border border-[#1b2030] max-h-16 overflow-y-auto">
              {syncCode}
            </div>
          </div>
        </div>

        {/* Part 3: Import Box (For when the user is on their mobile/iPad) */}
        <div className="bg-[#17171d] border border-[#2c2c3a] rounded-2xl p-4.5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#f4f4f5]">
            <Download className="w-4 h-4 text-[#4ade80]" />
            <span>
              {language === 'TH'
                ? '3. นำเข้ารหัสซิงค์ (เมื่อคุณเปิดบนมือถือหรือ iPad แล้ว)'
                : '3. Import Sync Code on your new device'}
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa]">
            {language === 'TH'
              ? 'วางรหัสที่คุณคัดลอกมาจากเครื่องเดิม แล้วกดปุ่มนำเข้า ข้อมูลเหรียญที่ติดดาวจะมาโผล่ที่เครื่องนี้ทันที'
              : 'Paste the sync code from your other device and click Import.'}
          </p>

          <div className="space-y-2">
            <textarea
              rows={2}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="วางรหัสโปรไฟล์ซิงค์ที่นี่..."
              className="w-full bg-[#101015] border border-[#2a2a36] rounded-xl p-2.5 text-xs font-mono text-[#f4f4f5] placeholder:text-[#52525b] focus:outline-none focus:border-[#60a5fa] resize-none"
            />

            {importStatus === 'error' && (
              <div className="flex items-center gap-1.5 text-xs text-[#f87171]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {importStatus === 'success' && (
              <div className="flex items-center gap-1.5 text-xs text-[#4ade80]">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>ซิงค์ข้อมูลสำเร็จ! กำลังอัปเดตหน้าจอ...</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleImport}
              className="w-full py-2.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{language === 'TH' ? 'นำเข้าข้อมูลสู่เครื่องนี้ทันที' : 'Import Settings to This Device'}</span>
            </button>
          </div>
        </div>

        {/* Security & Offline note */}
        <div className="flex items-center gap-2 text-[11px] text-[#71717a] pt-1 border-t border-[#202028]">
          <ShieldCheck className="w-4 h-4 text-[#10b981] shrink-0" />
          <span>
            {language === 'TH'
              ? 'ความปลอดภัย: รหัสซิงค์ไม่มีการส่ง API Secret ส่วนตัวออกนอกเครื่อง จึงปลอดภัย 100%'
              : 'Security: Sync code does not contain private API secrets, completely safe.'}
          </span>
        </div>
      </div>
    </div>
  );
};
