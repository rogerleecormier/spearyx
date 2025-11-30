import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Check } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: string | number;
  description?: string;
  features: string[];
  buttonText?: string;
  buttonVariant?: "default" | "secondary" | "outline" | "ghost";
  onButtonClick?: () => void;
  featured?: boolean;
  currency?: string;
  billingPeriod?: string;
  className?: string;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  buttonText = "Get Started",
  buttonVariant = "default",
  onButtonClick,
  featured = false,
  currency = "$",
  billingPeriod = "/month",
  className = "",
}: PricingCardProps) {
  return (
    <Card
      className={`relative overflow-hidden transition-all ${
        featured ? "ring-2 ring-red-500 md:scale-105" : ""
      } ${className}`}
    >
      {featured && (
        <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 text-sm font-semibold">
          Popular
        </div>
      )}
      <CardHeader>
        {featured && <div className="h-8" />}
        <CardTitle className="text-2xl">{name}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <div className="mt-4">
          <span className="text-5xl font-bold">
            {currency}
            {price}
          </span>
          <span className="text-slate-600 ml-2">{billingPeriod}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          onClick={onButtonClick}
          variant={featured ? "default" : buttonVariant}
          className="w-full"
        >
          {buttonText}
        </Button>
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
