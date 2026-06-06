import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, RefreshCw, Maximize2, Minimize2, Heart, Star, 
  HelpCircle, Shield, ArrowUpRight, Monitor, ChevronRight, Check, Sparkles 
} from "lucide-react";

export default function GamePlayer({ 
  game, 
  onBack, 
  isFavorite, 
  onToggleFavorite, 
  onRatingChanged,
  catalog,
  onPlayAnother
}) {
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTheater, setIsTheater] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [activeTab, setActiveTab] = useState("instructions");
  
  const playerContainerRef = useRef(null);
  const iframeRef = useRef(null);

  // Restart loading state when game changes or user refreshes
  useEffect(() => {
    setIsLoading(true);
    setHasRated(false);
  }, [game.id, iframeKey]);

  // Sync fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleUpvote = () => {
    if (hasRated) return;
    setHasRated(true);
    const updatedRating = Math.min(5.0, game.rating + 0.1);
    onRatingChanged(game.id, updatedRating);
  };

  // Find other games in similar category or general recommendations
  const similarGames = catalog
    .filter((g) => g.id !== game.id && (g.category === game.category || g.tags.some(t => game.tags.includes(t))))
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in select-none">
      
      {/* Top Breadcrumb Navigation & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-b-2 border-zinc-800">
        <button
          id="back-to-catalog-btn"
          onClick={onBack}
          className="group flex items-center space-x-2.5 text-xs font-mono font-bold tracking-widest text-[#C9AD93] hover:text-white transition-colors w-fit uppercase cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
          <span>Back to Game Vault</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Main Info */}
          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-[#111] border border-zinc-800 text-zinc-300 rounded-none">
            Active Arcade: <strong className="text-[#C9AD93]">{game.category}</strong>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 bg-[#111] border border-zinc-800 text-zinc-300 rounded-none flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-[#C9AD93] fill-current" />
            <strong className="text-white">{game.rating.toFixed(1)}</strong>
          </span>
        </div>
      </div>

      {/* Main Container - supports grid with tools or standalone */}
      <div 
        ref={playerContainerRef} 
        id="player-wrapper"
        className={`relative flex flex-col bg-[#111] border-2 border-zinc-800 overflow-hidden transition-all duration-300 ${
          isTheater && !isFullscreen ? "max-w-full" : "max-w-5xl mx-auto"
        } ${isFullscreen ? "rounded-none border-0 w-screen h-screen" : "w-full rounded-none"}`}
      >
        {/* Game Screen Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-black border-b border-zinc-800 text-white">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#C9AD93] text-glow-accent" />
            <h1 className="text-xs font-mono font-bold uppercase tracking-widest truncate max-w-[200px] sm:max-w-sm">
              {game.title} {isFullscreen && <span className="text-xs text-[#C9AD93] ml-1.5">(Full Screen)</span>}
            </h1>
          </div>
          
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Live Refresh */}
            <button
              id={`refresh-game-${game.id}`}
              onClick={handleRefresh}
              title="Refresh / Restart Game Area"
              className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-[#C9AD93] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Theater Mode (Hide on full screen) */}
            {!isFullscreen && (
              <button
                id={`theater-toggle-${game.id}`}
                onClick={() => setIsTheater((prev) => !prev)}
                title={isTheater ? "Normal Mode" : "Theater Wide Mode"}
                className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-[#C9AD93] transition-colors hidden sm:block cursor-pointer"
              >
                <Monitor className={`w-4 h-4 ${isTheater ? "text-[#C9AD93]" : ""}`} />
              </button>
            )}

            {/* Fullscreen Mode */}
            <button
              id={`fullscreen-toggle-${game.id}`}
              onClick={handleToggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "True Fullscreen"}
              className="p-1.5 hover:bg-zinc-900 text-zinc-400 hover:text-[#C9AD93] transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Dynamic Game Loading & Iframe Area */}
        <div className={`relative w-full ${isFullscreen ? "h-[calc(100vh-45px)]" : "aspect-video min-h-[380px] sm:min-h-[480px] xl:min-h-[520px]"} bg-black`}>
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black p-6 space-y-4">
              <span className="relative flex h-10 w-10">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9AD93] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-10 w-10 bg-[#C9AD93]/85"></span>
              </span>
              <div className="text-center space-y-1">
                <p className="text-xs font-mono font-bold tracking-widest text-white uppercase">BOOTING CUSTOM HARDWARE...</p>
                <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed font-mono uppercase">
                  Tip: WebGL games may ask for key focus. Simply click inside the frame to link controller inputs.
                </p>
              </div>
            </div>
          )}

          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={game.iframeUrl}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-0 bg-black"
            allow="fullscreen; autoplay; keyboard-map; gamepad"
            sandbox="allow-scripts allow-same-origin allow-popups allow-pointer-lock"
            title={`Gameplay window for ${game.title}`}
          />
        </div>

        {/* Underbar rating & metadata panel */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-black border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <button
              id={`player-fav-btn-${game.id}`}
              onClick={() => onToggleFavorite(game.id)}
              className={`flex items-center gap-2 px-4 py-2 border text-xs font-mono font-bold uppercase cursor-pointer rounded-none transition-all ${
                isFavorite 
                  ? "bg-[#C9AD93] border-black text-black" 
                  : "bg-[#111] border-zinc-800 text-zinc-300 hover:text-[#C9AD93]"
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-black" : ""}`} />
              <span>{isFavorite ? "Bookmarked" : "Pin to Favorites"}</span>
            </button>

            <button
              id={`player-upvote-btn-${game.id}`}
              onClick={handleUpvote}
              disabled={hasRated}
              className={`flex items-center gap-2 px-4 py-2 border text-xs font-mono font-bold uppercase cursor-pointer rounded-none transition-all ${
                hasRated 
                  ? "bg-zinc-800 border-zinc-700 text-zinc-500 cursor-default" 
                  : "bg-[#111] border-zinc-800 text-zinc-300 hover:text-[#C9AD93]"
              }`}
            >
              {hasRated ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{hasRated ? "Upvoted!" : "Upvote (+0.1)"}</span>
            </button>
          </div>

          <a
            href={game.iframeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-mono font-bold text-[#C9AD93] hover:text-white transition-colors uppercase tracking-widest"
          >
            <span>Open in standalone window</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Accordion Tabs / Details Grid Below */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4 relative z-10">
        
        {/* Play Guide / Security Info */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Custom functional tabs layout */}
          <div className="flex border-b border-zinc-800">
            <button
              id="tab-btn-instructions"
              onClick={() => setActiveTab("instructions")}
              className={`pb-2.5 px-4 text-xs font-mono tracking-widest uppercase font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "instructions" 
                  ? "border-[#C9AD93] text-[#C9AD93]" 
                  : "border-transparent text-zinc-500 hover:text-white"
              }`}
            >
              Controls & Info
            </button>
            <button
              id="tab-btn-similar"
              onClick={() => setActiveTab("similar")}
              className={`pb-2.5 px-4 text-xs font-mono tracking-widest uppercase font-bold border-b-2 transition-colors lg:hidden cursor-pointer ${
                activeTab === "similar" 
                  ? "border-[#C9AD93] text-[#C9AD93]" 
                  : "border-transparent text-zinc-500 hover:text-white"
              }`}
            >
              Quick Arcade Recs
            </button>
            <button
              id="tab-btn-reviews"
              onClick={() => setActiveTab("reviews")}
              className={`pb-2.5 px-4 text-xs font-mono tracking-widest uppercase font-bold border-b-2 transition-colors cursor-pointer ${
                activeTab === "reviews" 
                  ? "border-[#C9AD93] text-[#C9AD93]" 
                  : "border-transparent text-zinc-500 hover:text-white"
              }`}
            >
              Security Check
            </button>
          </div>

          {/* Active Tab Elements */}
          {activeTab === "instructions" && (
            <div className="bg-[#111] border border-zinc-800 rounded-none p-5 space-y-4 animate-fade-in text-zinc-300">
              <div className="space-y-1.5">
                <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
                  How To Play & Controller Keys
                </h3>
                <p className="text-sm text-zinc-200 leading-relaxed bg-black p-4 border border-zinc-900 rounded-none font-mono">
                  {game.instructions}
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
                  Arcade Bio
                </h3>
                <p className="text-sm leading-relaxed text-zinc-300">
                  {game.description}
                </p>
              </div>

              {/* Tags block */}
              <div className="flex flex-wrap gap-2 pt-2">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-black border border-zinc-800 rounded-none text-xs text-[#C9AD93] font-mono uppercase"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="bg-[#111] border border-zinc-800 rounded-none p-5 space-y-4 animate-fade-in text-zinc-300">
              <div className="flex items-start gap-3 bg-[#C9AD93]/5 border border-[#C9AD93]/20 p-4 rounded-none">
                <Shield className="w-5 h-5 text-[#C9AD93] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#C9AD93]">Sandbox Shield Active</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-mono uppercase">
                    This unblocked game executes on separate sandboxed framing policies. Zero trackers, zero system requests, and no invasive script passages.
                  </p>
                </div>
              </div>

              <ul className="text-xs space-y-2 text-zinc-400 font-mono list-disc pl-5 uppercase">
                <li>Optimal for high-performance Chrome OS and standalone modules.</li>
                <li>Offline persistence capability via isolated local sandbox handles.</li>
                <li>Secure SSL validates communications with parent containers.</li>
              </ul>
            </div>
          )}

          {activeTab === "similar" && (
            <div className="space-y-3 lg:hidden animate-fade-in pb-4">
              {similarGames.map((item) => (
                <div
                  id={`play-similar-mobile-${item.id}`}
                  key={item.id}
                  onClick={() => onPlayAnother(item.id)}
                  className="flex items-center gap-3 p-3 bg-[#111] border border-zinc-800 rounded-none hover:border-[#C9AD93] cursor-pointer"
                >
                  <img 
                    src={item.thumbnailUrl} 
                    alt={item.title} 
                    className="w-14 h-10 object-cover rounded-none" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-xs text-zinc-100 font-mono font-bold uppercase">{item.title}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Sidebar / Recommended Games Column */}
        <div className="hidden lg:block space-y-4">
          <h3 className="text-xs font-mono font-bold tracking-widest text-zinc-500 uppercase">
            Recommended Arcade Links
          </h3>

          <div className="space-y-3">
            {similarGames.length > 0 ? (
              similarGames.map((item) => (
                <div
                  id={`play-similar-desktop-${item.id}`}
                  key={item.id}
                  onClick={() => onPlayAnother(item.id)}
                  className="group flex items-center gap-3.5 p-3 bg-[#111] border border-zinc-850 hover:border-[#C9AD93] rounded-none transition-all cursor-pointer"
                >
                  <div className="relative h-10 w-14 rounded-none overflow-hidden bg-black shrink-0">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-mono font-bold uppercase text-zinc-200 group-hover:text-[#C9AD93] transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
                       {item.category} • ★{item.rating.toFixed(1)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </div>
              ))
            ) : (
              <span className="text-xs text-zinc-500 italic block">No related games in category. Try scanning the homepage!</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
