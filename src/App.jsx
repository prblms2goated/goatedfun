import { useState, useEffect } from "react";
import { 
  Gamepad2, Search, SlidersHorizontal, Plus, Star, Heart, 
  Trash2, ShieldCheck, Gamepad, Award, Zap, RefreshCw
} from "lucide-react";
import initialGamesRaw from "./games.json";
import GameCard from "./components/GameCard";
import GamePlayer from "./components/GamePlayer";
import SubmitGameForm from "./components/SubmitGameForm";

const initialGames = initialGamesRaw;

export default function App() {
  // --- STATE ---
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [playCounts, setPlayCounts] = useState({});
  
  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [filterCustom, setFilterCustom] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  
  // Submit Custom Game Modal State
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // --- PERSISTENCE EFFECT ---
  useEffect(() => {
    // 1. Load favorites array
    const savedFavorites = localStorage.getItem("unblocked_arcade_favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }

    // 2. Load custom submitted games
    const savedCustomGames = localStorage.getItem("unblocked_arcade_custom_games");
    let lobbyCustomGames = [];
    if (savedCustomGames) {
      try {
        lobbyCustomGames = JSON.parse(savedCustomGames);
      } catch (e) {
        console.error("Failed to parse custom games", e);
      }
    }

    // Combine static games from the JSON file with user's local custom games
    setGames([...initialGames, ...lobbyCustomGames]);

    // 3. Load or generate play counts (to populate realistic looking counters)
    const savedPlayCounts = localStorage.getItem("unblocked_arcade_playcounts");
    if (savedPlayCounts) {
      try {
        setPlayCounts(JSON.parse(savedPlayCounts));
      } catch (e) {
        console.error("Failed to parse play counts", e);
      }
    } else {
      // Create initial pseudo play counts for game realism
      const initialPlays = {};
      initialGames.forEach((g) => {
        // Generate random realistic seed play counts based on initial ratings
        initialPlays[g.id] = Math.floor(g.rating * 1500 + Math.random() * 500);
      });
      setPlayCounts(initialPlays);
      localStorage.setItem("unblocked_arcade_playcounts", JSON.stringify(initialPlays));
    }
  }, []);

  // --- ACTIONS ---
  
  // Toggle favorite bookmark state
  const handleToggleFavorite = (e, gameId) => {
    if (e) {
      e.stopPropagation(); // Avoid triggering card selection click
    }
    const isFav = favorites.includes(gameId);
    let updated;
    if (isFav) {
      updated = favorites.filter((id) => id !== gameId);
    } else {
      updated = [...favorites, gameId];
    }
    setFavorites(updated);
    localStorage.setItem("unblocked_arcade_favorites", JSON.stringify(updated));
  };

  // Select a game and log a play action
  const handleSelectGame = (gameId) => {
    setSelectedGameId(gameId);
    
    // Increment the active play count for this game
    const currentCounts = { ...playCounts };
    currentCounts[gameId] = (currentCounts[gameId] || 0) + 1;
    setPlayCounts(currentCounts);
    localStorage.setItem("unblocked_arcade_playcounts", JSON.stringify(currentCounts));

    // Scroll smoothly to top when switching to player screen
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit new game handler
  const handleSubmitGame = (newGame) => {
    const updatedGames = [newGame, ...games];
    setGames(updatedGames);

    // Save user custom games array in localStorage
    const savedCustomGames = localStorage.getItem("unblocked_arcade_custom_games");
    let currentCustom = [];
    if (savedCustomGames) {
      try {
        currentCustom = JSON.parse(savedCustomGames);
      } catch (e) {
        console.error(e);
      }
    }
    currentCustom = [newGame, ...currentCustom];
    localStorage.setItem("unblocked_arcade_custom_games", JSON.stringify(currentCustom));

    // Add play count entry
    const updatedCounts = { ...playCounts };
    updatedCounts[newGame.id] = 1;
    setPlayCounts(updatedCounts);
    localStorage.setItem("unblocked_arcade_playcounts", JSON.stringify(updatedCounts));

    setIsSubmitOpen(false);
  };

  // Support changing raw game rating from player interactions
  const handleRatingChange = (gameId, newRating) => {
    const updatedGamesList = games.map((g) => {
      if (g.id === gameId) {
        return { ...g, rating: newRating };
      }
      return g;
    });
    setGames(updatedGamesList);

    // If rated game is custom, persist the adjusted rating
    const savedCustomGames = localStorage.getItem("unblocked_arcade_custom_games");
    if (savedCustomGames) {
      try {
        const parsed = JSON.parse(savedCustomGames);
        const updatedParsed = parsed.map((curr) => {
          if (curr.id === gameId) {
            return { ...curr, rating: newRating };
          }
          return curr;
        });
         localStorage.setItem("unblocked_arcade_custom_games", JSON.stringify(updatedParsed));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Clear a custom game completely
  const handleDeleteCustomGame = (e, gameId) => {
    e.stopPropagation();
    
    // Remove from active games listing
    const updatedGames = games.filter((g) => g.id !== gameId);
    setGames(updatedGames);

    // Remove from custom games persistence storage
    const savedCustoms = localStorage.getItem("unblocked_arcade_custom_games");
    if (savedCustoms) {
      try {
        const parsed = JSON.parse(savedCustoms);
        const filtered = parsed.filter((cf) => cf.id !== gameId);
        localStorage.setItem("unblocked_arcade_custom_games", JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }
    }

    // Clean favorite ref
    if (favorites.includes(gameId)) {
      const filteredFavs = favorites.filter((fid) => fid !== gameId);
      setFavorites(filteredFavs);
      localStorage.setItem("unblocked_arcade_favorites", JSON.stringify(filteredFavs));
    }
  };

  // Reset play counts and reset game list back to raw defaults
  const handleResetCatalog = () => {
    if (window.confirm("Are you sure you want to restore default games and clear your custom submissions?")) {
      localStorage.removeItem("unblocked_arcade_custom_games");
      localStorage.removeItem("unblocked_arcade_favorites");
      
      const initialPlays = {};
      initialGames.forEach((g) => {
        initialPlays[g.id] = Math.floor(g.rating * 1500 + Math.random() * 500);
      });
      setPlayCounts(initialPlays);
      localStorage.setItem("unblocked_arcade_playcounts", JSON.stringify(initialPlays));
      
      setFavorites([]);
      setGames(initialGames);
      setSelectedGameId(null);
    }
  };

  // --- FILTERS & DERIVATIONS ---

  // Unique categories list across all games
  const categoriesList = ["All", ...Array.from(new Set(games.map((g) => g.category)))];

  // Process filters
  const filteredGames = games.filter((g) => {
    const matchesSearch = 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategory === "All" || g.category === activeCategory;

    const matchesOrigin = 
      filterCustom === "all" ||
      (filterCustom === "verified" && !g.isCustom) ||
      (filterCustom === "custom" && g.isCustom);

    return matchesSearch && matchesCategory && matchesOrigin;
  });

  // Apply sorting
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    if (sortBy === "plays") {
      const playsA = playCounts[a.id] || 0;
      const playsB = playCounts[b.id] || 0;
      return playsB - playsA;
    }
    if (sortBy === "alphabetical") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Calculate statistics for display cards
  const activeSelectedGame = games.find((g) => g.id === selectedGameId);
  const totalVerified = games.filter(g => !g.isCustom).length;
  const totalCustomSubmissions = games.filter(g => g.isCustom).length;
  const totalPinnedFavs = favorites.length;

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans selection:bg-[#C9AD93] selection:text-black overflow-hidden">
      
      {/* SOLID ARTISTIC FLAIR RADIAL BACKGROUND BLENDS */}
      <div className="canvas-bg absolute inset-0 z-0" />
      
      {/* ROTATING TRANS-LUCENT WATERMARK BACKGROUND */}
      <div className="vertical-accent-text absolute right-6 bottom-24 hidden lg:block select-none pointer-events-none text-zinc-800/10 font-bold tracking-widest leading-none">
        PLAYGROUND
      </div>

      {/* GLOBAL BANNER NAV */}
      <header className="sticky top-0 z-40 bg-[#050505]/95 backdrop-blur-md border-b-2 border-white transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between relative z-10">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setSelectedGameId(null)}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="p-2 bg-[#C9AD93] border border-black text-black">
              <Gamepad2 className="w-5 h-5 font-bold" />
            </div>
            <div>
              <span className="font-display font-black text-2xl uppercase tracking-tighter text-white group-hover:text-[#C9AD93] transition-colors flex items-center gap-2">
                GOATED<span className="text-[#C9AD93] text-glow-accent">FUN.</span>
              </span>
              <span className="hidden sm:block text-[9px] font-mono text-zinc-500 tracking-widest uppercase">
                UNBLOCKED SANDBOX GOATED PORTAL
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-3">
            <button
              id="header-submit-btn"
              onClick={() => setIsSubmitOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#C9AD93] hover:bg-[#d5bfab] active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider rounded-none transition-all shadow-md cursor-pointer border border-black"
            >
              <Plus className="w-4 h-4 shrink-0 stroke-[3]" />
              <span>Import Custom Game</span>
            </button>

            {/* Quick backup reset */}
            <button
              id="reset-arcade-btn"
              onClick={handleResetCatalog}
              title="Reset Database to Defaults"
              className="p-2 bg-[#111] hover:bg-[#1f1f1f] border border-zinc-800 text-zinc-400 hover:text-[#C9AD93] rounded-none transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>
      </header>

      {/* BODY CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {activeSelectedGame ? (
          /* -------- CASE 1: GAME ACTIVE GAMEPLAY LAYOUT -------- */
          <GamePlayer
            game={activeSelectedGame}
            onBack={() => {
              setSelectedGameId(null);
              // scroll to top smoothly
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            isFavorite={favorites.includes(activeSelectedGame.id)}
            onToggleFavorite={(gid) => handleToggleFavorite(null, gid)}
            onRatingChanged={handleRatingChange}
            catalog={games}
            onPlayAnother={handleSelectGame}
          />
        ) : (
          /* -------- CASE 2: SEARCH CATALOG & DISCOVER GRID -------- */
          <div className="space-y-8 relative z-10">
            
            {/* Aesthetic Dashboard Hero Widget */}
            <div className="relative bg-[#111] border-2 border-zinc-800 rounded-none p-6 md:p-8 overflow-hidden shadow-xl border-t-4 border-t-[#C9AD93]">
              {/* Decorative side shape */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#C9AD93]/5 to-transparent pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2 space-y-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C9AD93]/15 border border-[#C9AD93]/20 text-[#C9AD93] rounded-none text-xs font-mono font-bold tracking-widest uppercase">
                    <Zap className="w-3.5 h-3.5" /> FAST CLOUD-LOADED INTEL CORE
                  </span>
                  <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-wider">
                    SECURE WEB ARCADE PORTAL
                  </h2>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-xl">
                    Welcome to the fully unblocked custom sandbox portal. Browse curated, high-performance HTML5 and WebGL games parsed cleanly from secure standalone manifest structures.
                  </p>
                </div>

                {/* Info counter grid cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-black border border-zinc-800 rounded-none text-center">
                    <span className="block text-xl font-mono font-black text-[#C9AD93]">
                      {totalVerified}
                    </span>
                    <span className="text-[9px] text-[#C9AD93] uppercase font-bold tracking-widest block mt-0.5">
                      VERIFIED
                    </span>
                  </div>
                  <div className="p-3 bg-black border border-zinc-800 rounded-none text-center">
                    <span className="block text-xl font-mono font-black text-white">
                      {totalCustomSubmissions}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mt-0.5 font-bold">
                      CUSTOMS
                    </span>
                  </div>
                  <div className="p-3 bg-black border border-zinc-800 rounded-none text-center">
                    <span className="block text-xl font-mono font-black text-[#C9AD93]">
                      {totalPinnedFavs}
                    </span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest block mt-0.5 font-bold">
                      PINNED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter toolbar and controls block */}
            <div className="bg-[#111] border border-zinc-800 rounded-none p-5 space-y-4">
              
              {/* Search & Sorting input bar */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Search Bar input */}
                <div className="md:col-span-6 relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search games, retro tags, keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black border border-zinc-850 focus:border-[#C9AD93] rounded-none pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all font-mono"
                  />
                </div>

                {/* Origin toggler (verified vs custom) */}
                <div className="md:col-span-3 flex bg-black border border-zinc-850 p-1 rounded-none">
                  <button
                    id="origin-filter-all"
                    onClick={() => setFilterCustom("all")}
                    className={`flex-1 text-[10px] font-mono font-black uppercase py-1.5 transition-all rounded-none cursor-pointer ${
                      filterCustom === "all" ? "bg-[#C9AD93] text-black" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    ALL
                  </button>
                  <button
                    id="origin-filter-verified"
                    onClick={() => setFilterCustom("verified")}
                    className={`flex-1 text-[10px] font-mono font-black uppercase py-1.5 transition-all rounded-none cursor-pointer ${
                      filterCustom === "verified" ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    VERIFIED
                  </button>
                  <button
                    id="origin-filter-custom"
                    onClick={() => setFilterCustom("custom")}
                    className={`flex-1 text-[10px] font-mono font-black uppercase py-1.5 transition-all rounded-none cursor-pointer ${
                      filterCustom === "custom" ? "bg-[#C9AD93]/20 text-[#C9AD93] border border-[#C9AD93]/30" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    CUSTOM
                  </button>
                </div>

                {/* Dropdown sort mechanism */}
                <div className="md:col-span-3 relative flex items-center bg-black border border-zinc-850 rounded-none px-3 py-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-zinc-500 shrink-0 mr-2" />
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-transparent text-xs text-zinc-200 font-mono tracking-wider uppercase focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="rating" className="bg-[#111]">Sort rating [High]</option>
                    <option value="plays" className="bg-[#111]">Sort popular [Plays]</option>
                    <option value="alphabetical" className="bg-[#111]">Sort name [A-Z]</option>
                  </select>
                </div>

              </div>

              {/* Categorization tabs bar */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
                {categoriesList.map((catName) => (
                  <button
                    id={`cat-tab-${catName}`}
                    key={catName}
                    onClick={() => setActiveCategory(catName)}
                    className={`px-4 py-1.5 rounded-none text-[10px] font-mono font-bold tracking-widest border uppercase transition-all shrink-0 cursor-pointer ${
                      activeCategory === catName
                        ? "bg-[#C9AD93] border-black text-black font-black"
                        : "bg-black hover:bg-[#1f1f1f] border-zinc-800 text-zinc-400 hover:text-white hover:border-[#C9AD93]"
                    }`}
                  >
                    {catName}
                  </button>
                ))}
              </div>

            </div>

            {/* Custom/Favorite segment lists for smart filtering view feedback */}
            {favorites.length > 0 && searchQuery === "" && activeCategory === "All" && filterCustom === "all" && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-[#C9AD93] fill-[#C9AD93]" />
                  <h3 className="text-xs font-mono font-bold text-[#C9AD93] uppercase tracking-widest text-glow-accent">
                    PINNED ENCRYPTED SECURE VAULT
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {games
                    .filter((g) => favorites.includes(g.id))
                    .map((matchedGame) => (
                      <div key={matchedGame.id}>
                        <GameCard
                          game={matchedGame}
                          onSelect={handleSelectGame}
                          isFavorite={true}
                          onToggleFavorite={handleToggleFavorite}
                          playCount={playCounts[matchedGame.id] || 0}
                        />
                      </div>
                    ))}
                </div>
                <div className="border-b border-dashed border-zinc-800 pt-4" />
              </div>
            )}

            {/* Dynamic Result Deck Grid block */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="uppercase tracking-widest font-bold">
                  ARCADE UNITS ({sortedGames.length} Cabinets Online)
                </span>
                
                {searchQuery && (
                  <span>
                    SEARCH SECTORS: &quot;<strong className="text-[#C9AD93] font-black">{searchQuery}</strong>&quot;
                  </span>
                )}
              </div>

              {sortedGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {sortedGames.map((gameNode) => (
                    <div key={gameNode.id} className="relative group/card-wrapper">
                      <GameCard
                        game={gameNode}
                        onSelect={handleSelectGame}
                        isFavorite={favorites.includes(gameNode.id)}
                        onToggleFavorite={handleToggleFavorite}
                        playCount={playCounts[gameNode.id] || 0}
                      />
                      
                      {/* Trash action button overlay specifically for locally added user custom games */}
                      {gameNode.isCustom && (
                        <button
                          id={`delete-custom-${gameNode.id}`}
                          onClick={(e) => handleDeleteCustomGame(e, gameNode.id)}
                          title="Permanently Remove Custom Game"
                          className="absolute bottom-4 right-4 p-2 bg-slate-950/90 text-rose-500 hover:text-rose-400 border border-slate-850 rounded-xl hover:scale-105 active:scale-95 transition-all hidden group-hover/card-wrapper:flex z-10 cursor-pointer shadow-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Beautiful empty state */
                <div className="bg-[#111] border border-zinc-800 rounded-none p-12 text-center max-w-md mx-auto space-y-4 shadow-xl">
                  <SlidersHorizontal className="w-10 h-10 text-zinc-600 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-white font-black uppercase tracking-wider">No Games Found</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Try broadening your search keyword, selecting &quot;All&quot; categories, or submit a custom URL game container!
                    </p>
                  </div>
                  <button
                    id="empty-state-reset-btn"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("All");
                      setFilterCustom("all");
                    }}
                    className="px-4 py-2 bg-[#C9AD93] text-black font-extrabold text-xs uppercase tracking-wider rounded-none hover:bg-[#d5bfab] transition-all cursor-pointer"
                  >
                    Reset Filter Targets
                  </button>
                </div>
              )}
            </div>

            {/* Quick unblocked secure explanation section for user trust */}
            <div className="bg-[#111] border border-zinc-800 rounded-none p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-xs text-zinc-400 leading-relaxed">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C9AD93] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-white uppercase tracking-wider">Client-Side Persistence</h4>
                  <p>All bookmarks, custom game entries, modified ratings, and play tracking are persisted locally inside secure encrypted localStorage indexes.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Gamepad className="w-5 h-5 text-white shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-white uppercase tracking-wider">Frame Sandboxing</h4>
                  <p>Iframes require no backend database tokens or cross-site permissions. They run within standard browser isolated execution instances.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-[#C9AD93] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-extrabold text-white uppercase tracking-wider">DevTools Friendly</h4>
                  <p>Use standard debug logs to verify frame rates. Completely optimal for schools, workspaces, and offline standalone configurations.</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* RENDER CUSTOM GAME MODAL DRAWER */}
      {isSubmitOpen && (
        <SubmitGameForm
          onClose={() => setIsSubmitOpen(false)}
          onSubmit={handleSubmitGame}
        />
      )}

      {/* FOOTER ACCENTS MATCHING THE #C9AD93 SOLID PANEL AT BOTTOM */}
      <footer className="mt-20 bg-[#C9AD93] text-black py-8 text-center text-xs font-mono font-black tracking-widest uppercase border-t-2 border-black w-full relative z-10 space-y-2">
        <p>Unblocked Games Portal • @2026 GOATED FUN</p>
        <p className="text-[10px] opacity-70">
          Created with high-performance responsive iframe components. Completely database-free, browser isolated standalone modules.
        </p>
      </footer>

    </div>
  );
}
