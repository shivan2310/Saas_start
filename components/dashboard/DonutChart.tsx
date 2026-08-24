"use client";

import React from "react";

interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

interface DonutChartProps {
  categories?: SpendingCategory[];
  size?: number;
  strokeWidth?: number;
}

const DEFAULT_CATEGORIES: SpendingCategory[] = [
  { name: "Shopping", amount: 500, color: "#8FAF9F" },
  { name: "Food", amount: 40, color: "#F0A878" },
];

export const DonutChart: React.FC<DonutChartProps> = ({
  categories = DEFAULT_CATEGORIES,
  size = 280,
  strokeWidth = 24,
}) => {
  const validCategories = categories.filter((c) => c.amount > 0);
  const total = validCategories.reduce((sum, c) => sum + c.amount, 0);

  if (total === 0) {
    return (
      <div className="rounded-xl bg-[#161616] p-8 text-center">
        <p className="text-white text-lg font-bold">No spending data</p>
        <p className="text-gray-500 mt-1 text-sm">Add expenses to see the chart</p>
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentOffset = 0;

  const segments = validCategories.map((cat) => {
    const percentage = cat.amount / total;
    const dashLength = circumference * percentage;
    const gapLength = circumference - dashLength;

    const segment = {
      ...cat,
      percentage,
      strokeDasharray: `${dashLength} ${gapLength}`,
      strokeDashoffset: -currentOffset,
    };

    currentOffset += dashLength;
    return segment;
  });

  const legendItems = [...validCategories].sort((a, b) => b.amount - a.amount);

  return (
    <div className="rounded-xl bg-[#161616] p-6">
      <div className="flex justify-center mb-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="relative">
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="#2a2a2a"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {segments.map((seg, idx) => (
            <circle
              key={seg.name}
              cx={center}
              cy={center}
              r={radius}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              fill="none"
              style={{
                strokeDasharray: seg.strokeDasharray,
                strokeDashoffset: seg.strokeDashoffset,
              }}
            />
          ))}
          <g className="absolute top-0 left-0">
            <text
              x={center}
              y={center - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={Math.max(size * 0.12, 24)}
              fontWeight="bold"
              fontFamily="system-ui, sans-serif"
            >
              ₹{total.toLocaleString()}
            </text>
            <text
              x={center}
              y={center + 22}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#888"
              fontSize={Math.max(size * 0.05, 10)}
              fontWeight="500"
              fontFamily="system-ui, sans-serif"
              letterSpacing="0.05em"
            >
              TOTAL
            </text>
          </g>
        </svg>
      </div>

      <div className="space-y-3">
        {legendItems.map((cat) => {
          const percentage = ((cat.amount / total) * 100).toFixed(1);
          return (
            <div
              key={cat.name}
              className="flex items-center justify-between px-2"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-white text-sm font-medium">{cat.name}</span>
              </div>
              <div className="flex items-center gap-4 text-right min-w-[120px]">
                <span className="text-white font-semibold text-sm">
                  ₹{cat.amount.toLocaleString()}
                </span>
                <span className="text-gray-500 text-sm font-medium whitespace-nowrap">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};