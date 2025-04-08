"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
} from "@/components/ui/command";
import { Check } from "lucide-react"; // or any icon you like from lucide
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Controller } from "react-hook-form";

const COMPANIES = [
  "Google",
  "Meta",
  "Netflix",
  "Microsoft",
  "Quizizz",
  "LinkedIn",
  "Amazon",
  "NVIDIA",
  "Other",
];

export function DreamCompaniesComboBox({ control, name }: { control: any; name: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormField
          control={control}
          name={name}
          render={() => (
            <FormItem>
              <FormLabel>Select up to 2 Dream Companies</FormLabel>
              <FormControl>
                <MultiSelectPopover
                  selectedValues={field.value || []}
                  onChange={(val) => field.onChange(val)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    />
  );
}

function MultiSelectPopover({
  selectedValues,
  onChange,
}: {
  selectedValues: string[];
  onChange: (values: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  // Filter companies by query
  const filteredCompanies =
    query === ""
      ? COMPANIES
      : COMPANIES.filter((company) =>
          company.toLowerCase().includes(query.toLowerCase())
        );

  // Toggle a company in/out of the array
  const handleSelect = (company: string) => {
    // If it's already selected, remove it
    if (selectedValues.includes(company)) {
      onChange(selectedValues.filter((c) => c !== company));
    } else {
      // Only add if fewer than 2 have been chosen
      if (selectedValues.length < 2) {
        onChange([...selectedValues, company]);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="w-full rounded-md border bg-transparent px-3 py-2 text-left text-sm focus:outline-none"
      >
        {/* Display the selected items or a placeholder */}
        {selectedValues.length > 0
          ? selectedValues.join(", ")
          : "Select up to 2 companies"}
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[250px]">
        <Command>
          <CommandInput
            placeholder="Search companies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {filteredCompanies.map((company) => {
                const isSelected = selectedValues.includes(company);
                return (
                  <CommandItem
                    key={company}
                    onSelect={() => handleSelect(company)}
                  >
                    {company}
                    {isSelected && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
