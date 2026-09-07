'use client';

import React from 'react';
import { HelpCircle, Sparkles, Building2, CheckCircle2, type LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
  size?: number;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  SparklesIcon: Sparkles,
  BuildingIcon: Building2,
  CheckIcon: CheckCircle2,
};

function AppIcon({
  name,
  size = 24,
  className = '',
  onClick,
  disabled = false,
  ...props
}: IconProps) {
  const IconComponent = iconMap[name] || HelpCircle;

  return (
    <IconComponent
      size={size}
      className={`${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={disabled ? undefined : onClick}
      {...props}
    />
  );
}

export default AppIcon;
