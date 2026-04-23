import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Swatch Component for Color and Size Selection
 * Used in Product Details and Filter Sidebar
 * 
 * @param {string} type - 'color' or 'size'
 * @param {string} value - The value of the swatch
 * @param {boolean} selected - Whether this swatch is selected
 * @param {function} onSelect - Callback when swatch is clicked
 * @param {boolean} disabled - Whether the swatch is disabled
 * @param {string} color - For color swatches, the hex color value
 * @param {string} label - Optional label to display
 */
function Swatch({
  type = "color",
  value,
  selected = false,
  onSelect,
  disabled = false,
  color,
  label,
  className,
}) {
  const isColor = type === "color";
  const isSize = type === "size";

  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect(value);
    }
  };

  if (isColor) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "relative w-10 h-10 rounded-full border-2 transition-all",
          selected
            ? "border-black scale-110"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        style={{ backgroundColor: color }}
        aria-label={`Color: ${label || value}`}
        aria-pressed={selected}
      >
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Check className="w-5 h-5 text-white stroke-[3]" />
          </div>
        )}
      </button>
    );
  }

  if (isSize) {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-full transition-all",
          selected
            ? "bg-black text-white"
            : "bg-white text-black border border-gray-300 hover:border-black",
          disabled && "opacity-50 cursor-not-allowed bg-gray-100",
          className
        )}
        aria-label={`Size: ${label || value}`}
        aria-pressed={selected}
      >
        {label || value}
      </button>
    );
  }

  return null;
}

export default Swatch;
