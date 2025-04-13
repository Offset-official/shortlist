"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { IoEye, IoEyeOff } from "react-icons/io5";
import Link from "next/link";
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
// Use the new AllCountriesDropdown component.
import { AllCountriesDropdown } from "@/components/AllCountriesDropdown";
import { DreamCompaniesComboBox } from "@/components/DreamCompaniesComboBox";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

// Import your SkillsPicker component and its Skill type.
import SkillsPicker, { type Skill } from "@/components/SkillsPicker";

// ----------------------------
// 1) Update the Zod Schema
// ----------------------------
const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  country: z.string().min(1, "Country is required"),
  university: z.string().min(1, "University is required"),
  dreamCompanies: z
    .array(z.string())
    .min(1, "Please pick at least 1 company")
    .max(3, "Up to 3 companies"),
  // Changed to an array of strings instead of a single string.
  skills: z.array(z.string()).min(1, "Please select at least one skill"),
});

type FormSchemaType = z.infer<typeof FormSchema>;

// Keep the same step identifiers, but ensure the last step references "skills"
const STEP_FIELD_NAMES = [
  "name",
  "email_password",
  "country",
  "university",
  "dreamCompanies",
  "skills",
];

const RecruiterOnboarding = ()=>{
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { data: session } = useSession();

  // -----------------------------------------
  // 2) Update the default values for `skills`
  // -----------------------------------------
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      country: "",
      university: "",
      dreamCompanies: [],
      skills: [], // It's now an array instead of a string
    },
  });

  // -----------------------------------------
  // 3) Update the onSubmit method
  // -----------------------------------------
  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    try {
      // 1) Prepare the registration payload
      const registerPayload = {
        name: data.name,
        email: data.email,
        password: data.password,
        location: data.country,
        collegeName: data.university,
        dreamCompanies: data.dreamCompanies,
        // data.skills is already an array of strings
        skills: data.skills,
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerPayload),
      });

      if (!res.ok) {
        const { error } = await res.json();
        alert(error || "Something went wrong with registration");
        return;
      }

      // 2) Set the UI to "Signing Up..." state.
      setIsRedirecting(true);

      // 3) If there is an existing session, sign out first.
      if (session) {
        await signOut({ redirect: false });
      }

      // 4) Sign in the new user with credentials.
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        alert(signInResult.error);
        return;
      }

      // 5) Redirect to home.
      router.push("/");
    } catch (err) {
      console.error("Onboarding sign up error:", err);
      alert("Something went wrong during onboarding.");
    }
  };

  // -----------------------------------------
  // 4) Validate the current step
  // -----------------------------------------
  const validateCurrentStep = async (currentStepNumber: number) => {
    // Retrieve the special step identifier.
    const stepKey = STEP_FIELD_NAMES[currentStepNumber - 1];

    if (stepKey === "email_password") {
      // Validate both 'email' and 'password' fields.
      const localIsValid = await form.trigger(["email", "password"]);
      if (!localIsValid) return false;

      const emailValue = form.getValues("email");
      try {
        const response = await fetch(
          `/api/check-email?email=${encodeURIComponent(emailValue)}`
        );
        if (!response.ok) return false;
        const data = await response.json();
        if (data.exists) {
          form.setError("email", {
            type: "manual",
            message: "Email is already in use.",
          });
          return false;
        }
      } catch (error) {
        console.error("Error checking email uniqueness:", error);
        return false;
      }
      return true;
    } else if (stepKey === "dreamCompanies") {
      return form.trigger("dreamCompanies");
    } else {
      // For all other cases, assume the key is directly in the schema.
      return form.trigger(stepKey as keyof FormSchemaType);
    }
  };

  return (
      <Card className="relative w-[75vw] h-[75vh] shadow-lg">
      <div className="text-foreground font-bold px-12 mt-8 text-3xl flex justify-between">
        <div>Recruiter Onboarding </div>

        <Link href="/onboarding?type=candidate" className="text-sm font-normal text-muted-foreground/50 hover:text-foreground/70" > Candidate?</Link>
      </div>
        <div className="flex h-full">
          {/* Left side */}
          <div className="flex w-[40%] flex-col items-center justify-center relative">
            <div className="relative w-[300px] h-[300px] bg-transparent px-[10%]">
              <Image
                src="/assets/interview1.png"
                alt="Interview"
                fill
                priority
              />
            </div>
            <div className="w-full flex flex-row items-center justify-center mt-4">
              <p className="mb-2 text-xl mr-3 font-bold">
                Recruiters!!! COME ON BOARD
              </p>
              <RotatingText
               // @ts-ignore
                texts={["Google", "Microsoft", "Netflix", "Meta"]}
                mainClassName="px-1 sm:px-2 md:px-3 bg-accent text-foreground overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
                staggerFrom="last"
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

          {/* Right side */}
          <div className="w-[60%] flex flex-col justify-center p-6">
            {isRedirecting ? (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-2xl font-bold">Signing Up...</p>
              </div>
            ) : (
              <Form {...form}>
                <Stepper
                  initialStep={1}
                  onStepChange={(step) => console.log("Current Step:", step)}
                  onFinalStepCompleted={() => form.handleSubmit(onSubmit)()}
                  backButtonText="Previous"
                  nextButtonText="Next"
                  className="w-full h-full"
                  onNextStepValidate={validateCurrentStep}
                >
                  {/* Step 1: Name */}
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

                  {/* Step 2: Email + Password */}
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
                    <div className="my-4" />
                    <PasswordField form={form} />
                  </Step>

                  {/* Step 3: Country */}
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
                                <AllCountriesDropdown
                                  placeholder="Select your country"
                                  defaultValue={value}
                                  onChange={(selectedCountry: string) =>
                                    onChange(selectedCountry)
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

                  {/* Step 4: University */}
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

                  {/* Step 5: Dream Companies */}
                  <Step>
                    <DreamCompaniesComboBox
                      control={form.control}
                      name="dreamCompanies"
                    />
                  </Step>

                  {/* Step 6: Skills */}
                  <Step>
                    <FormField
                      control={form.control}
                      name="skills"
                      render={({ field: { onChange, value } }) => (
                        <FormItem>
                          <FormLabel>Your top skills</FormLabel>
                          <FormControl>
                            {/* -----------------------------------------
                                Replace text input with SkillsPicker 
                            ----------------------------------------- */}
                            <SkillsPicker
                              // Convert the array of Skill objects to an array of strings
                              // whenever the user selects or removes a skill.
                              onChange={(selectedSkills: Skill[]) => {
                                onChange(selectedSkills.map((s) => s.value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Step>
                </Stepper>
              </Form>
            )}
          </div>
        </div>
      </Card>
  );
}

/** Simple password field with "eye" toggle icons */
function PasswordField({ form }: { form: any }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Set a password</FormLabel>
          <FormControl>
            <div className="relative">
              <input
                {...field}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="off"
                className="w-full p-3 border border-border rounded-md pr-10"
              />
              <div
                className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}


export default RecruiterOnboarding; 