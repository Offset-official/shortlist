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
import { toast } from "react-hot-toast";

// Import your SkillsPicker component and its Skill type.
import SkillsPicker, { type Skill } from "@/components/SkillsPicker";

// ----------------------------
// 1) Update the Zod Schema for Recruiter
// ----------------------------
const FormSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  values: z.array(z.string()).min(1, "Please enter at least one company value"),
  description: z.string().optional().or(z.literal("")),
  companySize: z.string().optional().or(z.literal("")),
  linkedInUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const STEP_FIELD_NAMES = [
  "companyName",
  "email_password",
  "website",
  "location",
  "industry",
  "values",
  "description",
  "companySize",
  "linkedInUrl",
];

const RecruiterOnboarding = () => {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { data: session } = useSession();

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      companyName: "",
      email: "",
      password: "",
      website: "",
      location: "",
      industry: "",
      values: [],
      description: "",
      companySize: "",
      linkedInUrl: "",
    },
  });

  const onSubmit: SubmitHandler<FormSchemaType> = async (data) => {
    try {
      const registerPayload = { ...data };
      const res = await fetch("/api/register_recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerPayload),
      });
      if (!res.ok) {
        const { error } = await res.json();
        toast.error(error || "Something went wrong with registration");
        return;
      }
      setIsRedirecting(true);
      if (session) {
        await signOut({ redirect: false });
      }
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
        type: "recruiter",
      });
      if (signInResult?.error) {
        toast.error(signInResult.error);
        return;
      }
      toast.success("Registration successful! Redirecting...");
      router.push("/");
    } catch (err) {
      console.error("Onboarding sign up error:", err);
      toast.error("Something went wrong during onboarding.");
    }
  };

  const validateCurrentStep = async (currentStepNumber: number) => {
    const stepKey = STEP_FIELD_NAMES[currentStepNumber - 1];

    if (stepKey === "email_password") {
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
        toast.error("Error checking email uniqueness");
        return false;
      }
      return true;
    } else if (stepKey === "values") {
      return form.trigger("values");
    } else {
      return form.trigger(stepKey as keyof FormSchemaType);
    }
  };

  return (
    <Card className="relative w-[75vw] h-[75vh] shadow-lg">
      <div className="text-foreground font-bold px-12 mt-8 text-3xl flex justify-between">
        <div>Recruiter Onboarding </div>

        <Link
          href="/onboarding?type=candidate"
          className="text-sm font-normal text-muted-foreground/50 hover:text-foreground/70"
        >
          Candidate?
        </Link>
      </div>
      <div className="flex h-full">
        <div className="flex w-[40%] flex-col items-center justify-center relative">
          <div className="relative w-[300px] h-[300px] bg-transparent px-[10%]">
            <Image src="/assets/report.png" alt="Interview" fill priority />
          </div>
          <div className="w-full flex flex-row items-center justify-center mt-4">
            <p className="mb-2 text-xl mr-3 font-bold">
              Get the best talent for your company
            </p>
          </div>
        </div>

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
                <Step>
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What is your company name?</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter your company name"
                            autoComplete="off"
                            className="w-full p-3 border border-border rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>

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

                <Step>
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company website</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter your company website"
                            autoComplete="off"
                            className="w-full p-3 border border-border rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>

                <Step>
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company location</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter your company location"
                            autoComplete="off"
                            className="w-full p-3 border border-border rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>

                <Step>
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter your industry"
                            autoComplete="off"
                            className="w-full p-3 border border-border rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>

                <Step>
                  <FormField
                    control={form.control}
                    name="values"
                    render={({ field: { onChange, value } }) => (
                      <FormItem>
                        <FormLabel>Company values</FormLabel>
                        <FormControl>
                          <SkillsPicker
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

                <Step>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company description</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter your company description"
                            autoComplete="off"
                            className="w-full p-3 border border-border rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>

                <Step>
                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company size</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter your company size"
                            autoComplete="off"
                            className="w-full p-3 border border-border rounded-md"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Step>

                <Step>
                  <FormField
                    control={form.control}
                    name="linkedInUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL</FormLabel>
                        <FormControl>
                          <input
                            {...field}
                            type="text"
                            placeholder="Enter your LinkedIn URL"
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
          )}
        </div>
      </div>
    </Card>
  );
};

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