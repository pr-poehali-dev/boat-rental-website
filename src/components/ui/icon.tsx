
import { LucideIcon, LucideProps } from "lucide-react";
import * as icons from "lucide-react";
import { cn } from "@/lib/utils";

type IconName = keyof typeof icons;

interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
  fallback?: IconName;
  className?: string;
  size?: number;
}

const Icon = ({ name, fallback = "CircleAlert", className, size = 24, ...props }: IconProps) => {
  const LucideIcon = (icons[name] as LucideIcon) || (icons[fallback] as LucideIcon);

  return <LucideIcon className={cn("", className)} size={size} {...props} />;
};

export default Icon;
