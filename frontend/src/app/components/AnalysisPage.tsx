import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Shield,
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Camera,
  Mail,
  Phone,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  Link,
  Tag,
} from "lucide-react";

type Severity = "high" | "medium" | "low";

interface Finding {
  id: string;
  category: string;
  icon: React.ElementType;
  severity: Severity;
  title: string;
  description: string;
  details: string[];
  recommendation: string;
}

const findings: Finding[] = [
  {
    id: "location",
    category: "Location",
    icon: MapPin,
    severity: "high",
    title: "Location patterns identifiable",
    description:
      "12 posts contain geotag data that reveals a consistent pattern between two locations, likely a home and workplace.",
    details: [
      "Home area identified: posts geotagged within a 0.3 km radius on weekday evenings and weekends",
      "Workplace area identified: posts geotagged within a 0.2 km radius on weekday mornings",
      "Frequent café location tagged 3 times in the past month",
      "Gym location tagged in stories with consistent schedule (Mon, Wed, Fri evenings)",
    ],
    recommendation:
      "Remove geotags from existing posts. Disable automatic location tagging in Instagram settings. Avoid tagging specific venues in stories.",
  },
  {
    id: "schedule",
    category: "Activity",
    icon: Clock,
    severity: "high",
    title: "Daily schedule exposed",
    description:
      "Posting patterns reveal a predictable daily routine that could be used to anticipate your whereabouts.",
    details: [
      "Morning posts typically between 7:00 – 8:30 AM (likely commute)",
      "Lunch-hour activity spike at 12:15 – 12:45 PM",
      "Evening posts between 6:00 – 7:30 PM (likely post-work)",
      "Weekend activity shifted later, 10:00 AM – 12:00 PM",
    ],
    recommendation:
      "Use scheduled posting tools to decouple post timing from real activity. Avoid posting in real time from identifiable locations.",
  },
  {
    id: "contacts",
    category: "Contacts",
    icon: Users,
    severity: "medium",
    title: "Social circle mapped",
    description:
      "Tagged photos and comments reveal a network of 23 close contacts with identifiable relationship patterns.",
    details: [
      "8 individuals tagged across multiple posts (frequent contacts)",
      "3 accounts consistently interact via comments (possible family)",
      "Relationship status inferable from co-tagged posts with one specific account",
      "Workplace colleagues identifiable through shared location tags",
    ],
    recommendation:
      "Review tag settings to require approval. Limit who can tag you. Untag yourself from posts that reveal close contacts.",
  },
  {
    id: "photos",
    category: "Media",
    icon: Camera,
    severity: "medium",
    title: "Background details in photos",
    description:
      "Several images contain identifiable information in the background, including street signs and building numbers.",
    details: [
      "Street name visible in 3 photos (cross-referenceable with location data)",
      "Building number visible in 1 post (narrows home location to specific address)",
      "Car license plate partially visible in 2 photos",
      "Workplace badge visible in 1 story screenshot",
    ],
    recommendation:
      "Review existing photos for background details. Crop or blur identifiable elements. Be conscious of what appears behind you in new posts.",
  },
  {
    id: "email",
    category: "Contact Info",
    icon: Mail,
    severity: "medium",
    title: "Email address discoverable",
    description:
      "Your business email is accessible through the account's public contact options.",
    details: [
      "Business email visible on profile contact button",
      "Same email found in bio link website WHOIS records",
    ],
    recommendation:
      "Switch to a dedicated public-facing email. Remove contact button from profile if not needed for business.",
  },
  {
    id: "phone",
    category: "Contact Info",
    icon: Phone,
    severity: "high",
    title: "Phone number linked",
    description:
      "A phone number is associated with the account and may be searchable through Instagram's contact sync feature.",
    details: [
      "Phone number used for two-factor authentication is linked to the account",
      "Account discoverable by anyone who has this number in their contacts",
    ],
    recommendation:
      "Use an authenticator app instead of SMS for 2FA. Disable the setting that allows others to find you by phone number.",
  },
  {
    id: "links",
    category: "External",
    icon: Link,
    severity: "low",
    title: "External accounts linked",
    description:
      "Bio and posts reference external platforms that reveal additional personal information.",
    details: [
      "LinkedIn profile linked in bio (reveals full name, employer, education)",
      "Twitter/X handle referenced in 2 posts",
      "Personal website domain registered under real name",
    ],
    recommendation:
      "Audit linked accounts for personal data. Consider using a pseudonym for public-facing profiles. Use privacy-protected domain registration.",
  },
  {
    id: "tags",
    category: "Metadata",
    icon: Tag,
    severity: "low",
    title: "Hashtag patterns reveal interests",
    description:
      "Consistently used hashtags reveal specific hobbies, communities, and group affiliations.",
    details: [
      "Fitness community hashtags used 14 times (specific gym identified)",
      "Neighborhood-specific hashtags used 8 times",
      "Event-specific hashtags tie you to specific dates and locations",
    ],
    recommendation:
      "Vary your hashtag usage. Avoid location-specific or community-specific hashtags that narrow your identity.",
  },
];

