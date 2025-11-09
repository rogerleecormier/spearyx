import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CTACardProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick?: () => void;
  buttonVariant?: "default" | "secondary" | "outline" | "ghost";
  className?: string;
}

export function CTACard({
  title,
  description,
  buttonText,
  onButtonClick,
  buttonVariant = "default",
  className = "",
}: CTACardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onButtonClick} variant={buttonVariant}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
