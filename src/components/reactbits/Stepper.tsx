import React, { useState, Children, useRef, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// 1) Add onNextStepValidate in the prop definitions
export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  disableStepIndicators = true,
  renderStepIndicator,
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = "Back",
  nextButtonText = "Continue",
  className = "",
  onNextStepValidate, // <-- new prop
  ...rest
}: {
  children: React.ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clickedStep: number) => void;
  }) => React.ReactNode;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  className?: string;
  /**
   * Optional callback to validate the current step.
   * Return `true` to proceed, or `false` to block the transition.
   * This can also be an async function returning a Promise<boolean>.
   */
  onNextStepValidate?: (currentStepNumber: number) => boolean | Promise<boolean>;
  [key: string]: any; // catches any other props
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);

  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  // 2) Call onNextStepValidate before proceeding
  const handleNext = async () => {
    if (!isLastStep) {
      if (onNextStepValidate) {
        const valid = await onNextStepValidate(currentStep);
        if (!valid) {
          // If validation failed, stay here
          return;
        }
      }
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  // 3) Also validate before completing final step
  const handleComplete = async () => {
    if (onNextStepValidate) {
      const valid = await onNextStepValidate(currentStep);
      if (!valid) return;
    }
    setDirection(1);
    updateStep(totalSteps + 1);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center w-full h-full ${className}`}
      {...rest}
    >
      <div className="flex flex-col w-full h-full rounded-2xl">
        {/* Step Indicator Row */}
        <div className="flex w-full items-center p-8">
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLast = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: (clicked) => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    },
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    currentStep={currentStep}
                    disableStepIndicators={disableStepIndicators}
                    onClickStep={(clicked) => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    }}
                  />
                )}

                {isNotLast && (
                  <StepConnector isComplete={currentStep > stepNumber} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step Content */}
        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className="px-8 pb-8">
            <div
              className={`mt-10 flex ${
                currentStep !== 1 ? "justify-between" : "justify-end"
              }`}
            >
              {currentStep !== 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="
                    transition-all duration-300
                    rounded px-2 py-1
                    text-[var(--muted-foreground)]
                    hover:text-[var(--foreground)]
                    disabled:pointer-events-none disabled:opacity-50
                    cursor-pointer
                  "
                  disabled={currentStep === 1}
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <Button
                type="button"
                onClick={isLastStep ? handleComplete : handleNext}
                variant="outline"
                className="
                  transition-all duration-300
                  flex items-center justify-center
                  px-3 py-2
                  disabled:pointer-events-none disabled:opacity-50
                  cursor-pointer
                "
                {...nextButtonProps}
              >
                {isLastStep ? "Complete" : nextButtonText}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** StepContentWrapper: animates each step in/out */
function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
}: {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: React.ReactNode;
}) {
  const [parentHeight, setParentHeight] = useState(0);

  return (
    <motion.div
      className="relative overflow-hidden flex-1"
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: "spring", duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={(h) => setParentHeight(h)}
          >
            <div className="p-8">{children}</div>
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** SlideTransition: slides steps horizontally */
function SlideTransition({
  children,
  direction,
  onHeightReady,
}: {
  children: React.ReactNode;
  direction: number;
  onHeightReady: (h: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="absolute left-0 right-0 top-0"
    >
      {children}
    </motion.div>
  );
}

const stepVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? "-50%" : "50%",
    opacity: 0,
  }),
};

/** Step container */
export function Step({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/** StepIndicator: inactive, active, or complete */
function StepIndicator({
  step,
  currentStep,
  disableStepIndicators,
  onClickStep,
}: {
  step: number;
  currentStep: number;
  disableStepIndicators: boolean;
  onClickStep: (step: number) => void;
}) {
  const status =
    currentStep === step
      ? "active"
      : currentStep < step
      ? "inactive"
      : "complete";

  const handleClick = () => {
    if (!disableStepIndicators && step !== currentStep) {
      onClickStep(step);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative cursor-pointer outline-none"
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: {
            scale: 1,
            backgroundColor: "rgb(34,34,34)", // Or var(--border), etc.
            color: "rgb(163,163,163)",
          },
          active: {
            scale: 1,
            backgroundColor: "var(--accent)",
            color: "var(--accent-foreground)",
          },
          complete: {
            scale: 1,
            backgroundColor: "var(--accent)",
            // You can pick a different color for "complete" text
            color: "rgb(59,130,246)", // a blue from Tailwind
          },
        }}
        transition={{ duration: 0.3 }}
        className="
          flex items-center justify-center
          h-8 w-8
          rounded-full
          font-semibold
        "
      >
        {status === "complete" ? (
          <CheckIcon className="h-4 w-4" />
        ) : status === "active" ? (
          <div className="h-3 w-3 rounded-full bg-[var(--foreground)]" />
        ) : (
          <span className="text-sm">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

/** StepConnector: line between indicators */
function StepConnector({ isComplete }: { isComplete: boolean }) {
  const lineVariants = {
    incomplete: {
      width: "0%",
      backgroundColor: "transparent",
    },
    complete: {
      width: "100%",
      backgroundColor: "var(--accent)",
    },
  };

  return (
    <div className="relative mx-2 h-[2px] flex-1 overflow-hidden rounded bg-[var(--muted-foreground)]">
      <motion.div
        className="absolute left-0 top-0 h-full"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? "complete" : "incomplete"}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

/** Animated check icon for complete steps. */
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: "tween", ease: "easeOut", duration: 0.3 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
