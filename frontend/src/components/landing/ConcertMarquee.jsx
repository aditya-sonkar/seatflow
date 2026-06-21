import React from "react";

const CONCERT_IMAGES = [
  "/images/concert_neon_singer_1781969504826.png",
  "/images/concert_crowd_lights_1781969519702.png",
  "/images/concert_dj_turntables_1781969538091.png",
  "/images/concert_guitarist_spotlight_1781969554625.png"
];

export default function ConcertMarquee() {
  // Generate a long repeating string of text to cover any viewport width
  const textGroup = Array(25)
    .fill("CONCERT LIVE")
    .map((text, i) => (
      <React.Fragment key={i}>
        <span className="font-mono tracking-widest text-[#39ff14] text-xs sm:text-sm font-bold uppercase">
          {text}
        </span>
        <span className="text-[#39ff14] font-mono tracking-widest text-xs sm:text-sm mx-4">
          -----
        </span>
      </React.Fragment>
    ));

  // Double the images array to make the scroll seamless
  const displayImages = [...CONCERT_IMAGES, ...CONCERT_IMAGES];

  return (
    <div className="w-full overflow-hidden bg-transparent select-none pt-12 pb-8">
      {/* Local styles for keyframes to keep component self-contained */}
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          display: flex;
          width: max-content;
          animation: marquee-left 90s linear infinite;
        }
        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: marquee-right 35s linear infinite;
        }
      `}</style>

      {/* Text Marquee - Moves Left */}
      <div className="w-full overflow-hidden py-3.5 mb-6 flex relative">
        <div className="animate-marquee-left flex items-center whitespace-nowrap">
          <div className="flex items-center flex-shrink-0 pl-4">
            {textGroup}
          </div>
          <div className="flex items-center flex-shrink-0">
            {textGroup}
          </div>
        </div>
      </div>

      {/* Image Marquee - Moves Right */}
      <div className="w-full overflow-hidden flex relative py-2">
        <div className="animate-marquee-right flex whitespace-nowrap gap-6">
          <div className="flex gap-6 flex-shrink-0">
            {displayImages.map((src, index) => (
              <div
                key={`group1-${index}`}
                className="w-[280px] h-[280px] md:w-[460px] md:h-[460px] overflow-hidden rounded-md border border-zinc-800 flex-shrink-0"
              >
                <img
                  src={src}
                  alt={`Live concert scene ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-6 flex-shrink-0">
            {displayImages.map((src, index) => (
              <div
                key={`group2-${index}`}
                className="w-[280px] h-[280px] md:w-[460px] md:h-[460px] overflow-hidden rounded-md border border-zinc-800 flex-shrink-0"
              >
                <img
                  src={src}
                  alt={`Live concert scene ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



