import React from "react";
import type {
  Prompt as PromptType,
  Tag as TagType,
  Project,
  Folder,
} from "../types";
import PromptCard from "./PromptCard";
import {
  Plus,
  FolderKanban as ProjectIcon,
  Folder as FolderIcon,
} from "lucide-react";

interface PromptListProps {
  prompts: PromptType[];
  allTags: TagType[];
  selectedProject: Project | null;
  selectedFolder: Folder | null;
  onSelectPrompt: (prompt: PromptType) => void;
  onCreatePrompt: () => void;
  onSelectTag: (tagId: string | null) => void;
  selectedTagId: string | null;
  showingAllPrompts: boolean;
}

const PromptList: React.FC<PromptListProps> = ({
  prompts,
  allTags,
  selectedProject,
  selectedFolder,
  onSelectPrompt,
  onCreatePrompt,
  onSelectTag,
  selectedTagId,
  showingAllPrompts,
}) => {
  const getBreadcrumbs = () => {
    if (showingAllPrompts) {
      return (
        <div className="flex items-center gap-2 text-xl font-semibold text-white">
          <ProjectIcon className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
          <span>All Prompts</span>
        </div>
      );
    }
    if (!selectedProject)
      return (
        <div className="text-lg font-semibold text-zinc-400">
          Select a project to begin
        </div>
      );
    return (
      <div className="flex items-center gap-2 text-xl font-semibold text-white">
        <ProjectIcon className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
        <span>{selectedProject.name}</span>
        {selectedFolder && (
          <>
            <span className="text-zinc-500">/</span>
            <FolderIcon className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
            <span>{selectedFolder.name}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto">
      <header className="flex justify-between items-center mb-6">
        <div>
          {getBreadcrumbs()}
          <p className="text-zinc-400 mt-1">
            {prompts.length} {prompts.length === 1 ? "prompt" : "prompts"}
          </p>
        </div>

        <button
          onClick={onCreatePrompt}
          disabled={!selectedProject && !showingAllPrompts}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors duration-200 disabled:bg-zinc-600 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          New Prompt
        </button>
      </header>
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => onSelectTag(null)}
          className={`px-3 py-1 text-sm font-semibold rounded-full ${
            selectedTagId === null
              ? "bg-indigo-600 text-white"
              : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
          }`}
        >
          All Prompts
        </button>
        {allTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onSelectTag(tag.id)}
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              selectedTagId === tag.id
                ? `${tag.color} text-white`
                : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {prompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {prompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              tags={allTags}
              onSelect={onSelectPrompt}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h3 className="text-lg font-semibold text-zinc-300">
            No Prompts Here
          </h3>
          <p className="text-zinc-500 mt-2">
            Create a new prompt to get started!
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptList;
