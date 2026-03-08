import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { Upload, ArrowRight, Shield, Eye, MapPin, Users, AlertCircle } from "lucide-react";
import { MapBackground } from "./MapBackground";
import JSZip from "jszip";

export function HomePage() {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".zip")) {
        setError("Please upload a ZIP file");
        return;
      }

      setIsProcessing(true);
      setError("");
      setProgress("Reading ZIP file...");

      try {
        // 1. Read ZIP file
        const zip = await JSZip.loadAsync(file);
        
        // 2. Find posts.json (Instagram exports have different structures)
        let postsFile = zip.file("posts_1.json") || 
                        zip.file("posts.json") ||
                        zip.file("your_instagram_activity/posts/posts_1.json");
        
        // Handle Mac re-zipped files with extra folder layer
        if (!postsFile) {
          const files = Object.keys(zip.files);
          const postsPath = files.find(f => f.endsWith('posts_1.json') || f.endsWith('posts.json'));
          if (postsPath) {
            postsFile = zip.file(postsPath);
          }
        }
        
        if (!postsFile) {
          throw new Error("Could not find posts.json in ZIP file. Make sure you uploaded an Instagram data export.");
        }

        setProgress("Parsing posts...");
        
        // 3. Parse JSON
        const postsText = await postsFile.async("text");
        const posts = JSON.parse(postsText);
        
        console.log(`Found ${posts.length} posts`);
        
        // 4. Generate userId and SAVE IT to localStorage
        const userId = "user-" + Date.now();
        localStorage.setItem('ghostTrailUserId', userId); // ← ADDED
        
        let successCount = 0;
        
        for (let i = 0; i < posts.length; i++) {
          const post = posts[i];
          
          setProgress(`Processing post ${i + 1}/${posts.length}...`);
          
          // Extract location (optional - backend can geocode from photo tags)
          const locationName = post.location?.name || 
                              post.title?.match(/at (.+)/)?.[1] || 
                              null;
          
          // Extract timestamp
          const timestamp = post.media?.[0]?.creation_timestamp 
            ? new Date(post.media[0].creation_timestamp * 1000)
            : new Date(post.creation_timestamp * 1000);
          
          // NEW: Extract photos from ZIP
          const photos = [];
          if (post.media && post.media.length > 0) {
            for (const media of post.media) {
              if (media.uri) {
                // Only process image files (skip .mp4, .heic for now)
                const isImage = media.uri.match(/\.(jpg|jpeg|png|gif)$/i);
                
                if (isImage) {
                  const mediaFile = zip.file(media.uri);
                  if (mediaFile) {
                    try {
                      const mediaBlob = await mediaFile.async("blob");
                      photos.push({
                        blob: mediaBlob,
                        filename: media.uri.split('/').pop() || 'photo.jpg'
                      });
                    } catch (err) {
                      console.warn(`Failed to extract photo ${media.uri}:`, err);
                    }
                  }
                }
              }
            }
          }
          
          // Skip if no location AND no photos (backend needs at least one to geocode)
          if (!locationName && photos.length === 0) continue;
          
          // Send to backend
          try {
            // Use FormData if we have photos, otherwise use JSON
            if (photos.length > 0) {
              const formData = new FormData();
              formData.append('userId', userId);
              formData.append('caption', post.title || "");
              formData.append('location', locationName);
              formData.append('timestamp', timestamp.toISOString());
              
              // Add photos to FormData
              photos.forEach((photo) => {
                formData.append('photos', photo.blob, photo.filename);
              });
              
              await fetch('http://localhost:3000/posts', {
                method: 'POST',
                body: formData // Send as FormData with photos
              });
            } else {
              // No photos - send as JSON (keeps backward compatibility)
              await fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: userId,
                  caption: post.title || "",
                  location: locationName,
                  timestamp: timestamp.toISOString()
                })
              });
            }
            successCount++;
          } catch (err) {
            console.error('Failed to send post:', err);
          }
        }
        
        setProgress(`Analysis complete! Processed ${successCount} posts with locations.`);
        
        // 5. Navigate to analysis page
        setTimeout(() => {
          navigate("/analysis");
        }, 1000);
        
      } catch (err) {
        console.error('Error processing ZIP:', err);
        setError(err instanceof Error ? err.message : 'Failed to process ZIP file');
        setIsProcessing(false);
      }
    },
    [navigate]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const stats = [
    {
      value: "7.5M",
      label: "people are stalked annually in the U.S.",
      icon: Eye,
    },
    {
      value: "67%",
      label: "of stalking victims know their stalker",
      icon: Users,
    },
    {
      value: "1 in 3",
      label: "stalkers use digital tools to track victims",
      icon: MapPin,
    },
    {
      value: "82%",
      label: "of Instagram profiles expose location data",
      icon: Shield,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0c1220] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        <MapBackground />

        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-6 z-10">
          <div className="flex items-center gap-2.5">
            <img src="/GhostTrailLogo.svg" alt="Ghost Trail" className="w-5 h-5" />
            <span
              className="tracking-[0.2em] text-slate-300 uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "13px", letterSpacing: "0.2em" }}
            >
              Ghost Trail
            </span>
          </div>
          
          
          <a
            href="#how-it-works"
            className="text-slate-500 hover:text-slate-300 transition-colors"
            style={{ fontSize: "13px", letterSpacing: "0.05em" }}
          >
            How it works
          </a>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p
            className="text-slate-500 uppercase tracking-[0.25em] mb-6"
            style={{ fontSize: "11px" }}
          >
            Instagram Privacy Audit
          </p>
          <h1
            className="text-white mb-6"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(36px, 5vw, 64px)",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            See what a stranger
            <br />
            can learn about you.
          </h1>
          <p
            className="text-slate-400 max-w-lg mx-auto mb-12"
            style={{ fontSize: "16px", lineHeight: 1.7 }}
          >
            Upload your Instagram data export and Ghost Trail will show you
            exactly what personal information is publicly accessible — and how
            to lock it down.
          </p>

          {/* Upload zone */}
          <div
            className={`relative mx-auto max-w-md border transition-all duration-300 cursor-pointer ${
              isDragging
                ? "border-slate-400 bg-slate-400/5"
                : "border-slate-700/60 bg-white/[0.02] hover:border-slate-600 hover:bg-white/[0.03]"
            }`}
            style={{ borderRadius: "2px", padding: "40px 32px" }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-5 h-5 border border-slate-400 border-t-transparent animate-spin"
                  style={{ borderRadius: "50%" }}
                />
                <p className="text-slate-400" style={{ fontSize: "14px" }}>
                  {progress}
                </p>
              </div>
            ) : (
              <>
                <Upload
                  className="w-5 h-5 text-slate-500 mx-auto mb-4"
                  strokeWidth={1.5}
                />
                <p className="text-slate-300 mb-1" style={{ fontSize: "14px" }}>
                  Drop your Instagram ZIP here
                </p>
                <p className="text-slate-600" style={{ fontSize: "12px" }}>
                  or click to browse files
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleInputChange}
              disabled={isProcessing}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 mx-auto max-w-md p-4 bg-red-400/10 border border-red-400/20 rounded flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm text-left">{error}</p>
            </div>
          )}

          {/* Skip link for demo */}
          <button
            onClick={() => navigate("/analysis")}
            className="mt-6 inline-flex items-center gap-2 text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
            style={{ fontSize: "12px", letterSpacing: "0.05em" }}
          >
            View sample analysis
            <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative border-t border-slate-800/60 bg-[#0a0f1a]">
        <div className="max-w-5xl mx-auto px-8 py-24">
          <p
            className="text-slate-600 uppercase tracking-[0.25em] mb-2 text-center"
            style={{ fontSize: "11px" }}
          >
            The problem
          </p>
          <h2
            className="text-center text-slate-200 mb-16"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "28px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            Stalking in the digital age
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-800/30">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#0a0f1a] p-8 flex flex-col"
              >
                <stat.icon
                  className="w-4 h-4 text-slate-600 mb-6"
                  strokeWidth={1.5}
                />
                <span
                  className="text-white mb-2 block"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "32px",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-slate-500"
                  style={{ fontSize: "13px", lineHeight: 1.6 }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-slate-800/60 bg-[#0c1220]">
        <div className="max-w-3xl mx-auto px-8 py-24">
          <p
            className="text-slate-600 uppercase tracking-[0.25em] mb-2 text-center"
            style={{ fontSize: "11px" }}
          >
            Process
          </p>
          <h2
            className="text-center text-slate-200 mb-16"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "28px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            How it works
          </h2>
          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Download your data",
                desc: "Go to Instagram Settings, then Privacy and Security, and request a download of your data in JSON format.",
              },
              {
                step: "02",
                title: "Upload the ZIP",
                desc: "Drop your downloaded ZIP file into Ghost Trail. Your data is processed entirely in the browser — nothing is sent to a server.",
              },
              {
                step: "03",
                title: "Review your exposure",
                desc: "See a detailed breakdown of what personal information is accessible, from location patterns to contact details and tagged associations.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-8 items-start"
              >
                <span
                  className="text-slate-700 shrink-0"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginTop: "2px",
                  }}
                >
                  {item.step}
                </span>
                <div>
                  <h3
                    className="text-slate-200 mb-2"
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-slate-500"
                    style={{ fontSize: "14px", lineHeight: 1.7 }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-[#0a0f1a] px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-700" strokeWidth={1.5} />
            <span
              className="text-slate-700 uppercase tracking-[0.15em]"
              style={{ fontSize: "11px" }}
            >
              Ghost Trail
            </span>
          </div>
          <span className="text-slate-700" style={{ fontSize: "11px" }}>
            Your data never leaves your browser.
          </span>
        </div>
      </footer>
    </div>
  );
}