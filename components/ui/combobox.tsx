"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronDown, Search, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

interface ComboboxProps {
  options: Option[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  multiple?: boolean;
  maxSelected?: number;
  clearable?: boolean;
  emptyMessage?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  "aria-label"?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  className,
  disabled = false,
  loading = false,
  multiple = false,
  maxSelected,
  clearable = false,
  emptyMessage = "No se encontraron resultados.",
  onSearch,
  onClear,
  "aria-label": ariaLabel,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  
  const selectedValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return value ? [value] : [];
  }, [value, multiple]);

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  const handleSearch = React.useCallback((query: string) => {
    setSearchValue(query);
    setHighlightedIndex(-1);
    onSearch?.(query);
  }, [onSearch]);

  const handleSelect = React.useCallback((optionValue: string) => {
    if (disabled) return;
    
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : maxSelected && selectedValues.length >= maxSelected
        ? selectedValues
        : [...selectedValues, optionValue];
      onValueChange?.(newValues);
    } else {
      onValueChange?.(optionValue);
      setOpen(false);
    }
  }, [disabled, multiple, selectedValues, maxSelected, onValueChange]);

  const handleClear = React.useCallback(
    (e?: React.SyntheticEvent) => {
      e?.stopPropagation();
      onValueChange?.(multiple ? [] : "");
      onClear?.();
    },
    [multiple, onValueChange, onClear]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex(prev =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;
        case "Escape":
          setOpen(false);
          break;
        case "Backspace": {
          if (clearable && selectedValues.length > 0) {
            const isInput =
              (e.target as HTMLElement)?.tagName === "INPUT";
            if (!isInput || searchValue === "") {
              e.preventDefault();
              handleClear();
            }
          }
          break;
        }
      }
    },
    [
      disabled,
      filteredOptions,
      highlightedIndex,
      handleSelect,
      clearable,
      selectedValues,
      handleClear,
      searchValue,
    ]
  );

  const getDisplayValue = () => {
    if (selectedValues.length === 0) return placeholder;
    
    if (multiple) {
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option?.label || selectedValues[0];
      }
      return `${selectedValues.length} seleccionados`;
    }
    
    const option = options.find(opt => opt.value === selectedValues[0]);
    return option?.label || selectedValues[0];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-white/70 border-white/30 hover:bg-white/90 transition-all duration-200",
            "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span className="truncate">{getDisplayValue()}</span>
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {multiple && selectedValues.length > 0 && (
              <div className="flex gap-1 max-w-32 overflow-hidden">
                {selectedValues.slice(0, 2).map(val => {
                  const option = options.find(opt => opt.value === val);
                  return (
                    <Badge 
                      key={val} 
                      variant="secondary" 
                      className="text-xs px-1 py-0 h-5"
                    >
                      {option?.label?.slice(0, 8) || val.slice(0, 8)}
                    </Badge>
                  );
                })}
                {selectedValues.length > 2 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-5">
                    +{selectedValues.length - 2}
                  </Badge>
                )}
              </div>
            )}
            
            {clearable && selectedValues.length > 0 && (
              <span
                role="button"
                tabIndex={0}
                aria-label="Limpiar selección"
                className="inline-flex items-center justify-center h-4 w-4 p-0 rounded hover:bg-red-100"
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClear(e);
                  }
                }}
              >
                <X className="h-3 w-3" />
              </span>
            )}
            
            <ChevronDown className={cn(
              "h-4 w-4 shrink-0 opacity-50 transition-transform duration-200",
              open && "rotate-180"
            )} />
          </div>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-full p-0 bg-white/95 backdrop-blur-sm border-white/30 shadow-xl"
        align="start"
      >
        <div className="p-3 border-b border-white/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 bg-white/70 border-white/30 focus:bg-white/90"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
        
        <ScrollArea className="h-60">
          <div className="p-1">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                const isHighlighted = index === highlightedIndex;
                
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors",
                      "hover:bg-blue-50/80 focus:bg-blue-50/80",
                      isSelected && "bg-blue-100/80 text-blue-900",
                      isHighlighted && "bg-blue-50/80",
                      option.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {option.icon && (
                        <div className="flex-shrink-0">{option.icon}</div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{option.label}</div>
                        {option.description && (
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <Check className="ml-2 h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
        
        {multiple && selectedValues.length > 0 && (
          <div className="p-3 border-t border-white/20 bg-gray-50/50">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>{selectedValues.length} seleccionados</span>
              {maxSelected && (
                <span>máx. {maxSelected}</span>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default Combobox;
