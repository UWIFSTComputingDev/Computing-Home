// components/course-marker.tsx
// components/course-marker.tsx

import React from 'react';
import { LucideIcon } from 'lucide-react'; 

interface Course {
  id: string;
  title: string;       // Generated in RoadmapPage map function
  description: string; // Generated in RoadmapPage map function
  position: string; 
  icon: LucideIcon;
  credits: number;     // Added to match your central data
  year: string;        // Added to match your central data (e.g., "y1")
}

interface CourseMarkerProps {
  course: Course;
  index: number;
}

export function CourseMarker({ course, index }: CourseMarkerProps) {
  // Use index to alternate position (top vs. bottom of the road)
  const isTop = index % 2 === 0;
  
  const positionStyle = {
    left: course.position,
    top: isTop ? '15%' : '65%', 
  };

  return (
    <div 
      className="absolute z-10 transform -translate-x-1/2 cursor-pointer group"
      style={positionStyle}
    >
      {/* The Interactive Marker */}
      <div className="relative w-10 h-10 rounded-full bg-[color:var(--primary-color)] transition-all duration-300 hover:scale-125 hover:shadow-xl flex items-center justify-center">
        <course.icon className="w-5 h-5 text-white" />
      </div>

      {/* Connection Line */}
      <div className={`absolute w-1 h-8 bg-[color:var(--primary-color)]/50 -translate-x-1/2 z-0 ${isTop ? 'bottom-full' : 'top-full'} left-1/2`} />

      {/* Hover Tooltip */}
      <div 
        className={`absolute z-20 w-80 p-4 bg-[color:var(--card)] border border-[color:var(--primary-color)] rounded-xl shadow-2xl transition-opacity duration-300 pointer-events-none 
          ${isTop ? 'bottom-[120%]' : 'top-[120%]'} 
          left-1/2 transform -translate-x-1/2 
          opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto`}
      >
        <p className="text-lg font-extrabold text-[color:var(--primary-color)]">{course.title}</p>
        <p className="text-sm text-[color:var(--text)] mt-1">{course.description}</p>
        
        {/* Dynamic Details from Central Data */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-[color:var(--border-color)]">
          <span className="text-xs font-bold text-[color:var(--muted)]">Year: {course.year.toUpperCase()}</span>
          <span className="text-xs px-2 py-1 rounded bg-[color:var(--primary-color)]/10 text-[color:var(--primary-color)]">
            {course.credits} Credits
          </span>
        </div>

        {/* Tooltip Arrow */}
        <div className={`absolute w-3 h-3 rotate-45 bg-[color:var(--card)] border-r border-b border-[color:var(--primary-color)] ${isTop ? 'bottom-[-7px]' : 'top-[-7px]'} left-1/2 -translate-x-1/2`} />
      </div>
    </div>
  );
}