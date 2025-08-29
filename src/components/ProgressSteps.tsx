import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Step {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action?: {
    label: string;
    url: string;
  };
}

interface ProgressStepsProps {
  title: string;
  description?: string;
  steps: Step[];
}

export function ProgressSteps({ title, description, steps }: ProgressStepsProps) {
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <Card className="bg-gradient-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {title}
              <Badge variant="secondary" className="text-xs">
                {completedSteps}/{totalSteps}
              </Badge>
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="text-2xl font-bold text-primary">
            {Math.round(progressPercentage)}%
          </div>
        </div>
        <div className="w-full bg-accent rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <h4 className={`font-medium ${step.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {step.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {step.action && !step.completed && (
                  <Button asChild variant="outline" size="sm">
                    <a href={step.action.url}>
                      {step.action.label}
                      <ArrowRight className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}