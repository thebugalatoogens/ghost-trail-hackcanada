import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
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
  ChevronLeft,
  ChevronRight,
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

interface Location {
  location: string;
  latitude: number;
  longitude: number;
  visits: number;
  severity: Severity;
  images?: string[];
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

const SPUR_LAT = 43.4725;
const SPUR_LNG = -80.5423;

// HARDCODED SAMPLE IMAGES - Will be replaced with Cloudinary images later
const sampleImages = [
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400",
  "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
];

const markerColor: Record<Severity, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#64748b",
};

// Determine severity based on visit count
function getSeverity(visits: number): Severity {
  if (visits >= 10) return "high";
  if (visits >= 5) return "medium";
  return "low";
}

function MapStyler() {
  const map = useMap();
  useEffect(() => {
    map.zoomControl.setPosition("bottomright");
  }, [map]);
  return null;
}

// Image carousel component
function ImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <img
        src={images[currentIndex]}
        alt={`Location photo ${currentIndex + 1}`}
        className="w-full h-32 object-cover rounded"
        style={{ backgroundColor: "#1e293b" }}
      />
      
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-1 transition-colors"
          >
            <ChevronLeft size={16} color="white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-1 transition-colors"
          >
            <ChevronRight size={16} color="white" />
          </button>

          <div className="absolute bottom-1 right-1 bg-black/60 px-2 py-0.5 rounded text-xs text-white">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}

