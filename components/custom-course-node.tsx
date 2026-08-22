// components/custom-course-node.tsx - This is the complete and correct file.

import { Handle, Position, NodeProps } from 'reactflow';
import React from 'react';

// Define the shape of the data property passed to the node
interface CourseNodeData {
  label: string;
}

// NodeProps includes the style prop passed from the initialNodes array in course-tree.tsx
export function CustomCourseNode({ data, style }: NodeProps<CourseNodeData>) {
  return (
    // 1. Pass the style prop directly to the container div to get the custom colors/padding.
    // 2. Add tailwind classes for rounded corners and shadow here for consistency.
    <div 
        style={style as React.CSSProperties}
        className="rounded-lg shadow-md" // Added basic styling here
    >
      <div className="text-sm font-bold text-center">{data.label}</div>

      {/* Target Handle (Input/Prerequisite connection point) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-2 h-2 bg-slate-500 rounded-full" 
      />
      
      {/* Source Handle (Output/Connection to next course) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-slate-500 rounded-full" 
      />
    </div>
  );
}