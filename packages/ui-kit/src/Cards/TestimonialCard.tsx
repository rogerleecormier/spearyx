import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
  className?: string;
}

export function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  rating,
  className = "",
}: TestimonialCardProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        {rating && (
          <div className="flex gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={i < rating ? "text-yellow-400" : "text-slate-300"}
              >
                ★
              </span>
            ))}
          </div>
        )}
        <p className="text-slate-700 italic mb-4">"{quote}"</p>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={avatar} alt={author} />
            <AvatarFallback>{author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-slate-900">{author}</p>
            {role && <p className="text-sm text-slate-500">{role}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
