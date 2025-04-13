"use client";
import React, { useCallback, useState, forwardRef, useEffect } from "react";

// shadcn UI components
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// utils
import { cn } from "@/lib/utils";

// assets
import { ChevronDown, CheckIcon } from "lucide-react";

// data
import { countries } from "country-data-list";

// Country interface
import { Country } from "@/interfaces/misc_interfaces"; // Assuming you have a Country interface defined in this path


// Dropdown props now expects onChange to return a string
interface AllCountriesDropdownProps {
  options?: Country[];
  onChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
  placeholder?: string;
}

const AllCountriesDropdownComponent = (
  {
    options = countries.all.filter(
      (country: Country) =>
        country.status !== "deleted" && country.ioc !== "PRK"
    ),
    onChange,
    defaultValue,
    disabled = false,
    placeholder = "Select a country",
    ...props
  }: AllCountriesDropdownProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>(
    defaultValue ? options.find((country) => country.alpha3 === defaultValue) : undefined
  );

  // Update selectedCountry if defaultValue changes
  useEffect(() => {
    if (defaultValue) {
      const country = options.find((c) => c.alpha3 === defaultValue);
      if (country) {
        setSelectedCountry(country);
      }
    }
  }, [defaultValue, options]);

  const handleSelect = useCallback(
    (country: Country) => {
      setSelectedCountry(country);
      // Pass only the country's alpha3 code to the parent
      onChange?.(country.alpha3);
      setOpen(false);
    },
    [onChange]
  );

  // Use consistent input styling
  const triggerClasses = cn(
    "w-full p-3 border border-border rounded-md flex items-center justify-between text-sm focus:outline-none"
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger ref={ref} className={triggerClasses} disabled={disabled} {...props}>
        {selectedCountry ? (
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {selectedCountry.name}
          </span>
        ) : (
          <span>{placeholder}</span>
        )}
        <ChevronDown size={16} />
      </PopoverTrigger>
      <PopoverContent collisionPadding={10} side="bottom" className="min-w-[--radix-popper-anchor-width] p-0">
        <Command className="w-full max-h-[200px] sm:max-h-[270px]">
          <CommandList>
            {/* Removed sticky class to fix scrolling */}
            <div className="bg-popover">
              <CommandInput placeholder="Search country..." />
            </div>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {options.filter((x) => x.name).map((option, key: number) => (
                <CommandItem
                  className="flex items-center w-full gap-2"
                  key={key}
                  onSelect={() => handleSelect(option)}
                >
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                    {option.name}
                  </span>
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0",
                      option.name === selectedCountry?.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

AllCountriesDropdownComponent.displayName = "AllCountriesDropdownComponent";

export const AllCountriesDropdown = forwardRef(AllCountriesDropdownComponent);
