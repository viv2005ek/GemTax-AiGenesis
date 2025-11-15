import { CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProcessingStepsProps {
  currentStep: number;
}

const steps = [
  { id: 1, name: "Extracting Data", description: "AI is analyzing your documents" },
  { id: 2, name: "Optimizing Taxes", description: "Generating tax-saving recommendations" },
  { id: 3, name: "Reviewing Compliance", description: "Checking UAE VAT & Corporate Tax rules" },
];

export const ProcessingSteps = ({ currentStep }: ProcessingStepsProps) => {
  return (
    <Card className="p-6 shadow-lg">
      <h3 className="font-semibold mb-6 text-lg">Processing Analysis</h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isComplete = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {isComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-success" />
                ) : isCurrent ? (
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-border" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${isCurrent ? 'text-primary' : isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.name}
                </p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
