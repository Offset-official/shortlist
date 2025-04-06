"use client";
import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import RotatingText from "@/components/reactbits/RotatingText";
import Stepper, { Step } from "@/components/reactbits/Stepper"; 
import { Card } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Country, CountryDropdown } from "@/components/country-dropdown";

// Zod schema
const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(1, "Country is required"),
  university: z.string().min(1, "University is required"),
  skills: z.string().min(1, "Skills are required"),
});

type FormSchemaType = z.infer<typeof FormSchema>;

// This array helps us map step# -> field name
const STEP_FIELD_NAMES = ["name", "email", "country", "university", "skills"];

export default function OnboardingForm() {
  // Setup react-hook-form
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
      university: "",
      skills: "",
    },
  });

  // Called once final step is done
  const onSubmit: SubmitHandler<FormSchemaType> = (data) => {
    console.log("Onboarding completed:", data);
  };

  // This function is called whenever user clicks "Next"
  // *except* on the final step, where Stepper calls onFinalStepCompleted.
  const validateCurrentStep = async (currentStepNumber: number) => {
    // Convert step # (1-based) to a field name
    const fieldName = STEP_FIELD_NAMES[currentStepNumber - 1];
    // Trigger validation for that single field
    const isValid = await form.trigger(fieldName);
    return isValid; // if false, user can't proceed
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="relative w-[70vw] h-[70vh] shadow-lg">
        <div className="flex h-full">
          {/* Left side (30%) blank */}
          <div className="flex w-[40%] relative">
  {/* Absolutely positioned container, 30% up from the bottom */}
  <div className="absolute bottom-[15%] w-full flex flex-row items-center justify-center">
    {/* "Get placed at" label */}
    <p className="mb-2 text-xl mr-3 font-bold">Get placed at</p>
    {/* Your rotating text */}
    <RotatingText
      texts={["Google", "Microsoft", "Apple", "Quizizz"]}
      mainClassName="px-1 sm:px-2 md:px-3 bg-accent text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
      staggerFrom={"last"}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-120%" }}
      staggerDuration={0.025}
      splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1 font-bold text-xl"
      transition={{ type: "spring", damping: 40, stiffness: 400 }}
      rotationInterval={2000}
    />
</div>
          </div>
          <div className="w-[60%] flex flex-col justify-center p-6">
            <Form {...form}>
              <Stepper
                initialStep={1}
                onStepChange={(step) => console.log("Current Step:", step)}
                onFinalStepCompleted={() => form.handleSubmit(onSubmit)()}
                backButtonText="Previous"
                nextButtonText="Next"
                className="w-full h-full"
                // Our new prop that runs per-step validation:
                onNextStepValidate={validateCurrentStep}
              >
                {/* Step 1: "name" */}
                <Step>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What is your name?</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter your name"
                            autoComplete="off"
                            className="w-full p-3 border border-border rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>

                {/* Step 2: "email" */}
                <Step>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What is your email?</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="email"
                            placeholder="Enter your email"
                            autoComplete="off"
                            className="w-full p-3 border border-border rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>

                {/* Step 3: "country" */}
                <Step>
                  <FormField
                    control={form.control}
                    name="country"
                    render={() => (
                      <FormItem>
                        <FormLabel>Which country are you from?</FormLabel>
                        <FormControl>
                          <Controller
                            control={form.control}
                            name="country"
                            render={({ field: { onChange, value } }) => (
                              <CountryDropdown
                                placeholder="Select your country"
                                defaultValue={value}
                                onChange={(country: Country) =>
                                  onChange(country.alpha3)
                                }
                              />
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>

                {/* Step 4: "university" */}
                <Step>
                  <FormField
                    control={form.control}
                    name="university"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name of university</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter your university"
                            autoComplete="off"
                            className="w-full p-3 border border-border rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>

                {/* Step 5: "skills" */}
                <Step>
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Top 5 skills</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="text"
                            placeholder="List your top 5 skills (comma separated)"
                            autoComplete="off"
                            className="w-full p-3 border border-border rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>

              </Stepper>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
}
