import React, { useState, useEffect, useCallback, useRef } from 'react';

interface DateInputProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  required?: boolean;
  inputClassName?: string;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, required, inputClassName = "p-3" }) => {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-');
      setYear(y);
      setMonth(m);
      setDay(d);
    } else if (!value) {
      setYear('');
      setMonth('');
      setDay('');
    }
    // Set to true after first render, to avoid firing onChange on mount with empty value
    if (!hasInitialized.current) {
        setTimeout(() => { hasInitialized.current = true; }, 0);
    }
  }, [value]);

  const propagateChange = useCallback((d: string, m: string, y: string) => {
    if (!hasInitialized.current) return;

    if (d && m && y && d.length > 0 && m.length > 0 && y.length === 4) {
      const dayNum = parseInt(d, 10);
      const monthNum = parseInt(m, 10);
      const yearNum = parseInt(y, 10);
      // Basic validation
      if (dayNum > 0 && dayNum <= 31 && monthNum > 0 && monthNum <= 12 && yearNum > 1900 && yearNum < 2100) {
        onChange(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
        return;
      }
    } 
    
    if (!d && !m && !y) {
        onChange('');
    }
  }, [onChange]);

  const handleInputChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    maxLength: number,
    nextFieldRef?: React.RefObject<HTMLInputElement>
  ) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    if (inputValue.length <= maxLength) {
      setter(inputValue);
      if (inputValue.length === maxLength && nextFieldRef?.current) {
        nextFieldRef.current.focus();
      }
    }
  };
  
  useEffect(() => {
    propagateChange(day, month, year);
  }, [day, month, year, propagateChange]);

  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  
  const commonInputClass = `w-full bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-center focus:ring-amber-500 focus:border-amber-500 ${inputClassName}`;

  return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={day}
          onChange={handleInputChange(setDay, 2, monthRef)}
          placeholder="يوم"
          maxLength={2}
          className={commonInputClass}
          required={required}
          aria-label="Day"
        />
        <input
          ref={monthRef}
          type="text"
          inputMode="numeric"
          value={month}
          onChange={handleInputChange(setMonth, 2, yearRef)}
          placeholder="شهر"
          maxLength={2}
          className={commonInputClass}
          required={required}
          aria-label="Month"
        />
        <input
          ref={yearRef}
          type="text"
          inputMode="numeric"
          value={year}
          onChange={handleInputChange(setYear, 4)}
          placeholder="سنة"
          maxLength={4}
          className={commonInputClass}
          required={required}
          aria-label="Year"
        />
      </div>
  );
};

export default DateInput;
