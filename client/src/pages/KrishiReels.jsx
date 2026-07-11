import React, { useState, useRef, useEffect } from 'react';
import './KrishiReels.css';

const REELS_DATA = [
  {
    id: 1,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-farmer-walking-in-a-field-of-wheat-44225-large.mp4',
    title: 'Modern Wheat Farming',
    description: 'Learn how modern tools help increase wheat yield by 20% this season! 🌾🚜',
    author: '@AgriTech_India',
    likes: '12.4k',
    comments: '342'
  },
  {
    id: 2,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-farmer-examining-wheat-ears-44228-large.mp4',
    title: 'Crop Inspection Tips',
    description: 'Always check the roots and early leaves for signs of pest damage. Early detection saves crops! 🐛🔍',
    author: '@KisanExpert',
    likes: '8.1k',
    comments: '128'
  },
  {
    id: 3,
    url: 'https://assets.mixkit.co/videos/preview/mixkit-tractor-harvesting-in-a-wheat-field-44231-large.mp4',
    title: 'Efficient Harvesting',
    description: 'See the new heavy-duty harvester in action on a 50-acre farm in Punjab. 🚜💪',
    author: '@FarmMachinery',
    likes: '45.2k',
    comments: '1.2k'
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
