import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "default" | "lg";
}

const sizes = {
  sm: "h-4 w-4",
  default: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingSpinner({ className, size = "default" }: LoadingSpinnerProps) {
  // Japanese-inspired minimalist design using two rotating lines
  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{
          border: "2px solid transparent",
          borderTopColor: "currentColor",
          borderRightColor: "currentColor",
          borderRadius: "50%",
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1.2,
          ease: "linear",
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute inset-[2px]"
        style={{
          border: "2px solid transparent",
          borderBottomColor: "currentColor",
          borderLeftColor: "currentColor",
          borderRadius: "50%",
          opacity: 0.6,
        }}
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 1.8,
          ease: "linear",
          repeat: Infinity,
        }}
      />
    </div>
  );
}
