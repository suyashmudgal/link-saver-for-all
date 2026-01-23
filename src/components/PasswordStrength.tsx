import { useMemo } from "react";

interface PasswordStrengthProps {
  password: string;
}

const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const strength = useMemo(() => {
    let score = 0;
    if (!password) return { score: 0, label: "", color: "" };

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 1, label: "Weak", color: "bg-destructive" };
    if (score <= 4) return { score: 2, label: "Medium", color: "bg-accent" };
    if (score <= 5) return { score: 3, label: "Strong", color: "bg-green-500" };
    return { score: 4, label: "Very Strong", color: "bg-green-600" };
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              level <= strength.score ? strength.color : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${strength.score <= 1 ? "text-destructive" : strength.score <= 2 ? "text-accent" : "text-green-500"}`}>
        {strength.label}
      </p>
    </div>
  );
};

export default PasswordStrength;
