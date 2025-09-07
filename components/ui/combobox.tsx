"use client";

import { useState } from "react";
import { Button } from "./button";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import { Input } from "./input";
import { ScrollArea } from "./scroll-area";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface ComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "Seleccione...",
  emptyMessage = "No hay opciones",
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {value ? options.find((o) => o.value === value)?.label : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <ScrollArea className="h-48">
          {filtered.length ? (
            <ul className="p-1">
              {filtered.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    className={cn(
                      "w-full text-left p-2 rounded hover:bg-muted",
                      value === opt.value && "bg-muted"
                    )}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export default Combobox;
