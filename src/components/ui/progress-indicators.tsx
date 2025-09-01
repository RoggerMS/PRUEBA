import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, Clock, AlertCircle, Upload, Send, Save } from 'lucide-react';
import { LoadingSpinner } from './loading';

type StepStatus = 'pending' | 'current' | 'completed' | 'error';

interface Step {
  id: string;
  title: string;
  description?: string;
  status: StepStatus;
}

interface StepperProps {
  steps: Step[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Stepper: React.FC<StepperProps> = ({ 
  steps, 
  className, 
  orientation = 'horizontal' 
}) => {
  const getStepIcon = (step: Step, index: number) => {
    switch (step.status) {
      case 'completed':
        return <Check className="h-4 w-4 text-white" />;
      case 'current':
        return <span className="text-sm font-semibold text-white">{index + 1}</span>;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-white" />;
      default:
        return <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>;
    }
  };

  const getStepClasses = (step: Step) => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'current':
        return 'bg-primary border-primary';
      case 'error':
        return 'bg-red-500 border-red-500';
      default:
        return 'bg-muted border-muted-foreground/20';
    }
  };

  const getConnectorClasses = (currentStep: Step, nextStep?: Step) => {
    if (currentStep.status === 'completed') {
      return 'bg-green-500';
    }
    return 'bg-muted';
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                getStepClasses(step)
              )}>
                {getStepIcon(step, index)}
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'mt-2 h-8 w-0.5 transition-colors',
                  getConnectorClasses(step, steps[index + 1])
                )} />
              )}
            </div>
            <div className="flex-1 pb-8">
              <h3 className={cn(
                'text-sm font-medium',
                step.status === 'current' ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.title}
              </h3>
              {step.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
              getStepClasses(step)
            )}>
              {getStepIcon(step, index)}
            </div>
            <div className="mt-2 text-center">
              <h3 className={cn(
                'text-xs font-medium',
                step.status === 'current' ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.title}
              </h3>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={cn(
              'mx-4 h-0.5 flex-1 transition-colors',
              getConnectorClasses(step, steps[index + 1])
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
  className?: string;
}

export const FormProgress: React.FC<FormProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  className
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-muted-foreground">
          Paso {currentStep} de {totalSteps}
        </span>
        <span className="text-sm font-medium text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {stepTitles && (
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          {stepTitles.map((title, index) => (
            <span 
              key={index}
              className={cn(
                'transition-colors',
                index < currentStep ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              {title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

interface ActionProgressProps {
  action: 'saving' | 'uploading' | 'sending' | 'processing' | 'loading';
  progress?: number;
  message?: string;
  className?: string;
}

export const ActionProgress: React.FC<ActionProgressProps> = ({
  action,
  progress,
  message,
  className
}) => {
  const getActionConfig = () => {
    switch (action) {
      case 'saving':
        return {
          icon: <Save className="h-4 w-4" />,
          defaultMessage: 'Guardando...',
          color: 'text-blue-500'
        };
      case 'uploading':
        return {
          icon: <Upload className="h-4 w-4" />,
          defaultMessage: 'Subiendo archivos...',
          color: 'text-green-500'
        };
      case 'sending':
        return {
          icon: <Send className="h-4 w-4" />,
          defaultMessage: 'Enviando...',
          color: 'text-purple-500'
        };
      case 'processing':
        return {
          icon: <LoadingSpinner size="sm" />,
          defaultMessage: 'Procesando...',
          color: 'text-orange-500'
        };
      default:
        return {
          icon: <LoadingSpinner size="sm" />,
          defaultMessage: 'Cargando...',
          color: 'text-primary'
        };
    }
  };

  const config = getActionConfig();

  return (
    <div className={cn('flex items-center gap-3 p-4 bg-muted/50 rounded-lg', className)}>
      <div className={cn('animate-pulse', config.color)}>
        {config.icon}
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          {message || config.defaultMessage}
        </p>
        
        {typeof progress === 'number' && (
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}% completado
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div 
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300 ease-out',
                  config.color.replace('text-', 'bg-')
                )}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface PulseIndicatorProps {
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export const PulseIndicator: React.FC<PulseIndicatorProps> = ({
  isActive,
  size = 'md',
  color = 'primary',
  className
}) => {
  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const colorClasses = {
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className={cn('relative', className)}>
      <div className={cn(
        'rounded-full',
        sizeClasses[size],
        colorClasses[color],
        isActive && 'animate-pulse'
      )} />
      {isActive && (
        <div className={cn(
          'absolute inset-0 rounded-full animate-ping',
          sizeClasses[size],
          colorClasses[color],
          'opacity-75'
        )} />
      )}
    </div>
  );
};

interface TimerProgressProps {
  duration: number; // in seconds
  onComplete?: () => void;
  className?: string;
  showTime?: boolean;
}

export const TimerProgress: React.FC<TimerProgressProps> = ({
  duration,
  onComplete,
  className,
  showTime = true
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft <= 0 && onComplete) {
        onComplete();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const progress = ((duration - timeLeft) / duration) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={cn('space-y-2', className)}>
      {showTime && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">
            Tiempo restante
          </span>
          <span className="text-sm font-mono font-medium text-foreground">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      )}
      
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className={cn(
            'h-2 rounded-full transition-all duration-1000 ease-linear',
            timeLeft > duration * 0.3 ? 'bg-primary' : 
            timeLeft > duration * 0.1 ? 'bg-yellow-500' : 'bg-red-500'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};