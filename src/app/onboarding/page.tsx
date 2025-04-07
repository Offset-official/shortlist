"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import interviewImg from "../../../public/assets/interview1.png";
import { IoEye, IoEyeOff } from "react-icons/io5";

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
// Replace the previous country dropdown with a new AllCountriesDropdown component
import { AllCountriesDropdown } from "@/components/AllCountriesDropdown";
import { DreamCompaniesComboBox } from "@/components/DreamCompaniesComboBox";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

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
  skills: z.string().min(1, "Skills are required"),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const STEP_FIELD_NAMES = [
  "name",
  "email_password",
  "country",
  "university",
  "dreamCompanies",
  "skills",
];

export default function OnboardingForm() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { data: session } = useSession();

  // If the user is already logged in, log them out automatically.
  useEffect(() => {
    if (session) {
      // You can customize options (like redirect URL) if needed.
      signOut({ redirect: false });
    }
  }, [session]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      country: "",
      university: "",
      dreamCompanies: [],
      skills: "",
    },
  });

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    try {
      // 1) Register user
      const registerPayload = {
        name: data.name,
        email: data.email,
        password: data.password,
        location: data.country,
        collegeName: data.university,
        dreamCompanies: data.dreamCompanies,
        skills: data.skills.split(",").map((s) => s.trim()),
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

      // 2) On successful registration, log the user in (saving session info)
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        alert(signInResult.error);
        return;
      }

      // 3) Hold on the final step and then redirect
      setIsRedirecting(true);
      router.push("/");
    } catch (err) {
      console.error("Onboarding sign up error:", err);
      alert("Something went wrong during onboarding.");
    }
  };

  // Validate each step—note that for the "email_password" step, we perform a server-side email check
  const validateCurrentStep = async (currentStepNumber: number) => {
    const stepKey = STEP_FIELD_NAMES[currentStepNumber - 1];

    switch (stepKey) {
      case "email_password": {
        const localIsValid = await form.trigger(["email", "password"]);
        if (!localIsValid) return false;

        const emailValue = form.getValues("email");
        try {
          const response = await fetch(`/api/check-email?email=${encodeURIComponent(emailValue)}`);
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
      }
      case "dreamCompanies":
        return form.trigger("dreamCompanies");
      default:
        return form.trigger(stepKey);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="relative w-[75vw] h-[75vh] shadow-lg">
        <div className="flex h-full">
          {/* Left side */}
          <div className="flex w-[40%] flex-col items-center justify-center relative">
            <div className="w-[80%] h-[70%] bg-transparent px-[10%] flex items-center justify-center">
              <Image
                src={interviewImg}
                alt="Interview"
                className="w-full h-full object-cover object-center rounded-lg shadow-md"
                priority
              />
            </div>
            <div className="w-full flex flex-row items-center justify-center mt-4">
              <p className="mb-2 text-xl mr-3 font-bold">
                Get placed at companies like
              </p>
              <RotatingText
                texts={["Google", "Microsoft", "Netflix", "Meta"]}
                mainClassName="px-1 sm:px-2 md:px-3 bg-accent text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
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
                                onChange={(selectedCountry: string) => onChange(selectedCountry)}
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
                  <DreamCompaniesComboBox control={form.control} name="dreamCompanies" />
                </Step>

                {/* Step 6: Skills */}
                <Step>
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your top skills</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="text"
                            placeholder="List top skills (comma separated)"
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
