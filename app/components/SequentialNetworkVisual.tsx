"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function SequentialNetworkVisual({ className }: { className?: string }) {
  const [activeLineIndex, setActiveLineIndex] = useState<number>(-1);
  
  const connections = [
    { id: 0, d: "M 120 160 L 200 300", color: "#23137f", isOrange: false },
    { id: 1, d: "M 150 180 L 200 300", color: "#f16609", isOrange: true },
    { id: 2, d: "M 200 150 L 200 300", color: "#f16609", isOrange: true },
    { id: 3, d: "M 250 180 L 200 300", color: "#f16609", isOrange: true },
    { id: 4, d: "M 280 160 L 200 300", color: "#23137f", isOrange: false },
    { id: 5, d: "M 150 180 L 200 150", color: "#f16609", isOrange: true },
    { id: 6, d: "M 200 150 L 250 180", color: "#f16609", isOrange: true },
    { id: 7, d: "M 120 160 L 280 160", color: "#23137f", isOrange: false },
    { id: 8, d: "M 200 300 L 120 440", color: "#23137f", isOrange: false },
    { id: 9, d: "M 200 300 L 150 420", color: "#f16609", isOrange: true },
    { id: 10, d: "M 200 300 L 200 450", color: "#f16609", isOrange: true },
    { id: 11, d: "M 200 300 L 250 420", color: "#f16609", isOrange: true },
    { id: 12, d: "M 200 300 L 280 440", color: "#23137f", isOrange: false },
    { id: 13, d: "M 150 420 L 200 450", color: "#f16609", isOrange: true },
    { id: 14, d: "M 200 450 L 250 420", color: "#f16609", isOrange: true },
    { id: 15, d: "M 120 440 L 280 440", color: "#23137f", isOrange: false },
  ];
  
  const aestheticDots = [
    { cx: 60, cy: 150, isOrange: true, size: 3.5 },
    { cx: 75, cy: 220, isOrange: false, size: 2.8 },
    { cx: 85, cy: 300, isOrange: true, size: 3 },
    { cx: 95, cy: 380, isOrange: false, size: 2.5 },
    { cx: 70, cy: 450, isOrange: true, size: 3.2 },
    { cx: 100, cy: 520, isOrange: false, size: 2.3 },
    { cx: 340, cy: 160, isOrange: true, size: 3.5 },
    { cx: 325, cy: 240, isOrange: false, size: 2.8 },
    { cx: 315, cy: 320, isOrange: true, size: 3 },
    { cx: 330, cy: 400, isOrange: false, size: 2.5 },
    { cx: 320, cy: 470, isOrange: true, size: 3.2 },
    { cx: 310, cy: 540, isOrange: false, size: 2.3 },
    { cx: 120, cy: 100, isOrange: false, size: 2.5 },
    { cx: 280, cy: 110, isOrange: true, size: 2.8 },
    { cx: 160, cy: 130, isOrange: true, size: 2.2 },
    { cx: 240, cy: 125, isOrange: false, size: 2.4 },
    { cx: 150, cy: 490, isOrange: true, size: 2.5 },
    { cx: 250, cy: 510, isOrange: false, size: 2.8 },
    { cx: 180, cy: 530, isOrange: true, size: 2.2 },
    { cx: 220, cy: 550, isOrange: false, size: 2.4 },
    { cx: 50, cy: 280, isOrange: true, size: 2.6 },
    { cx: 50, cy: 420, isOrange: false, size: 2.4 },
    { cx: 350, cy: 290, isOrange: true, size: 2.6 },
    { cx: 350, cy: 410, isOrange: false, size: 2.4 },
  ];
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let currentIndex = 0;
    
    const cycleLines = () => {
      setActiveLineIndex(currentIndex);
      currentIndex = (currentIndex + 1) % connections.length;
      timeoutId = setTimeout(() => cycleLines(), 1800);
    };
    
    timeoutId = setTimeout(() => cycleLines(), 1500);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
  
  return (
    <svg
      className={className}
      viewBox="0 0 400 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {[
        { cx: 120, cy: 160, isOrange: false },
        { cx: 150, cy: 180, isOrange: true },
        { cx: 200, cy: 150, isOrange: true },
        { cx: 250, cy: 180, isOrange: true },
        { cx: 280, cy: 160, isOrange: false },
      ].map((node, i) => (
        <g key={`input-node-${i}`}>
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="12"
            fill={node.isOrange ? "rgba(241, 102, 9, 0.15)" : "rgba(35, 19, 127, 0.15)"}
            animate={{
              opacity: [0.2, 0.35, 0.2],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 4 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="7"
            fill={node.isOrange ? "rgba(241, 102, 9, 0.25)" : "rgba(35, 19, 127, 0.25)"}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="4"
            fill={node.isOrange ? "#f16609" : "#23137f"}
            animate={{
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 2.5 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.15,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </g>
      ))}
      
      <g>
        <motion.circle
          cx="200"
          cy="300"
          r="32"
          fill="rgba(241, 102, 9, 0.12)"
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
        <motion.circle
          cx="200"
          cy="300"
          r="24"
          fill="rgba(241, 102, 9, 0.25)"
          animate={{
            opacity: [0.25, 0.4, 0.25],
            scale: [1, 1.18, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
        <motion.circle
          cx="200"
          cy="300"
          r="18"
          fill="rgba(241, 102, 9, 0.4)"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
        <motion.circle
          cx="200"
          cy="300"
          r="12"
          fill="#f16609"
          animate={{
            opacity: [0.95, 1, 0.95],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
        {[0, 1, 2].map((i) => {
          const angle = (i * 120 * Math.PI) / 180;
          const radius = 20;
          const x = 200 + radius * Math.cos(angle);
          const y = 300 + radius * Math.sin(angle);
          return (
            <motion.circle
              key={`sparkle-${i}`}
              cx={x}
              cy={y}
              r="2"
              fill="#f16609"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </g>
      
      {[
        { cx: 120, cy: 440, isOrange: false },
        { cx: 150, cy: 420, isOrange: true },
        { cx: 200, cy: 450, isOrange: true },
        { cx: 250, cy: 420, isOrange: true },
        { cx: 280, cy: 440, isOrange: false },
      ].map((node, i) => (
        <g key={`output-node-${i}`}>
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="12"
            fill={node.isOrange ? "rgba(241, 102, 9, 0.15)" : "rgba(35, 19, 127, 0.15)"}
            animate={{
              opacity: [0.2, 0.35, 0.2],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 4 + i * 0.4,
              repeat: Infinity,
              delay: i * 0.15 + 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="7"
            fill={node.isOrange ? "rgba(241, 102, 9, 0.25)" : "rgba(35, 19, 127, 0.25)"}
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.15 + 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
          <motion.circle
            cx={node.cx}
            cy={node.cy}
            r="4"
            fill={node.isOrange ? "#f16609" : "#23137f"}
            animate={{
              opacity: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 2.5 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.15 + 0.3,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </g>
      ))}
      
      {connections.map((conn, index) => {
        const isActive = activeLineIndex === index;
        const wasActive = activeLineIndex === (index - 1 + connections.length) % connections.length;
        const willBeActive = activeLineIndex === (index + 1) % connections.length;
        const isOrangeLine = conn.isOrange;
        const connectsToCenter = conn.d.includes("200 300");
        
        return (
          <g key={conn.id}>
            {isActive && connectsToCenter && (
              <>
                <motion.path
                  d={conn.d}
                  strokeWidth={isOrangeLine ? "8" : "7"}
                  fill="none"
                  strokeLinecap="round"
                  stroke="rgba(0, 0, 0, 0.4)"
                  opacity="0.3"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                  }}
                  transition={{ 
                    duration: 1.8,
                    ease: "easeOut"
                  }}
                  style={{
                    filter: "blur(4px)",
                    transform: "translate(2px, 2px)",
                  }}
                />
                <motion.path
                  d={conn.d}
                  strokeWidth={isOrangeLine ? "6" : "5"}
                  fill="none"
                  strokeLinecap="round"
                  stroke={conn.color}
                  opacity="0.25"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                  }}
                  transition={{ 
                    duration: 1.8,
                    ease: "easeOut"
                  }}
                  style={{
                    filter: "blur(2px)",
                    transform: "translate(1px, 1px)",
                  }}
                />
              </>
            )}
            
            {isActive && isOrangeLine && (
              <motion.path
                d={conn.d}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                stroke="#f16609"
                opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ 
                  pathLength: 1,
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ 
                  duration: 1.5, 
                  ease: "easeInOut",
                  opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              />
            )}
            {isActive && !isOrangeLine && (
              <motion.path
                d={conn.d}
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                stroke={conn.color}
                opacity="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            )}
            <motion.path
              d={conn.d}
              strokeWidth={isOrangeLine ? (connectsToCenter ? "3.5" : "3") : (connectsToCenter ? "3" : "2.5")}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: isActive ? 1 : wasActive ? 1 : 0,
                opacity: isActive 
                  ? (isOrangeLine ? 1 : 0.85) 
                  : wasActive 
                  ? (isOrangeLine ? 0.4 : 0.3) 
                  : willBeActive 
                  ? 0.1 
                  : 0,
                stroke: conn.color,
                filter: isActive && connectsToCenter ? "drop-shadow(0 0 8px " + conn.color + ")" : "none",
              }}
              transition={{
                pathLength: { 
                  duration: isActive ? 1.8 : 0.3, 
                  ease: [0.4, 0, 0.2, 1]
                },
                opacity: { 
                  duration: 0.5, 
                  ease: [0.4, 0, 0.2, 1]
                },
              }}
            />
            {isActive && connectsToCenter && (
              <motion.circle
                cx="200"
                cy="300"
                r={isOrangeLine ? "5" : "4"}
                fill={conn.color}
                animate={{
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </g>
        );
      })}
      
      {aestheticDots.map((dot, i) => {
        const centerX = 200;
        const centerY = 300;
        const distance = Math.sqrt(Math.pow(dot.cx - centerX, 2) + Math.pow(dot.cy - centerY, 2));
        const maxDistance = Math.sqrt(Math.pow(400, 2) + Math.pow(600, 2));
        const distanceRatio = distance / maxDistance;
        const baseOpacity = 0.5 - (distanceRatio * 0.3);
        const maxOpacity = 1.0 - (distanceRatio * 0.4);
        
        return (
          <g key={`aesthetic-${i}`}>
            <motion.circle
              cx={dot.cx}
              cy={dot.cy}
              r={dot.size * 2.5}
              fill={dot.isOrange ? "rgba(241, 102, 9, 0.2)" : "rgba(35, 19, 127, 0.2)"}
              animate={{
                opacity: [baseOpacity * 0.2, baseOpacity * 0.4, baseOpacity * 0.2],
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx={dot.cx}
              cy={dot.cy}
              r={dot.size}
              fill={dot.isOrange ? "#f16609" : "#23137f"}
              animate={{
                opacity: [baseOpacity, maxOpacity, baseOpacity, maxOpacity * 0.8, baseOpacity],
                scale: [0.8, 1.3, 0.9, 1.2, 0.8],
              }}
              transition={{
                duration: 2.5 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.25,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx={dot.cx}
              cy={dot.cy}
              r={dot.size * 0.5}
              fill={dot.isOrange ? "#ff8c42" : "#4a3fa8"}
              animate={{
                opacity: [baseOpacity * 0.6, maxOpacity, baseOpacity * 0.6],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 1.8 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}



