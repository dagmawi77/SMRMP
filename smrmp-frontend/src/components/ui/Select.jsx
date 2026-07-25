import { useState, useRef, useEffect, useMemo, forwardRef } from 'react';
import { ChevronDownIcon, CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Select = forwardRef(function Select(
  {
    label,
    error,
    options = [],
    placeholder = 'Select...',
    value: controlledValue,
    defaultValue = '',
    onChange,
    onBlur,
    name,
    id,
    className = '',
    disabled = false,
    icon: Icon,
    required = false,
    ...props
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const hiddenSelectRef = useRef(null);

  const setRefs = (element) => {
    hiddenSelectRef.current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // Normalize options list
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: String(opt.value !== undefined ? opt.value : ''),
          label: String(opt.label !== undefined ? opt.label : opt.value),
        };
      }
      return { value: String(opt), label: String(opt) };
    });
  }, [options]);

  // Currently selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => opt.value === String(currentValue ?? ''));
  }, [normalizedOptions, currentValue]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [normalizedOptions, searchQuery]);

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions.length, searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        if (isOpen) {
          setIsOpen(false);
          setSearchQuery('');
          if (onBlur) {
            onBlur({ target: { name: name || id, value: currentValue } });
          }
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onBlur, name, id, currentValue]);

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen && normalizedOptions.length >= 6 && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, normalizedOptions.length]);

  const selectOption = (optionValue) => {
    if (disabled) return;
    if (!isControlled) {
      setInternalValue(optionValue);
    }
    setIsOpen(false);
    setSearchQuery('');

    if (onChange) {
      const syntheticEvent = {
        target: { name: name || id || '', value: optionValue, id: id || name },
        currentTarget: { name: name || id || '', value: optionValue, id: id || name },
      };
      onChange(syntheticEvent);
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
      return;
    }

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        selectOption(filteredOptions[highlightedIndex].value);
      }
    }
  };

  const selectId = id || name;

  return (
    <div className={`relative ${className}`} ref={containerRef} onKeyDown={handleKeyDown}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#5C4233]"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Hidden native select for standard HTML form/ref compatibility */}
      <select
        ref={setRefs}
        id={selectId}
        name={name}
        value={currentValue ?? ''}
        onChange={(e) => selectOption(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Modern Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group relative flex w-full items-center justify-between rounded-xl border py-2.5 text-sm text-[#2B1B12] outline-none transition-all duration-200 ${
          Icon ? 'pl-10' : 'px-4'
        } pr-3.5 ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-stone-100 border-[#E2D6C5]'
            : isOpen
            ? 'border-smrmp-green bg-[#FFFDF9] ring-2 ring-smrmp-green/20 shadow-sm'
            : error
            ? 'border-rose-400 bg-rose-50/50 hover:border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-[#E2D6C5] bg-[#FFFDF9] hover:border-[#D4A017]/70 hover:bg-[#FAF6F0]'
        }`}
      >
        {Icon && (
          <div className="pointer-events-none absolute left-3.5 text-[#7C4A2D] group-hover:text-smrmp-green transition-colors">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <span className={`truncate text-left font-medium ${selectedOption ? 'text-[#2B1B12]' : 'text-[#8C7466]'}`}>
          {selectedOption ? selectedOption.label : placeholder || 'Select...'}
        </span>

        <div className="ml-2 flex items-center shrink-0">
          <ChevronDownIcon
            className={`h-4 w-4 text-[#7C4A2D] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-smrmp-green' : 'group-hover:text-[#2B1B12]'
            }`}
          />
        </div>
      </button>

      {/* Modern Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-[#E2D6C5] bg-[#FFFDF9] p-1.5 shadow-2xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Quick Search if 6 or more items */}
          {normalizedOptions.length >= 6 && (
            <div className="relative mb-1 px-1 pt-1 pb-1.5 border-b border-[#E2D6C5]/60">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-3.5 h-3.5 w-3.5 text-[#7C4A2D]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-[#E2D6C5] bg-[#FAF6F0] pl-8 pr-3 py-1.5 text-xs text-[#2B1B12] placeholder:text-[#A08878] outline-none focus:border-smrmp-green focus:ring-1 focus:ring-smrmp-green"
              />
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto no-scrollbar space-y-0.5" role="listbox">
            {/* Clear/Placeholder option if provided and non-empty */}
            {placeholder && (
              <button
                type="button"
                onClick={() => selectOption('')}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                  !currentValue
                    ? 'bg-[#FAF0D8] text-[#2B1B12] font-semibold'
                    : 'text-[#8C7466] hover:bg-[#FAF6F0] hover:text-[#2B1B12]'
                }`}
              >
                <span>{placeholder}</span>
                {!currentValue && <CheckIcon className="h-3.5 w-3.5 text-smrmp-green" />}
              </button>
            )}

            {filteredOptions.map((opt, idx) => {
              const isSelected = String(currentValue ?? '') === opt.value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectOption(opt.value)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[#FAF0D8] text-[#2B1B12] font-bold border border-[#D4A017]/30 shadow-2xs'
                      : isHighlighted
                      ? 'bg-[#FAF6F0] text-[#2B1B12]'
                      : 'text-[#4A3525] hover:bg-[#FAF6F0] hover:text-[#2B1B12]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <CheckIcon className="h-4 w-4 text-smrmp-green shrink-0 ml-2" />}
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="px-3 py-3 text-center text-xs text-[#8C7466]">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
});

export default Select;
