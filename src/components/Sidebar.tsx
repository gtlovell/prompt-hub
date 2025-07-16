import React, { useState } from "react";
import type { Project, Folder } from "../types";
import {
  Folder as FolderIcon,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Star,
  Mail,
} from "lucide-react";

interface SidebarProps {
  projects: Project[];
  folders: Folder[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onAddProject: () => void;
  onAddFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onToggleFolderFavorite: (folder: Folder) => void;
  onShowAllPrompts: () => void;
  showingAllPrompts: boolean;
  onOpenFeedbackModal: () => void;
}

const FolderTree: React.FC<{
  folders: Folder[];
  parentId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  selectedFolderId: string | null;
  level: number;
  onEditFolder: (folder: Folder) => void;
  onToggleFolderFavorite: (folder: Folder) => void;
}> = ({
  folders,
  parentId,
  onSelectFolder,
  selectedFolderId,
  level,
  onEditFolder,
  onToggleFolderFavorite,
}) => {
  const childFolders = folders.filter((f) => f.parent_folder_id === parentId);

  if (childFolders.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-1">
      {childFolders.map((folder) => (
        <li key={folder.id}>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onSelectFolder(folder.id);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              onEditFolder(folder);
            }}
            style={{ paddingLeft: `${1 + level * 1.5}rem` }}
            className={`group flex items-center justify-between gap-x-3 text-sm leading-6 font-semibold p-2 rounded-md transition-colors duration-150 ${
              selectedFolderId === folder.id
                ? "bg-zinc-900 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center gap-x-3">
              <FolderIcon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{folder.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFolderFavorite(folder);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Star
                className={`h-4 w-4 ${
                  folder.is_favorite
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-zinc-500"
                }`}
              />
            </button>
          </a>
          <FolderTree
            folders={folders}
            parentId={folder.id}
            onSelectFolder={onSelectFolder}
            selectedFolderId={selectedFolderId}
            level={level + 1}
            onEditFolder={onEditFolder}
            onToggleFolderFavorite={onToggleFolderFavorite}
          />
        </li>
      ))}
    </ul>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  projects,
  folders,
  selectedProjectId,
  onSelectProject,
  selectedFolderId,
  onSelectFolder,
  onAddProject,
  onAddFolder,
  onEditFolder,
  onToggleFolderFavorite,
  onShowAllPrompts,
  showingAllPrompts,
  onOpenFeedbackModal,
}) => {
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>(
    projects.reduce((acc, p) => ({ ...acc, [p.id]: true }), {})
  );
  const [searchQuery, setSearchQuery] = useState("");

  const toggleProject = (projectId: string) => {
    setOpenProjects((prev) => ({ ...prev, [projectId]: !prev[projectId] }));
    onSelectProject(projectId);
    onSelectFolder(null);
  };

  const projectFolders = folders.filter(
    (f) => f.project_id === selectedProjectId
  );

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = projectFolders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteFolders = folders.filter((f) => f.is_favorite);

  return (
    <aside className="w-72 flex-shrink-0 bg-black backdrop-blur-lg border-r border-zinc-800 flex flex-col p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center ">
        <BrainCircuit className="w-6 h-6 mr-2" strokeWidth={1} />
        <h1 className="text-xl font-bold text-white">Prompt Hub</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        onClick={onShowAllPrompts}
        className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-md ${
          showingAllPrompts
            ? "bg-indigo-600 text-white"
            : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
        }`}
      >
        All Prompts
      </button>

      <nav className="flex-1 space-y-4">
        <div>
          <h2 className="text-xs font-semibold uppercase text-zinc-500 mb-2">
            Favorites
          </h2>
          <ul className="space-y-1">
            {favoriteFolders.map((folder) => (
              <li key={folder.id}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectProject(folder.project_id);
                    onSelectFolder(folder.id);
                  }}
                  className={`flex items-center gap-x-3 text-sm leading-6 font-semibold p-2 rounded-md transition-colors duration-150 ${
                    selectedFolderId === folder.id
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <FolderIcon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                  <span className="truncate">{folder.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold uppercase text-zinc-500">
              Projects
            </h2>
            <button
              onClick={onAddProject}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
          <ul className="space-y-1">
            {filteredProjects.map((project) => (
              <li key={project.id}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleProject(project.id);
                  }}
                  className={`flex items-center gap-x-3 text-sm leading-6 font-semibold p-2 transition-colors duration-150 border-l-4 ${
                    selectedProjectId === project.id
                      ? `border-${project.color.split("-")[1]}-${
                          project.color.split("-")[2]
                        } text-white`
                      : "border-transparent text-zinc-200 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {openProjects[project.id] ? (
                    <ChevronDown
                      className="h-5 w-5 shrink-0"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <ChevronRight
                      className="h-5 w-5 shrink-0"
                      strokeWidth={1.5}
                    />
                  )}
                  <span className="truncate">{project.name}</span>
                </a>

                {openProjects[project.id] &&
                  selectedProjectId === project.id && (
                    <div className="mt-2 pl-4 space-y-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold uppercase text-zinc-500 pl-4">
                          Folders
                        </h3>
                        <button
                          onClick={onAddFolder}
                          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </div>
                      <FolderTree
                        folders={filteredFolders}
                        parentId={null}
                        onSelectFolder={onSelectFolder}
                        selectedFolderId={selectedFolderId}
                        level={1}
                        onEditFolder={onEditFolder}
                        onToggleFolderFavorite={onToggleFolderFavorite}
                      />
                    </div>
                  )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
      {/* User profile section */}
      <div className="mt-auto pt-4 border-t border-zinc-800">
        <button
          onClick={onOpenFeedbackModal}
          className="w-full flex items-center gap-x-3 text-sm leading-6 font-semibold p-2 rounded-md transition-colors duration-150 text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Mail className="h-5 w-5 shrink-0" strokeWidth={1.5} />
          <span>Send Feedback</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
