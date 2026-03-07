import { MapPin, Home, Coffee } from "lucide-react";

const pinColor = "rgb(100, 116, 139, 0.45)";
const pinFill = "rgba(100, 116, 139, 0.15)";

const pins = [
  // Left side
  { top: "14%", left: "8%" },
  { top: "38%", left: "12%" },
  { top: "58%", left: "6%" },
  { top: "76%", left: "15%" },
  { top: "88%", left: "10%" },
  // Right side
  { top: "20%", left: "82%" },
  { top: "42%", left: "88%" },
  { top: "64%", left: "85%" },
  { top: "80%", left: "78%" },
  { top: "92%", left: "90%" },
  // Bottom middle area (below the fold text)
  { top: "72%", left: "35%" },
  { top: "85%", left: "52%" },
  { top: "78%", left: "62%" },
  { top: "90%", left: "42%" },
];

export function MapBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <img
        src="/src/imports/dark-city-grid-background-vector-37627554.jpg.svg"
        alt=""
        className="w-full h-full object-cover opacity-40"
      />

      {/* Map pins */}
      {pins.map((pin, i) => (
        <div
          key={i}
          className="absolute"
          style={{ top: pin.top, left: pin.left }}
        >
          <MapPin
            style={{ color: pinColor }}
            size={18}
            strokeWidth={1.5}
            fill={pinFill}
          />
        </div>
      ))}

      {/* House icon — left side */}
      <div
        className="absolute"
        style={{ top: "48%", left: "5%" }}
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-slate-500/8 border border-slate-400/12">
          <Home style={{ color: pinColor }} size={14} strokeWidth={1.5} />
        </div>
      </div>

      {/* Coffee icon — right side */}
      <div
        className="absolute"
        style={{ top: "52%", left: "90%" }}
      >
        <div className="flex items-center justify-center w-7 h-7 rounded-sm bg-slate-500/8 border border-slate-400/12">
          <Coffee style={{ color: pinColor }} size={14} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}