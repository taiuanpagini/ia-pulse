"use client";

interface CriteriaInputProps {
  name: string;
  label: string;
  description: string;
  value: number | undefined;
  onChange: (v: number) => void;
  isInverted?: boolean;
}

const OPTIONS = [1, 2, 3, 4, 5] as const;

export function CriteriaInput({
  name,
  label,
  description,
  value,
  onChange,
  isInverted = false,
}: CriteriaInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <span className="text-sm font-medium text-gray-200">{label}</span>
        <span className="ml-2 text-xs text-gray-500">{description}</span>
        {isInverted && (
          <p className="text-xs text-amber-500 mt-0.5">5 = muito complexa (pior) · 1 = simples (melhor)</p>
        )}
      </div>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex gap-2"
      >
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === opt}
            aria-label={`${label}: ${opt}`}
            onClick={() => onChange(opt)}
            className={`w-10 h-10 rounded-lg border text-sm font-semibold transition-colors
              ${
                value === opt
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
