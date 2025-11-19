'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ label, options, value, onChange, placeholder = 'Select...' }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      return options.find(opt => opt.value === value[0])?.label || '';
    }
    return `${value.length} selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-medium text-gray-600 dark:text-white mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-md text-sm text-gray-900 dark:text-gray-300 focus:border-accent-blue focus:ring-1 focus:ring-accent-blue flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-bg/80 transition-colors"
      >
        <span className={value.length === 0 ? 'text-gray-500 dark:text-gray-500' : ''}>
          {getDisplayText()}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-1 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-dark-bg/50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={value.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                className="w-4 h-4 text-accent-blue border-gray-300 dark:border-gray-600 rounded focus:ring-accent-blue focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

