import React from 'react';
import type { Tag as TagType } from '../types';

interface TagProps {
  tag: TagType;
  onRemove?: (tagId: string) => void;
}

const Tag: React.FC<TagProps> = ({ tag, onRemove }) => {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${tag.color}`}>
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(tag.id)}
          className="flex-shrink-0 ml-1.5 -mr-0.5 p-0.5 rounded-full inline-flex items-center justify-center text-white/70 hover:text-white hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
        >
          <span className="sr-only">Remove tag</span>
          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag;