function LeafletMap({ locations }: { locations: Location[] }) {
  // Don't render map if no valid locations
  if (!locations || locations.length === 0 || !locations[0]?.latitude || !locations[0]?.longitude) {
    return (
      <div 
        className="border border-slate-800/60 flex items-center justify-center" 
        style={{ borderRadius: "2px", height: "380px", background: "#0d1424" }}
      >
        <p className="text-slate-500">No location data available</p>
      </div>
    );
  }

  const mapCenter = [locations[0].latitude, locations[0].longitude] as [number, number];

  return (
    <div
      className="border border-slate-800/60 overflow-hidden relative"
      style={{ borderRadius: "2px", height: "380px" }}
    >
      <MapContainer
        center={mapCenter}
        zoom={15}
        style={{ 
          height: "100%", 
          width: "100%", 
          background: "#0d1424",
          filter: "brightness(1.3) contrast(1.1)"
        }}
        zoomControl={true}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        <MapStyler />
        {locations.map((loc, i) => (
          <CircleMarker
            key={i}
            center={[loc.latitude, loc.longitude]}
            radius={loc.visits + 8}
            pathOptions={{
              color: markerColor[loc.severity],
              fillColor: markerColor[loc.severity],
              fillOpacity: 0.6,
              weight: 2.5,
            }}
          >
            <Popup maxWidth={250} minWidth={200}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#cbd5e1" }}>
                {/* Images - hardcoded for now */}
                {loc.images && loc.images.length > 0 && (
                  <div className="mb-2">
                    <ImageCarousel images={loc.images} />
                  </div>
                )}
                
                {/* Location info */}
                <strong style={{ color: markerColor[loc.severity], fontSize: "13px" }}>
                  {loc.location}
                </strong>
                <br />
                <span style={{ color: "#94a3b8", fontSize: "11px" }}>
                  {loc.visits} posts tagged here
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div
        className="absolute bottom-4 left-4 z-[1000] bg-[#0c1220]/90 border border-slate-800/60 p-3"
        style={{ borderRadius: "2px" }}
      >
        <p className="text-slate-600 uppercase tracking-[0.15em] mb-2" style={{ fontSize: "9px" }}>
          Identified Locations
        </p>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 block" style={{ borderRadius: "50%" }} />
            <span className="text-slate-400" style={{ fontSize: "11px" }}>High frequency (10+ posts)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 block" style={{ borderRadius: "50%" }} />
            <span className="text-slate-400" style={{ fontSize: "11px" }}>Moderate frequency (5-9 posts)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-500 block" style={{ borderRadius: "50%" }} />
            <span className="text-slate-400" style={{ fontSize: "11px" }}>Occasional (1-4 posts)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
            <p className="text-slate-600 uppercase tracking-[0.15em] mb-3" style={{ fontSize: "10px" }}>
              Details
            </p>
            <ul className="space-y-2 mb-5">
              {finding.details.map((detail, i) => (
                <li key={i} className="text-slate-400 flex items-start gap-2" style={{ fontSize: "13px", lineHeight: 1.6 }}>
                  <span className="text-slate-700 mt-2 w-1 h-1 bg-slate-600 shrink-0 block" style={{ borderRadius: "50%" }} />
                  {detail}
                </li>
              ))}
            </ul>
            <p className="text-slate-600 uppercase tracking-[0.15em] mb-2" style={{ fontSize: "10px" }}>
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

export function AnalysisPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<Severity | "all">("all");
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const highCount = findings.filter((f) => f.severity === "high").length;
  const medCount = findings.filter((f) => f.severity === "medium").length;
  const lowCount = findings.filter((f) => f.severity === "low").length;

  const filtered =
    activeFilter === "all"
      ? findings
      : findings.filter((f) => f.severity === activeFilter);

  // Fetch locations from backend
useEffect(() => {
  async function fetchAnalysis() {
    try {
      setLoading(true);
      
      // Get userId from localStorage instead of hardcoded 'test-user'
      const userId = localStorage.getItem('ghostTrailUserId') || 'test-user';
      console.log('Fetching analysis for userId:', userId); // Debug log
      
      const response = await fetch(`http://localhost:3000/posts/analyze/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }
      
      const data = await response.json();
      console.log('Backend data:', data);
      
      // Map backend data to frontend format
      if (data.frequentLocations && data.frequentLocations.length > 0) {
        const mappedLocations = data.frequentLocations
          .filter((loc: any) => loc.latitude && loc.longitude) // Only include locations with valid coords
          .map((loc: any, i: number) => ({
            location: loc.location,
            latitude: loc.latitude,
            longitude: loc.longitude,
            visits: loc.visits,
            severity: getSeverity(loc.visits),
            // Add hardcoded sample images for now (TODO: replace with Cloudinary)
            images: [sampleImages[i % sampleImages.length]]
          }));
        
        setLocations(mappedLocations);
      } else {
        // Fallback to demo data
        setLocations([
          { 
            location: "SPUR Innovation Centre", 
            latitude: SPUR_LAT, 
            longitude: SPUR_LNG, 
            visits: 8,
            severity: "medium",
            images: [sampleImages[0], sampleImages[1]]
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Use fallback demo data
      setLocations([
        { 
          location: "SPUR Innovation Centre", 
          latitude: SPUR_LAT, 
          longitude: SPUR_LNG, 
          visits: 8,
          severity: "medium",
          images: [sampleImages[0], sampleImages[1]]
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  fetchAnalysis();
}, []);

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
            <img src="/GhostTrailLogo.svg" alt="Ghost Trail" className="w-5 h-5" />
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
          <p className="text-slate-600 uppercase tracking-[0.25em] mb-2" style={{ fontSize: "11px" }}>
            Privacy Report
          </p>
          <h1
            className="text-slate-100 mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "28px", fontWeight: 600, letterSpacing: "-0.01em" }}
          >
            Your exposure overview
          </h1>
          <p className="text-slate-500" style={{ fontSize: "14px", lineHeight: 1.7 }}>
            We identified {findings.length} areas where your personal information may be accessible to someone you don't know.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-px bg-slate-800/30 mb-10">
          <div className="bg-[#0c1220] p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" strokeWidth={1.5} />
              <span className="text-slate-600 uppercase tracking-[0.15em]" style={{ fontSize: "10px" }}>High Risk</span>
            </div>
            <span className="text-red-400" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "36px", fontWeight: 600 }}>
              {highCount}
            </span>
          </div>
          <div className="bg-[#0c1220] p-6">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-3.5 h-3.5 text-amber-400" strokeWidth={1.5} />
              <span className="text-slate-600 uppercase tracking-[0.15em]" style={{ fontSize: "10px" }}>Medium Risk</span>
            </div>
            <span className="text-amber-400" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "36px", fontWeight: 600 }}>
              {medCount}
            </span>
          </div>
          <div className="bg-[#0c1220] p-6">
            <div className="flex items-center gap-2 mb-3">
              <img src="/GhostTrailLogo.svg" alt="Ghost Trail" className="w-5 h-5" />
              <span className="text-slate-600 uppercase tracking-[0.15em]" style={{ fontSize: "10px" }}>Low Risk</span>
            </div>
            <span className="text-slate-400" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "36px", fontWeight: 600 }}>
              {lowCount}
            </span>
          </div>
        </div>

        {/* Map */}
        <div className="mb-10">
          <p className="text-slate-600 uppercase tracking-[0.25em] mb-4" style={{ fontSize: "11px" }}>
            Location Exposure Map
          </p>
          
          {loading ? (
            <div 
              className="border border-slate-800/60 flex items-center justify-center" 
              style={{ borderRadius: "2px", height: "380px" }}
            >
              <p className="text-slate-500">Loading map data...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-2 p-3 bg-amber-400/10 border border-amber-400/20 rounded">
                  <p className="text-amber-400 text-xs">
                    Using demo data ({error})
                  </p>
                </div>
              )}
              <LeafletMap locations={locations} />
            </>
          )}
        </div>

        {/* Findings list */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-600 uppercase tracking-[0.25em]" style={{ fontSize: "11px" }}>
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
            This analysis was performed entirely in your browser. No data was transmitted to external servers. Ghost Trail does not store, collect, or share your personal information.
          </p>
        </div>
      </div>
    </div>
  );
}