import { Progress } from "@/components/ui/progress";

interface AddPropertyStepHeaderProps {
  title: string;
  description: string;
  step: number;
  totalSteps: number;
  stepLabel: string;
  completionLabel?: string;
}

const AddPropertyStepHeader = ({
  title,
  description,
  step,
  totalSteps,
  stepLabel,
  completionLabel,
}: AddPropertyStepHeaderProps) => {
  const progressValue = Math.round((step / totalSteps) * 100);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-primary font-semibold">
            STEP {step} OF {totalSteps}: {stepLabel.toUpperCase()}
          </span>
          <span className="text-muted-foreground">
            {completionLabel ?? `${progressValue}% Completed`}
          </span>
        </div>
        <Progress value={progressValue} className="h-2 bg-muted" />
      </div>
    </div>
  );
};

export default AddPropertyStepHeader;
