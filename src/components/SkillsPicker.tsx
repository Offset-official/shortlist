"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { X, Check } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type Skill = {
  value: string
  label: string
}

const defaultSkills: Skill[] = [
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "tailwindcss", label: "Tailwind CSS" },
  { value: "nodejs", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  // Additional skills
  { value: "graphql", label: "GraphQL" },
  { value: "docker", label: "Docker" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "aws", label: "AWS" },
  { value: "azure", label: "Azure" },
  { value: "gcp", label: "GCP" },
  { value: "sql", label: "SQL" },
  { value: "nosql", label: "NoSQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "redis", label: "Redis" },
  { value: "linux", label: "Linux" },
  { value: "git", label: "Git" },
  { value: "bash", label: "Bash" },
  { value: "svelte", label: "Svelte" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
  { value: "flutter", label: "Flutter" },
  { value: "dart", label: "Dart" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "elixir", label: "Elixir" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
]

interface SkillsPickerProps {
  skills?: Skill[]
  onChange?: (selectedSkills: Skill[]) => void
}

export default function SkillsPicker({
  skills = defaultSkills,
  onChange,
}: SkillsPickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([])
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSelect = (skill: Skill) => {
    // If skill is already selected, do nothing
    if (selectedSkills.some((s) => s.value === skill.value)) return

    // Only add if fewer than 5 have been chosen
    if (selectedSkills.length < 5) {
      const newSelectedSkills = [...selectedSkills, skill]
      setSelectedSkills(newSelectedSkills)
      onChange?.(newSelectedSkills)
    }
    setInputValue("")
  }

  const handleRemove = (skill: Skill) => {
    const newSelectedSkills = selectedSkills.filter((s) => s.value !== skill.value)
    setSelectedSkills(newSelectedSkills)
    onChange?.(newSelectedSkills)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      inputValue &&
      !skills.some((s) => s.value === inputValue.toLowerCase())
    ) {
      // Only add custom skill if fewer than 5
      if (selectedSkills.length < 5) {
        const newSkill = { value: inputValue.toLowerCase(), label: inputValue }
        handleSelect(newSkill)
      }
      e.preventDefault()
    }
  }

  const placeholderText =
    selectedSkills.length > 0
      ? selectedSkills.map((skill) => skill.label).join(", ")
      : "Select up to 5 skills (required)"

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        {/* 
          Use a bare PopoverTrigger with classes similar to 
          DreamCompaniesComboBox, so there's no distinct button style.
        */}
        <PopoverTrigger
          className="h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-left text-sm focus:outline-none"
          onClick={() => inputRef.current?.focus()}
        >
          {placeholderText}
        </PopoverTrigger>

        {/* Adjust popover width to match your design (e.g., w-[250px]) */}
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              ref={inputRef}
              placeholder="Search skills..."
              value={inputValue}
              onValueChange={setInputValue}
              onKeyDown={handleKeyDown}
              className="h-10 px-3 text-sm focus:outline-none"
            />
            <CommandList>
              <CommandEmpty>
                {inputValue ? (
                  <div className="flex items-center justify-between px-2 py-1.5 text-sm">
                    <span>Add "{inputValue}" as a new skill</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (selectedSkills.length < 5) {
                          const newSkill = {
                            value: inputValue.toLowerCase(),
                            label: inputValue,
                          }
                          handleSelect(newSkill)
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                ) : (
                  "No skills found."
                )}
              </CommandEmpty>
              <CommandGroup>
                {skills.map((skill) => (
                  <CommandItem
                    key={skill.value}
                    value={skill.value}
                    onSelect={() => handleSelect(skill)}
                    className="flex items-center justify-between"
                  >
                    {skill.label}
                    {selectedSkills.some((s) => s.value === skill.value) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display removable badges when skills are selected. */}
      {selectedSkills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <Badge
              key={skill.value}
              variant="secondary"
              className="px-3 py-1 bg-tertiary text-sm cursor-default"
            >
              {skill.label}
              <button
                type="button"
                onClick={() => handleRemove(skill)}
                className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {skill.label}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
