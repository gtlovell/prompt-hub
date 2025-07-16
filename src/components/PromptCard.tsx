import React from "react";
import type {
  Prompt as PromptType,
  Tag as TagType,
  PromptVersion,
} from "../types";
import { Star } from "lucide-react";
import Tag from "./Tag";

interface PromptCardProps {
  prompt: PromptType;
  tags: TagType[];
  onSelect: (prompt: PromptType) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, tags, onSelect }) => {
  const currentVersion: PromptVersion | undefined = prompt.versions.find(
    (v) => v.id === prompt.current_version_id
  );
  const promptTags = tags.filter((t) => prompt.tags.includes(t.id));

  return (
    <div
      onClick={() => onSelect(prompt)}
      className="bg-black rounded-lg p-4 flex flex-col justify-between group cursor-pointer border border-transparent hover:border-indigo-500 transition-all duration-200 shadow-lg hover:shadow-indigo-500/20"
    >
      <div>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors duration-200 truncate pr-2">
            {prompt.title}
          </h3>
          <Star
            className={`w-5 h-5 flex-shrink-0 transition-colors ${
              prompt.is_favorite
                ? "text-yellow-400"
                : "text-zinc-600 group-hover:text-yellow-400"
            }`}
            fill={prompt.is_favorite ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </div>
        <p className="text-sm text-zinc-400 mt-2 h-20 overflow-hidden text-ellipsis">
          {currentVersion?.content}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-700/50">
        {promptTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {promptTags.map((tag) => (
              <Tag key={tag.id} tag={tag} />
            ))}
          </div>
        ) : (
          <div className="text-sm text-zinc-500 italic">No tags</div>
        )}
      </div>
    </div>
  );
};

export default PromptCard;
