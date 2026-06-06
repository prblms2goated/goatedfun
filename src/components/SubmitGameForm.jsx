import React, { useState } from "react";
import { X, Plus, Gamepad2, Link as LinkIcon, Edit3, HelpCircle, Check, Info } from "lucide-react";

const CATEGORIES = ["Puzzle", "Arcade", "Classic", "Action", "Strategy", "Sports"];

const THUMBNAIL_PRESETS = [
  { name: "Neon Space", url: "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?q=80&w=300&auto=format&fit=crop" },
  { name: "Retro Console", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&auto=format&fit=crop" },
  { name: "Arcade Cabinet", url: "https://images.unsplash.com/photo-1579373903781-fd5703680f0c?q=80&w=300&auto=format&fit=crop" },
  { name: "Game Controller", url: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=300&auto=format&fit=crop" },
  { name: "Circuit Board", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=300&auto=format&fit=crop" }
];

export default function SubmitGameForm({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Puzzle");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const [customThumbnail, setCustomThumbnail] = useState("");
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [tagsInput, setTagsInput] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Game Title is required";
    if (!description.trim()) newErrors.description = "Short Description is required";
    if (!instructions.trim()) newErrors.instructions = "Instructions are required";
    
    if (!iframeUrl.trim()) {
      newErrors.iframeUrl = "Iframe URL is required";
    } else {
      try {
        const url = new URL(iframeUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          newErrors.iframeUrl = "URL must start with http:// or https://";
        }
      } catch (e) {
        newErrors.iframeUrl = "Invalid URL address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const tags = tagsInput
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const chosenThumbnail = customThumbnail.trim() 
      ? customThumbnail.trim() 
      : THUMBNAIL_PRESETS[selectedPresetIndex].url;

    const newGame = {
      id: "user-" + Date.now().toString(),
      title: title.trim(),
      category,
      description: description.trim(),
      instructions: instructions.trim(),
      iframeUrl: iframeUrl.trim(),
      thumbnailUrl: chosenThumbnail,
      rating: 5.0, // New games start with pristine rating
      tags: tags.length > 0 ? tags : [category, "Unblocked"],
      isCustom: true
    };

    onSubmit(newGame);
  };

  return (
    <div id="submit-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div 
        id="submit-content" 
        className="w-full max-w-2xl bg-[#111] border-2 border-zinc-800 rounded-none overflow-hidden shadow-2xl border-t-4 border-t-[#C9AD93]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-black border-b border-zinc-801">
          <div className="flex items-center space-x-3">
            <span className="p-2 bg-[#C9AD93] text-black border border-black">
              <Gamepad2 className="w-5 h-5" />
            </span>
            <h2 className="text-sm font-mono font-black text-white uppercase tracking-widest flex items-center gap-2">
              Add Custom Arcade Card
            </h2>
          </div>
          <button 
            id="close-submit-modal-btn"
            onClick={onClose}
            className="p-1 px-1.5 md:p-2 text-zinc-400 hover:text-[#C9AD93] bg-zinc-900 border border-zinc-800 rounded-none transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 max-h-[75vh] overflow-y-auto space-y-6">
          
          <div className="bg-black p-4 border border-zinc-850 rounded-none flex items-start gap-3">
            <Info className="w-5 h-5 text-[#C9AD93] shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-400 leading-relaxed font-mono uppercase">
              Submit any embeddable web game link! Make sure the host has correct iframe options configured (e.g. itch.io widgets or fast public GitHub pages).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Game Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#C9AD93]" /> Game Title
              </label>
              <input
                id="input-title"
                type="text"
                placeholder="e.g. Alien Invader Elite"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={`w-full bg-black border ${errors.title ? "border-rose-500" : "border-zinc-800 focus:border-[#C9AD93]"} rounded-none px-4 py-2.5 text-white text-sm focus:outline-none transition-all`}
              />
              {errors.title && <span className="text-xs text-rose-500 font-mono">{errors.title}</span>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
                Category
              </label>
              <select
                id="select-category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-black border border-zinc-800 focus:border-[#C9AD93] rounded-none px-4 py-2.5 text-white text-xs font-mono tracking-wider uppercase focus:outline-none transition-all appearance-none cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Iframe URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-[#C9AD93]" /> Iframe Game URL
            </label>
            <input
              id="input-iframe"
              type="text"
              placeholder="https://example.placeholder.io/mygame/"
              value={iframeUrl}
              onChange={e => setIframeUrl(e.target.value)}
              className={`w-full bg-black border ${errors.iframeUrl ? "border-rose-500" : "border-zinc-800 focus:border-[#C9AD93]"} rounded-none px-4 py-2.5 text-white text-sm focus:outline-none transition-all`}
            />
            {errors.iframeUrl && <span className="text-xs text-rose-500 font-mono">{errors.iframeUrl}</span>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
              Game Description
            </label>
            <textarea
              id="textarea-desc"
              rows={2}
              placeholder="Provide a fun description for players on the arcade site..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`w-full bg-black border ${errors.description ? "border-rose-500" : "border-zinc-800 focus:border-[#C9AD93]"} rounded-none px-4 py-2.5 text-white text-sm focus:outline-none transition-all resize-none`}
            />
            {errors.description && <span className="text-xs text-rose-500 font-mono">{errors.description}</span>}
          </div>

          {/* Instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#C9AD93]" /> Playing Controls / Instructions
            </label>
            <textarea
              id="textarea-inst"
              rows={2}
              placeholder="e.g. Use W-A-S-D to drive, SPACE to engage power boost."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              className={`w-full bg-black border ${errors.instructions ? "border-rose-500" : "border-zinc-800 focus:border-[#C9AD93]"} rounded-none px-4 py-2.5 text-white text-sm focus:outline-none transition-all resize-none`}
            />
            {errors.instructions && <span className="text-xs text-rose-500 font-mono">{errors.instructions}</span>}
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
              Tags <span className="text-slate-500 font-normal lowercase">(comma-separated)</span>
            </label>
            <input
              id="input-tags"
              type="text"
              placeholder="retro, dynamic, high-difficulty, infinite"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              className="w-full bg-black border border-zinc-800 focus:border-[#C9AD93] rounded-none px-4 py-2.5 text-white text-sm focus:outline-none transition-all font-mono"
            />
          </div>

          {/* Game Banner Thumbnail Presets */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest block">
              Set Display Cover / Display Preset Image
            </label>
            
            {/* Presets Row */}
            <div className="grid grid-cols-5 gap-2">
              {THUMBNAIL_PRESETS.map((preset, idx) => (
                <button
                  id={`thumbnail-preset-${idx}`}
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPresetIndex(idx);
                    setCustomThumbnail("");
                  }}
                  className={`relative h-14 rounded-none overflow-hidden border-2 cursor-pointer transition-all ${
                    !customThumbnail && selectedPresetIndex === idx 
                      ? "border-[#C9AD93] scale-[1.03] opacity-100" 
                      : "border-zinc-850 hover:border-zinc-700 opacity-60 hover:opacity-90"
                  }`}
                >
                  <img 
                    src={preset.url} 
                    alt={preset.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    {!customThumbnail && selectedPresetIndex === idx && (
                      <Check className="w-5 h-5 text-[#C9AD93] drop-shadow-md" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom URL Input option */}
            <div className="pt-1.5 space-y-1">
              <input
                id="input-custom-thumbnail"
                type="text"
                placeholder="Or paste custom cover Image URL..."
                value={customThumbnail}
                onChange={e => setCustomThumbnail(e.target.value)}
                className="w-full bg-black border border-zinc-850 focus:border-[#C9AD93] rounded-none px-3.5 py-2 text-zinc-300 text-xs focus:outline-none transition-all"
              />
              <span className="text-[10px] text-zinc-500 font-mono uppercase block">
                Leave blank to use the active selected preset above.
              </span>
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-zinc-850">
            <button
              id="cancel-submit-btn"
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-game-btn"
              type="submit"
              className="px-6 py-2.5 bg-[#C9AD93] hover:bg-[#d5bfab] text-black font-mono font-black text-xs uppercase tracking-wider rounded-none transition-all flex items-center space-x-2 border border-black cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4 text-black stroke-[3]" />
              <span>Publish Arcade Card</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
