import { STYLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface StyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Interior Style
        </label>
        <span className="text-xs text-muted-foreground">{STYLES.length} styles available</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {STYLES.map((style) => (
          <button
            key={style.id}
            onClick={() => onChange(style.id)}
            className={cn(
              "group relative flex flex-col items-start overflow-hidden rounded-xl border-2 transition-all hover:border-primary/50 text-left bg-card",
              value === style.id 
                ? "border-primary shadow-sm" 
                : "border-transparent shadow-xs hover:shadow-md"
            )}
          >
            <div className="aspect-[4/3] w-full overflow-hidden">
              <img 
                src={style.image} 
                alt={style.name}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
                  value === style.id ? "scale-105" : ""
                )}
              />
              <div className={cn(
                "absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center",
                value === style.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                {value === style.id && (
                  <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" />
                )}
              </div>
            </div>
            <div className="p-3 w-full bg-card">
              <div className="font-semibold text-sm">{style.name}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{style.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
