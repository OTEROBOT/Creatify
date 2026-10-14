import React from 'react';
import { StageConfig } from '../types/pipeline';

interface PipelineDiagramViewProps {
  stages: StageConfig[];
  selectedStageId: number;
  onSelectStage: (id: number) => void;
  activePulseStageId: number | null;
  isRunning: boolean;
}

// UI/UX Optimization: Pipeline Diagram Node Renderer with Purple/Pink/Blue Neon Glow
export const PipelineDiagramView: React.FC<PipelineDiagramViewProps> = ({
  stages,
  selectedStageId,
  onSelectStage,
  activePulseStageId,
  isRunning,
}) => {
  const getStage = (id: number) => stages.find((s) => s.id === id)!;

  const renderStageNode = (id: number) => {
    const stage = getStage(id);
    const isSelected = selectedStageId === id;
    const isPulsing = isRunning && activePulseStageId === id;

    return (
      <button
        key={id}
        type="button"
        onClick={() => onSelectStage(id)}
        aria-pressed={isSelected}
        className={`group relative w-full min-h-[78px] sm:min-h-[86px] px-4 py-3 rounded-[32px] text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer flex flex-col items-center justify-center select-none btn-micro ${
          isSelected
            ? 'bg-gradient-to-b from-[#191c33] to-[#101222] border-[2px] border-purple-500 shadow-[0_0_28px_rgba(168,85,247,0.45)] ring-2 ring-purple-500/20 scale-[1.02]'
            : isPulsing
            ? 'bg-gradient-to-b from-[#221226] to-[#150d1a] border-[1.75px] border-pink-500 shadow-[0_0_22px_rgba(236,72,153,0.4)] scale-[1.01]'
            : 'bg-[#0c0e19] border border-[#21263d] hover:border-purple-500/40 hover:bg-[#121626]'
        }`}
      >
        <span
          className={`text-[14px] sm:text-[15px] font-semibold tracking-tight leading-snug transition-colors ${
            isSelected
              ? 'text-white font-bold'
              : isPulsing
              ? 'text-pink-200 font-bold'
              : 'text-[#cbd5e1] group-hover:text-white'
          }`}
        >
          {stage.name}
        </span>
        <span
          className={`mt-0.5 text-[11px] sm:text-[12.5px] font-mono italic leading-tight transition-colors ${
            isSelected
              ? 'text-purple-300 font-medium'
              : isPulsing
              ? 'text-pink-300'
              : 'text-[#94a3b8] group-hover:text-purple-300'
          }`}
        >
          {stage.subtitle}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full rounded-[28px] bg-[#090b14] border border-[#1e2238] px-4 py-6 sm:px-7 sm:py-7 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
      <div className="grid grid-cols-11 items-center">
        {/* ROW 1: Stage 1 Exchange API -> Edge -> Stage 2 Data Preprocessing */}
        <div className="col-span-4">{renderStageNode(1)}</div>

        {/* Edge 1 -> 2: Live Prices & Volume */}
        <div className="col-span-3 flex items-center justify-center px-1 relative">
          <div className="w-full flex items-center justify-between text-[#71717a]">
            <div className="flex items-center flex-1">
              <div className="w-full border-b border-dotted border-[#333b5c]" />
              <span
                className={`inline-block w-2 h-2 rounded-full shrink-0 -ml-1 transition-transform duration-200 ${
                  activePulseStageId === 1
                    ? 'bg-blue-400 scale-150 shadow-[0_0_12px_#60a5fa]'
                    : 'bg-blue-500/60'
                }`}
              />
            </div>

            <span className="px-2 text-[10px] sm:text-[12px] font-mono italic text-purple-200 whitespace-nowrap tracking-tight">
              Live Prices &amp; Volume
            </span>

            <div className="flex items-center flex-1">
              <div className="w-full border-b border-dotted border-[#333b5c]" />
              <svg
                className="w-3 h-3 text-purple-400 -ml-1.5 shrink-0"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M4 2.5L8 6L4 9.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="col-span-4">{renderStageNode(2)}</div>

        {/* CONNECTOR ROW 1->2: Vertical Edge 2 -> 3 */}
        <div className="col-span-7" />
        <div className="col-span-4 flex flex-col items-center justify-center py-2">
          <div className="h-3 border-l border-dotted border-[#333b5c]" />
          <span
            className={`w-2.5 h-1.5 rounded-t-full transition-all duration-200 ${
              activePulseStageId === 2
                ? 'bg-purple-400 scale-125 shadow-[0_0_12px_#c084fc]'
                : 'bg-purple-500/60'
            }`}
          />
          <span className="my-0.5 text-[11px] sm:text-[12px] font-mono italic text-pink-200 whitespace-nowrap">
            Cleaned Data
          </span>
          <div className="h-3 border-l border-dotted border-[#333b5c]" />
          <svg
            className="w-3 h-3 text-pink-400 -mt-1"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 4.5L6 8.5L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ROW 2: Stage 4 Risk Management <- Edge <- Stage 3 AI Strategy Engine */}
        <div className="col-span-4">{renderStageNode(4)}</div>

        {/* Edge 3 -> 4: Trade Signals (Buy/Sell) */}
        <div className="col-span-3 flex items-center justify-center px-1 relative">
          <div className="w-full flex items-center justify-between text-[#71717a]">
            <div className="flex items-center flex-1">
              <svg
                className="w-3 h-3 text-pink-400 -mr-1.5 shrink-0"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M8 2.5L4 6L8 9.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="w-full border-b border-dotted border-[#333b5c]" />
            </div>

            <span
              className={`px-2 text-[10px] sm:text-[12px] font-mono italic whitespace-nowrap tracking-tight transition-colors ${
                activePulseStageId === 3 ? 'text-pink-300 font-bold' : 'text-pink-200'
              }`}
            >
              Trade Signals (Buy/Sell)
            </span>

            <div className="flex items-center flex-1">
              <div className="w-full border-b border-dotted border-[#333b5c]" />
            </div>
          </div>
        </div>

        <div className="col-span-4">{renderStageNode(3)}</div>

        {/* CONNECTOR ROW 2->3: Vertical Edge 4 -> 5 */}
        <div className="col-span-4 flex flex-col items-center justify-center py-2">
          <div className="h-3 border-l border-dotted border-[#333b5c]" />
          <span
            className={`w-2.5 h-1.5 rounded-t-full transition-all duration-200 ${
              activePulseStageId === 4
                ? 'bg-blue-400 scale-125 shadow-[0_0_12px_#60a5fa]'
                : 'bg-blue-500/60'
            }`}
          />
          <span className="my-0.5 text-[11px] sm:text-[12px] font-mono italic text-blue-200 whitespace-nowrap">
            Approved Orders
          </span>
          <div className="h-3 border-l border-dotted border-[#333b5c]" />
          <svg
            className="w-3 h-3 text-blue-400 -mt-1"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2.5 4.5L6 8.5L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="col-span-7" />

        {/* ROW 3: Stage 5 Order Execution -> Edge -> Stage 6 Notifications */}
        <div className="col-span-4">{renderStageNode(5)}</div>

        {/* Edge 5 -> 6: Trade Confirmations */}
        <div className="col-span-3 flex items-center justify-center px-1 relative">
          <div className="w-full flex items-center justify-between text-[#71717a]">
            <div className="flex items-center flex-1">
              <div className="w-full border-b border-dotted border-[#333b5c]" />
            </div>

            <span
              className={`px-2 text-[10px] sm:text-[12px] font-mono italic whitespace-nowrap tracking-tight transition-colors ${
                activePulseStageId === 5 ? 'text-purple-300 font-bold' : 'text-purple-200'
              }`}
            >
              Trade Confirmations
            </span>

            <div className="flex items-center flex-1">
              <div className="w-full border-b border-dotted border-[#333b5c]" />
              <svg
                className="w-3 h-3 text-purple-400 -ml-1.5 shrink-0"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M4 2.5L8 6L4 9.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="col-span-4">{renderStageNode(6)}</div>
      </div>
    </div>
  );
};
