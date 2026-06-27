import React from 'react';
import { Heart, MessageCircle, Share2, Music } from 'lucide-react';

export default function ReelsFeed() {
  // Dummy dynamic data for standard Reels feed
  const sampleReels = [
    {
      id: 1,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-futuristic-vibe-43231-large.mp4',
      creator: '@nishu_vibe',
      caption: 'Coding my ultimate mixer app! 🔥 #vibemixer #reactjs #dev',
      likes: '12.4K',
      comments: '342'
    },
    {
      id: 2,
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-from-below-51984-large.mp4',
      creator: '@aesthetic_vibe',
      caption: 'Nature hit differently with custom music tracks 🌸✨',
      likes: '8.9K',
      comments: '118'
    }
  ];

  return (
    <div className="h-full w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-none flex flex-col items-center">
      {sampleReels.map((reel) => (
        <div key={reel.id} className="w-full md:max-w-[450px] h-full snap-start relative bg-slate-950 flex items-center justify-center border-x border-slate-900">
          
          {/* Main Video element */}
          <video 
            src={reel.videoUrl} 
            className="w-full h-full object-cover"
            loop 
            autoPlay 
            muted 
            playsInline
            onClick={(e) => e.target.paused ? e.target.play() : e.target.pause()}
          />

          {/* Right Floating Actions (Insta Style) */}
          <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-10 bg-black/20 p-2 rounded-full backdrop-blur-xs">
            <button className="flex flex-col items-center group">
              <div className="p-3 bg-slate-900/60 rounded-full group-hover:scale-110 transition-transform">
                <Heart size={26} className="text-white hover:text-red-500 transition-colors" />
              </div>
              <span className="text-xs mt-1 font-bold">{reel.likes}</span>
            </button>
            
            <button className="flex flex-col items-center group">
              <div className="p-3 bg-slate-900/60 rounded-full group-hover:scale-110 transition-transform">
                <MessageCircle size={26} className="text-white" />
              </div>
              <span className="text-xs mt-1 font-bold">{reel.comments}</span>
            </button>

            <button className="p-3 bg-slate-900/60 rounded-full hover:scale-110 transition-transform">
              <Share2 size={26} className="text-white" />
            </button>
          </div>

          {/* Bottom Info Overlays */}
          <div className="absolute bottom-4 left-4 right-16 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 rounded-xl">
            <h4 className="font-bold text-base flex items-center gap-2">
              {reel.creator}
              <span className="bg-blue-500 text-[10px] px-1.5 py-0.5 rounded-full text-white font-extrabold uppercase">Verified</span>
            </h4>
            <p className="text-sm mt-1 text-slate-200 line-clamp-2">{reel.caption}</p>
            <div className="flex items-center gap-2 mt-3 text-xs bg-slate-900/60 w-max px-3 py-1.5 rounded-full border border-slate-800">
              <Music size={14} className="animate-spin-slow" />
              <span className="truncate max-w-[150px]">Original Audio - {reel.creator}</span>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}