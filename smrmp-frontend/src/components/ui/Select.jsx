import { useState, useRef, useEffect, useMemo, forwardRef } from 'react';
import { createPortal } from 'react-dom';
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
    variant = 'default',
    ...props
  },
  ref
) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, dropUp: false });
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const hiddenSelectRef = useRef(null);

  const isGlass = variant === 'glass';

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

  const selectedOption = useMemo(() => {
    const val = String(currentValue ?? '').toLowerCase();
    return normalizedOptions.find((opt) => opt.value.toLowerCase() === val);
  }, [normalizedOptions, currentValue]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [normalizedOptions, searchQuery]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredOptions.length, searchQuery]);

  const updateCoords = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldDropUp = spaceBelow < 220 && spaceAbove > spaceBelow;

    setCoords({
      left: rect.left,
      width: rect.width,
      top: shouldDropUp ? rect.top - 6 : rect.bottom + 6,
      dropUp: shouldDropUp,
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    updateCoords();

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const inContainer = containerRef.current && containerRef.current.contains(event.target);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);

      if (!inContainer && !inDropdown) {
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

  useEffect(() => {
    if (isOpen && normalizedOptions.length >= 6 && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, normalizedOptions.length]);

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

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
          className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] ${
            isGlass ? 'text-smrmp-parchment/80' : 'text-[#5C4233]'
          }`}
        >
          {label} {required && <span className="text-smrmp-gold">*</span>}
        </label>
      )}

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

      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`group relative flex h-12 w-full items-center justify-between rounded-xl border py-2.5 outline-none transition-all duration-200 ${
          Icon ? 'pl-10' : 'px-4'
        } pr-3.5 ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-stone-200 border-stone-300'
            : isGlass
            ? isOpen
              ? 'border-smrmp-gold bg-white ring-2 ring-smrmp-gold/25'
              : error
              ? 'border-rose-400 bg-rose-50 hover:border-rose-500'
              : 'border-white/20 bg-white text-[#121212] hover:border-smrmp-gold/50'
            : isOpen
            ? 'border-smrmp-green bg-[#FFFDF9] ring-2 ring-smrmp-green/20 shadow-sm'
            : error
            ? 'border-rose-400 bg-rose-50/50 hover:border-rose-500'
            : 'border-[#E2D6C5] bg-[#FFFDF9] hover:border-[#D4A017]/70 hover:bg-[#FAF6F0]'
        }`}
      >
        {Icon && (
          <div className={`pointer-events-none absolute left-3.5 ${isGlass ? 'text-slate-600' : 'text-[#7C4A2D]'}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}

        <span
          className={`truncate text-left text-sm font-medium ${
            selectedOption
              ? isGlass ? 'text-[#121212]' : 'text-[#2B1B12]'
              : isGlass ? 'text-stone-400' : 'text-[#8C7466]'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder || 'Select...'}
        </span>

        <div className="ml-2 flex items-center shrink-0">
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-200 ${
              isGlass ? 'text-stone-600' : 'text-[#7C4A2D]'
            } ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              transform: coords.dropUp ? 'translateY(-100%)' : 'none',
              zIndex: 99999,
            }}
            className={`overflow-hidden rounded-2xl border p-1.5 shadow-2xl animate-in fade-in duration-150 ${
              isGlass
                ? 'border-stone-200 bg-white text-[#121212] ring-1 ring-black/10'
                : 'border-[#E2D6C5] bg-[#FFFDF9] text-[#2B1B12] ring-1 ring-black/5'
            }`}
          >
            {normalizedOptions.length >= 6 && (
              <div className={`relative mb-1 px-1 pt-1 pb-1.5 border-b ${isGlass ? 'border-stone-200' : 'border-[#E2D6C5]/60'}`}>
                <MagnifyingGlassIcon className={`pointer-events-none absolute left-3.5 top-3.5 h-3.5 w-3.5 ${isGlass ? 'text-stone-500' : 'text-[#7C4A2D]'}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className={`w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs outline-none ${
                    isGlass
                      ? 'border-stone-200 bg-slate-50 text-[#121212] placeholder:text-stone-400 focus:border-smrmp-gold'
                      : 'border-[#E2D6C5] bg-[#FAF6F0] text-[#2B1B12] placeholder:text-[#A08878] focus:border-smrmp-green'
                  }`}
                />
              </div>
            )}

            <div className="max-h-60 overflow-y-auto no-scrollbar space-y-0.5" role="listbox">
              {placeholder && (
                <button
                  type="button"
                  onClick={() => selectOption('')}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                    !currentValue
                      ? isGlass
                        ? 'bg-amber-100 text-[#121212] font-bold'
                        : 'bg-[#FAF0D8] text-[#2B1B12] font-semibold'
                      : isGlass
                      ? 'text-stone-600 hover:bg-slate-100 hover:text-[#121212]'
                      : 'text-[#8C7466] hover:bg-[#FAF6F0] hover:text-[#2B1B12]'
                  }`}
                >
                  <span>{placeholder}</span>
                  {!currentValue && <CheckIcon className="h-3.5 w-3.5 text-amber-600" />}
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
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition-colors duration-150 ${
                      isSelected
                        ? isGlass
                          ? 'bg-amber-100 text-[#121212] font-bold border border-amber-300'
                          : 'bg-[#FAF0D8] text-[#2B1B12] font-bold border border-[#D4A017]/30'
                        : isHighlighted
                        ? isGlass ? 'bg-slate-100 text-[#121212]' : 'bg-[#FAF6F0] text-[#2B1B12]'
                        : isGlass
                        ? 'text-stone-700 hover:bg-slate-100 hover:text-[#121212]'
                        : 'text-[#4A3525] hover:bg-[#FAF6F0] hover:text-[#2B1B12]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <CheckIcon className="h-4 w-4 text-amber-600 shrink-0 ml-2" />}
                  </button>
                );
              })}

              {filteredOptions.length === 0 && (
                <div className={`px-3 py-3 text-center text-xs ${isGlass ? 'text-stone-500' : 'text-[#8C7466]'}`}>
                  No matching options found
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {error && <p className={`mt-1.5 text-xs font-semibold ${isGlass ? 'text-rose-400' : 'text-rose-600'}`}>{error}</p>}
    </div>
  );
});

export default Select;
