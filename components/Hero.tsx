import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    titlePrefix: "Galaxy",
    titleSuffix: "Quest",
    subtitle: "Blockbuster of the Month",
    description: "An epic journey through space and time. Witness the adventure of a lifetime as a renegade crew fights to save humanity from an unknown cosmic threat.",
    image: "https://images.unsplash.com/photo-1533613220915-609f661a6fe1?q=80&w=2560&auto=format&fit=crop"
  },
  {
    id: 2,
    titlePrefix: "Neon",
    titleSuffix: "Protocol",
    subtitle: "Trending Now",
    description: "In a future where memories are currency, one hacker discovers a truth that could shatter reality itself. Dive into the neon-soaked streets of Neo-Tokyo.",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2560&auto=format&fit=crop"
  },
  {
    id: 3,
    titlePrefix: "The Last",
    titleSuffix: "Horizon",
    subtitle: "New Release",
    description: "Stranded on a desolate planet, a lone survivor must find a way home before the twin suns set forever. A tale of resilience and hope.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2560&auto=format&fit=crop"
  },
  {
    id: 4,
    titlePrefix: "Shadows of",
    titleSuffix: "Gotham",
    subtitle: "Editor's Choice",
    description: "Darkness falls upon the city. A vigilante rises from the shadows to confront a menace that threatens to plunge the metropolis into eternal chaos.",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=2560&auto=format&fit=crop"
  },
  {
    id: 5,
    titlePrefix: "Eternal",
    titleSuffix: "Forest",
    subtitle: "Critically Acclaimed",
    description: "Deep within the ancient woods, magic stirs. A young guardian must protect the heart of the forest from industrial forces encroaching on the sacred land.",
    image: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=2560&auto=format&fit=crop"
  }
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[85vh] flex items-center overflow-hidden bg-[#050505]">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
            {/* Background Image with Zoom Effect */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] ease-linear"
                style={{
                  backgroundImage: `url('${slide.image}')`,
                  transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)'
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 h-full flex items-center">
                <div 
                  className={`max-w-2xl transition-all duration-1000 delay-300 transform ${
                    index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  <div className="inline-block px-3 py-1 mb-6 border border-neon-green/30 rounded-full bg-neon-green/10 backdrop-blur-sm">
                      <span className="text-neon-green text-xs font-bold uppercase tracking-wider">{slide.subtitle}</span>
                  </div>
                  
                  <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                      {slide.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{slide.titleSuffix}</span>
                  </h1>
                  
                  <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
                      {slide.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                      <button className="group flex items-center gap-2 bg-neon-green hover:bg-[#2eb812] text-black px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:shadow-[0_0_30px_rgba(57,255,20,0.6)] transform hover:-translate-y-1">
                      <Play className="fill-black w-5 h-5 group-hover:scale-110 transition-transform" />
                      Watch Now
                      </button>
                      
                      <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold text-lg transition-all border border-white/10">
                      More Info
                      </button>
                  </div>
                </div>
            </div>
        </div>
      ))}

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              index === currentSlide 
                ? 'bg-neon-green w-8 shadow-[0_0_10px_#39ff14]' 
                : 'bg-white/30 w-2 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;