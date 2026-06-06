import { Star, Play, Heart, Shield, Activity, User } from "lucide-react";

export default function GameCard({ game, onSelect, isFavorite, onToggleFavorite, playCount }) {
  // Format ratings nicely (e.g., 4.7)
  const formattedRating = game.rating.toFixed(1);

  return (
    <div
      id={`game-card-${game.id}`}
      onClick={() => onSelect(game.id)}
      className="group relative flex flex-col bg-[#111] border border-zinc-800 overflow-hidden hover:border-[#C9AD93] hover:shadow-xl hover:shadow-[#C9AD93]/5 cursor-pointer transform hover:-translate-y-1 transition-all duration-200 select-none rounded-none"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#1a1a1a]">
        <img
          src={game.thumbnailUrl}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
          <div className="p-3 bg-[#C9AD93] text-black rounded-none shadow-lg transform scale-90 group-hover:scale-100 transition-all duration-200">
            <Play className="w-6 h-6 fill-current" />
          </div>
        </div>

        {/* Favorite Icon */}
        <button
          id={`fav-btn-${game.id}`}
          onClick={(e) => onToggleFavorite(e, game.id)}
          className="absolute top-3 right-3 p-2 bg-black/80 rounded-none text-slate-300 hover:text-rose-500 border border-zinc-800 hover:scale-110 active:scale-[0.9] transition-all z-10 cursor-pointer"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500 text-rose-500 border-none" : ""}`} />
        </button>

        {/* Custom Game Badge / Standard Safe */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-10 pointer-events-none">
          {game.isCustom ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-[#C9AD93] text-black text-[9px] font-black tracking-wider uppercase">
              <User className="w-2.5 h-2.5" /> CUSTOM
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-black border border-zinc-700 text-zinc-300 text-[9px] font-bold tracking-wider uppercase">
              <Shield className="w-2.5 h-2.5 text-[#C9AD93]" /> VERIFIED
            </span>
          )}
        </div>

        {/* Category Pill */}
        <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-black text-[9px] font-mono tracking-widest text-zinc-400 border border-zinc-900 uppercase">
          {game.category}
        </span>
      </div>

      {/* Info Content */}
      <div className="flex-1 p-4 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Rating and Plays Row */}
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
            <div className="flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 text-[#C9AD93] fill-current" />
              <span className="text-zinc-200 font-bold">{formattedRating} Rating</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-zinc-500" />
              <span>{playCount.toLocaleString()} Plays</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider group-hover:text-[#C9AD93] transition-colors line-clamp-1">
            {game.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
            {game.description}
          </p>
        </div>

        {/* Tags list (Artistic Flair Tag Style) */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[9px] font-mono text-[#C9AD93] border border-[#C9AD93]/30 bg-[#C9AD93]/5 uppercase"
            >
              {tag.toLowerCase()}
            </span>
          ))}
          {game.tags.length > 3 && (
            <span className="px-1.5 py-0.5 text-[8px] font-mono text-zinc-500 border border-zinc-800">
              +{game.tags.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
