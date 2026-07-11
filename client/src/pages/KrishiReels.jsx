import React, { useState, useRef, useEffect } from 'react';
import './KrishiReels.css';

const REELS_DATA = [
  {
    id: 1,
    url: '/reels/reel1.mp4',
    title: 'Farmer Success Story',
    description: 'A quick look into the daily life and success of our local farmers! 🌾🚜',
    author: '@AgriTech_India',
    likes: '12.4k',
    comments: '342'
  },
  {
    id: 2,
    url: '/reels/reel2.mp4',
    title: 'Modern Techniques',
    description: 'Implementing modern techniques to increase yield and reduce water usage. 💧🌱',
    author: '@KisanExpert',
    likes: '8.1k',
    comments: '128'
  },
  {
    id: 3,
    url: '/reels/reel3.mp4',
    title: 'Crop Inspection',
    description: 'Always check the roots and early leaves for signs of pest damage. 🐛🔍',
    author: '@FarmMachinery',
    likes: '45.2k',
    comments: '1.2k'
  },
  {
    id: 4,
    url: '/reels/reel4.mp4',
    title: 'Organic Farming',
    description: 'Going organic! Here is how we prepare our natural fertilizers. 🍃🐄',
    author: '@OrganicKisan',
    likes: '22.1k',
    comments: '550'
  },
  {
    id: 5,
    url: '/reels/reel5.mp4',
    title: 'Harvest Season',
    description: 'The golden fields are ready! Harvest season is the best season. 🌾🌾',
    author: '@PunjabFarms',
    likes: '33.4k',
    comments: '890'
  },
  {
    id: 6,
    url: '/reels/reel6.mp4',
    title: 'Smart Irrigation',
    description: 'Setting up drip irrigation to save water and money. Every drop counts! 💦🌿',
    author: '@SmartAgri',
    likes: '15.6k',
    comments: '210'
  },
  {
    id: 7,
    url: '/reels/reel7.mp4',
    title: 'Soil Health',
    description: 'Healthy soil means healthy crops. Learn how to test your soil pH! 🧪🌱',
    author: '@SoilDocs',
    likes: '9.2k',
    comments: '105'
  },
  {
    id: 8,
    url: '/reels/reel8.mp4',
    title: 'Market Day',
    description: 'Taking our fresh produce to the Mandi. Hard work pays off! 🍅🥕💵',
    author: '@KisanMitra',
    likes: '50.1k',
    comments: '2.4k'
  }
];

const ReelVideo = ({ reel, isActive }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="reel-container">
      <video
        ref={videoRef}
        className="reel-video"
        src={reel.url}
        loop
        playsInline
        muted={false}
        onClick={togglePlay}
      />
      
      {!isPlaying && (
        <div className="play-button-overlay" onClick={togglePlay}>
          ▶
        </div>
      )}

      <div className="reel-ui">
        <div className="reel-info">
          <h3>{reel.author}</h3>
          <h4>{reel.title}</h4>
          <p>{reel.description}</p>
        </div>

        <div className="reel-actions">
          <div className="action-button" onClick={() => setIsLiked(!isLiked)}>
            <span className={`icon ${isLiked ? 'liked' : ''}`}>
              {isLiked ? '❤️' : '🤍'}
            </span>
            <span>{reel.likes}</span>
          </div>
          <div className="action-button">
            <span className="icon">💬</span>
            <span>{reel.comments}</span>
          </div>
          <div className="action-button">
            <span className="icon">↗️</span>
            <span>Share</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function KrishiReels() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    // Calculate which reel is currently in view based on scroll position
    const { scrollTop, clientHeight } = containerRef.current;
    const newIndex = Math.round(scrollTop / clientHeight);
    
    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < REELS_DATA.length) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div className="krishi-reels-page">
      <div className="reels-header">
        <h2>Krishi Reels</h2>
        <p>Learn new farming techniques</p>
      </div>
      
      <div 
        className="reels-scroll-container" 
        ref={containerRef}
        onScroll={handleScroll}
      >
        {REELS_DATA.map((reel, index) => (
          <ReelVideo 
            key={reel.id} 
            reel={reel} 
            isActive={index === activeIndex} 
          />
        ))}
      </div>
    </div>
  );
}
