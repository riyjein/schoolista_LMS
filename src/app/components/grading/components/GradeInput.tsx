import { useState, useCallback } from 'react';
import { cn } from '@/app/components/ui/utils';

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  error?: string;
  highlight?: boolean;
}

export function GradeInput({ value, onChange, disabled, error, highlight }: Props) {
  const [raw, setRaw] = useState<string>(value !== null ? String(value) : '');
  const [focused, setFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const str = e.target.value;
      setRaw(str);
      if (str === '' || str === '-') {
        onChange(null);
        return;
      }
      const num = parseFloat(str);
      if (!isNaN(num)) onChange(num);
    },
    [onChange],
  );

  const handleBlur = useCallback(() => {
    setFocused(false);
    if (value !== null) setRaw(String(value));
    else setRaw('');
  }, [value]);

  const displayValue = focused ? raw : (value !== null ? String(value) : '');

  return (
    <div className="relative">
      <input
        type="number"
        min={0}
        max={100}
        step={0.5}
        disabled={disabled}
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder="—"
        className={cn(
          'w-16 rounded-md border px-2 py-1 text-center text-sm outline-none transition-all',
          'disabled:cursor-default disabled:opacity-60 disabled:bg-muted/40',
          error
            ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300'
            : highlight
              ? 'border-primary/60 bg-primary/5 focus:ring-2 focus:ring-primary'
              : 'border-border bg-background focus:ring-2 focus:ring-primary',
          !disabled && 'hover:border-primary/50',
        )}
      />
      {error && (
        <p className="absolute top-full left-0 mt-0.5 text-xs text-red-600 whitespace-nowrap z-10">{error}</p>
      )}
    </div>
  );
}
