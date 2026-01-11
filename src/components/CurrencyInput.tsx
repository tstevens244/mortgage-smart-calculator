import { useState, useCallback, useEffect, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { formatNumber, parseNumber } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  className?: string;
  "aria-describedby"?: string;
  "aria-label"?: string;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatNumber(value));
    const [isFocused, setIsFocused] = useState(false);

    // Sync display value when external value changes (and not focused)
    useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatNumber(value));
      }
    }, [value, isFocused]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      // Allow typing freely - only digits
      const sanitized = rawValue.replace(/[^0-9]/g, "");
      setDisplayValue(sanitized);
      
      // Update the actual value
      const numericValue = parseInt(sanitized, 10) || 0;
      onChange(numericValue);
    }, [onChange]);

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      // Show raw number without formatting when focused
      setDisplayValue(value === 0 ? "" : value.toString());
    }, [value]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      // Format the number on blur
      setDisplayValue(formatNumber(value));
    }, [value]);

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn("h-8 sm:h-10 text-sm sm:text-lg font-medium flex-1", className)}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export default CurrencyInput;
