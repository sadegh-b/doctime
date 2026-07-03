// src/components/TimeSlot.tsx
interface Props {
  time: string;
  disabled?: boolean;
  onSelect: (time: string) => void;
}

export default function TimeSlot({ time, disabled = false, onSelect }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onSelect(time)}
      className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
        disabled
          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
          : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
      }`}
    >
      {time}
    </button>
  );
}