const severityConfig: Record<Severity, { label: string; color: string; bg: string }> = {
  high: { label: "High", color: "text-red-400", bg: "bg-red-400/10" },
  medium: { label: "Medium", color: "text-amber-400", bg: "bg-amber-400/10" },
  low: { label: "Low", color: "text-slate-400", bg: "bg-slate-400/10" },
};

function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);
  const sev = severityConfig[finding.severity];
  const Icon = finding.icon;

  return (
    <div className="border border-slate-800/60 bg-white/[0.015]" style={{ borderRadius: "2px" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 flex items-start gap-4 hover:bg-white/[0.01] transition-colors cursor-pointer"
      >
        <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" strokeWidth={1.5} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-slate-200" style={{ fontSize: "14px", fontWeight: 500 }}>
              {finding.title}
            </span>
            <span
              className={`${sev.color} ${sev.bg} px-2 py-0.5 shrink-0`}
              style={{ fontSize: "10px", letterSpacing: "0.05em", borderRadius: "1px" }}
            >
              {sev.label}
            </span>
          </div>
          <p className="text-slate-500" style={{ fontSize: "13px", lineHeight: 1.6 }}>
            {finding.description}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" strokeWidth={1.5} />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" strokeWidth={1.5} />
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-0 ml-8">
          <div className="border-t border-slate-800/40 pt-4">
            <p
              className="text-slate-600 uppercase tracking-[0.15em] mb-3"
              style={{ fontSize: "10px" }}
            >
              Details
            </p>
            <ul className="space-y-2 mb-5">
              {finding.details.map((detail, i) => (
                <li
                  key={i}
                  className="text-slate-400 flex items-start gap-2"
                  style={{ fontSize: "13px", lineHeight: 1.6 }}
                >
                  <span className="text-slate-700 mt-2 w-1 h-1 bg-slate-600 shrink-0 block" style={{ borderRadius: "50%" }} />
                  {detail}
                </li>
              ))}
            </ul>
            <p
              className="text-slate-600 uppercase tracking-[0.15em] mb-2"
              style={{ fontSize: "10px" }}
            >
              Recommendation
            </p>
            <p className="text-slate-300" style={{ fontSize: "13px", lineHeight: 1.6 }}>
              {finding.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MockMap() {
  return (
    <div className="border border-slate-800/60 bg-[#0d1424] overflow-hidden relative" style={{ borderRadius: "2px" }}>
      <svg
        viewBox="0 0 800 400"
        className="w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" opacity="0.4" />
          </pattern>
        </defs>
        <rect width="800" height="400" fill="#0d1424" />
        <rect width="800" height="400" fill="url(#grid)" />

        {/* Roads */}
        <g stroke="#1e293b" strokeWidth="2" fill="none">
          <line x1="0" y1="200" x2="800" y2="200" />
          <line x1="400" y1="0" x2="400" y2="400" />
          <line x1="0" y1="100" x2="800" y2="100" strokeWidth="1" />
          <line x1="0" y1="300" x2="800" y2="300" strokeWidth="1" />
          <line x1="200" y1="0" x2="200" y2="400" strokeWidth="1" />
          <line x1="600" y1="0" x2="600" y2="400" strokeWidth="1" />
          <path d="M100 50 Q300 150 500 80 Q700 10 750 120" strokeWidth="1.5" />
          <path d="M50 350 Q250 280 450 320 Q650 360 780 300" strokeWidth="1.5" />
        </g>

        {/* Blocks */}
        <g fill="#151d2e" stroke="none" opacity="0.6">
          <rect x="220" y="110" width="160" height="70" />
          <rect x="420" y="110" width="160" height="70" />
          <rect x="220" y="210" width="160" height="70" />
          <rect x="420" y="210" width="160" height="70" />
          <rect x="30" y="210" width="150" height="70" />
          <rect x="620" y="210" width="150" height="70" />
          <rect x="30" y="110" width="150" height="70" />
          <rect x="620" y="110" width="150" height="70" />
        </g>

        {/* Connecting dashed path between points */}
        <path
          d="M180 170 Q250 200 300 250 Q360 310 500 260 Q580 230 620 160"
          stroke="#ef4444"
          strokeWidth="1"
          fill="none"
          strokeDasharray="6 4"
          opacity="0.4"
        />

        {/* Heatmap zones */}
        <circle cx="180" cy="170" r="50" fill="#ef4444" opacity="0.06" />
        <circle cx="180" cy="170" r="30" fill="#ef4444" opacity="0.08" />
        <circle cx="620" cy="160" r="45" fill="#ef4444" opacity="0.06" />
        <circle cx="620" cy="160" r="25" fill="#ef4444" opacity="0.08" />
        <circle cx="500" cy="260" r="35" fill="#f59e0b" opacity="0.06" />
        <circle cx="500" cy="260" r="20" fill="#f59e0b" opacity="0.08" />

        {/* Location pins */}
        <g>
          {/* Home */}
          <g transform="translate(180, 158)">
            <path d="M0-16 C-6-16-10-12-10-6 C-10 2 0 12 0 12 S10 2 10-6 C10-12 6-16 0-16Z" fill="#ef4444" opacity="0.9" />
            <path d="M-3-8 L0-11 L3-8 L3-4 L-3-4Z" fill="#0d1424" />
          </g>
          {/* Work */}
          <g transform="translate(620, 148)">
            <path d="M0-16 C-6-16-10-12-10-6 C-10 2 0 12 0 12 S10 2 10-6 C10-12 6-16 0-16Z" fill="#ef4444" opacity="0.9" />
            <rect x="-3" y="-10" width="6" height="5" fill="#0d1424" />
          </g>
          {/* Cafe */}
          <g transform="translate(500, 248)">
            <path d="M0-16 C-6-16-10-12-10-6 C-10 2 0 12 0 12 S10 2 10-6 C10-12 6-16 0-16Z" fill="#f59e0b" opacity="0.9" />
            <circle cx="0" cy="-6" r="3" fill="#0d1424" />
          </g>
          {/* Gym */}
          <g transform="translate(300, 240)">
            <path d="M0-14 C-5-14-8-10-8-5 C-8 1 0 10 0 10 S8 1 8-5 C8-10 5-14 0-14Z" fill="#64748b" opacity="0.7" />
            <circle cx="0" cy="-5" r="2.5" fill="#0d1424" />
          </g>
        </g>

        {/* Labels */}
        <text x="180" y="186" textAnchor="middle" fill="#ef4444" fontSize="9" fontFamily="Inter, sans-serif" opacity="0.7">
          HOME AREA
        </text>
        <text x="620" y="176" textAnchor="middle" fill="#ef4444" fontSize="9" fontFamily="Inter, sans-serif" opacity="0.7">
          WORK AREA
        </text>
        <text x="500" y="276" textAnchor="middle" fill="#f59e0b" fontSize="9" fontFamily="Inter, sans-serif" opacity="0.7">
          FREQUENT
        </text>
      </svg>

      {/* Legend overlay */}
      <div
        className="absolute bottom-4 left-4 bg-[#0c1220]/90 border border-slate-800/60 p-3"
        style={{ borderRadius: "2px" }}
      >
        <p className="text-slate-600 uppercase tracking-[0.15em] mb-2" style={{ fontSize: "9px" }}>
          Identified Locations
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 block" style={{ borderRadius: "50%" }} />
            <span className="text-slate-400" style={{ fontSize: "11px" }}>
              High frequency (home / work)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 block" style={{ borderRadius: "50%" }} />
            <span className="text-slate-400" style={{ fontSize: "11px" }}>
              Moderate frequency
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-500 block" style={{ borderRadius: "50%" }} />
            <span className="text-slate-400" style={{ fontSize: "11px" }}>
              Occasional
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnalysisPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Severity | "all">("all");

  const highCount = findings.filter((f) => f.severity === "high").length;
  const medCount = findings.filter((f) => f.severity === "medium").length;
  const lowCount = findings.filter((f) => f.severity === "low").length;

  const filtered =
    activeFilter === "all"
      ? findings
      : findings.filter((f) => f.severity === activeFilter);

  return (
    <div
      className="min-h-screen bg-[#0c1220] text-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Top bar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800/60">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            style={{ fontSize: "13px" }}
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Back
          </button>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-500" strokeWidth={1.5} />
            <span
              className="text-slate-400 uppercase tracking-[0.15em]"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "12px" }}
            >
              Ghost Trail
            </span>
          </div>
        </div>
        <span className="text-slate-600" style={{ fontSize: "12px" }}>
          Analysis complete
        </span>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <p
            className="text-slate-600 uppercase tracking-[0.25em] mb-2"
            style={{ fontSize: "11px" }}
          >
            Privacy Report
          </p>
          <h1
            className="text-slate-100 mb-3"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "28px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            Your exposure overview
          </h1>
          <p className="text-slate-500" style={{ fontSize: "14px", lineHeight: 1.7 }}>
            We identified {findings.length} areas where your personal
            information may be accessible to someone you don't know.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-px bg-slate-800/30 mb-10">
          <div className="bg-[#0c1220] p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" strokeWidth={1.5} />
              <span
                className="text-slate-600 uppercase tracking-[0.15em]"
                style={{ fontSize: "10px" }}
              >
                High Risk
              </span>
            </div>
            <span
              className="text-red-400"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "36px",
                fontWeight: 600,
              }}
            >
              {highCount}
            </span>
          </div>
          <div className="bg-[#0c1220] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
              <span
                className="text-slate-600 uppercase tracking-[0.15em]"
                style={{ fontSize: "10px" }}
              >
                Medium Risk
              </span>
            </div>
            <span
              className="text-amber-400"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "36px",
                fontWeight: 600,
              }}
            >
              {medCount}
            </span>
          </div>
          <div className="bg-[#0c1220] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
              <span
                className="text-slate-600 uppercase tracking-[0.15em]"
                style={{ fontSize: "10px" }}
              >
                Low Risk
              </span>
            </div>
            <span
              className="text-slate-400"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "36px",
                fontWeight: 600,
              }}
            >
              {lowCount}
            </span>
          </div>
        </div>

        {/* Map */}
        <div className="mb-10">
          <p
            className="text-slate-600 uppercase tracking-[0.25em] mb-4"
            style={{ fontSize: "11px" }}
          >
            Location Exposure Map
          </p>
          <MockMap />
        </div>

        {/* Findings list */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <p
              className="text-slate-600 uppercase tracking-[0.25em]"
              style={{ fontSize: "11px" }}
            >
              Findings
            </p>
            <div className="flex items-center gap-1">
              {(["all", "high", "medium", "low"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 transition-colors cursor-pointer ${
                    activeFilter === filter
                      ? "bg-white/[0.06] text-slate-300"
                      : "text-slate-600 hover:text-slate-400"
                  }`}
                  style={{ fontSize: "11px", borderRadius: "1px", letterSpacing: "0.05em" }}
                >
                  {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filtered.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="border-t border-slate-800/40 pt-6 pb-12">
          <p className="text-slate-600" style={{ fontSize: "12px", lineHeight: 1.7 }}>
            This analysis was performed entirely in your browser. No data was
            transmitted to external servers. Ghost Trail does not store, collect,
            or share your personal information.
          </p>
        </div>
      </div>
    </div>
  );
}
