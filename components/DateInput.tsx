
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface DateInputProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  required?: boolean;
  inputClassName?: string;
}

const DateInput: React.FC<DateInputProps> = ({ value, onChange, required, inputClassName = "p-3" }) => {
  // Initialize state directly from props to avoid effect loops
  const splitDate = (val: string) => {
    if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [y, m, d] = val.split('-');
      return { d, m, y };
    }
    return { d: '', m: '', y: '' };
  };

  const initial = splitDate(value);
  const [day, setDay] = useState(initial.d);
  const [month, setMonth] = useState(initial.m);
  const [year, setYear] = useState(initial.y);

  // Refs to prevent cyclic dependency loops
  const isInternalChange = useRef(false);

  // Sync from parent (only if parent value changes externally)
  useEffect(() => {
    if (!isInternalChange.current) {
        const { d, m, y } = splitDate(value);
        setDay(d);
        setMonth(m);
        setYear(y);
    }
    isInternalChange.current = false;
  }, [value]);

  const updateParent = useCallback((d: string, m: string, y: string) => {
    isInternalChange.current = true;
    if (d && m && y && d.length > 0 && m.length > 0 && y.length === 4) {
      onChange(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
    } else if (!d && !m && !y) {
      onChange('');
    }
  }, [onChange]);

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
    setDay(val);
    updateParent(val, month, year);
    if (val.length === 2) monthRef.current?.focus();
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 2);
    setMonth(val);
    updateParent(day, val, year);
    if (val.length === 2) yearRef.current?.focus();
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setYear(val);
    updateParent(day, month, val);
  };

  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  
  const commonInputClass = `w-full bg-gray-700 border border-gray-600 rounded-lg text-gray-200 text-center focus:ring-amber-500 focus:border-amber-500 transition-none ${inputClassName}`;

  return (
      <div className="flex items-center gap-2" dir="ltr">
        <input
          ref={yearRef}
          type="text"
          inputMode="numeric"
          value={year}
          onChange={handleYearChange}
          placeholder="YYYY"
          maxLength={4}
          className={`${commonInputClass} w-[40%]`}
          required={required}
        />
        <span className="text-gray-500">-</span>
        <input
          ref={monthRef}
          type="text"
          inputMode="numeric"
          value={month}
          onChange={handleMonthChange}
          placeholder="MM"
          maxLength={2}
          className={`${commonInputClass} w-[25%]`}
          required={required}
        />
        <span className="text-gray-500">-</span>
         <input
          type="text"
          inputMode="numeric"
          value={day}
          onChange={handleDayChange}
          placeholder="DD"
          maxLength={2}
          className={`${commonInputClass} w-[25%]`}
          required={required}
        />
      </div>
  );
};

export default React.memo(DateInput);
