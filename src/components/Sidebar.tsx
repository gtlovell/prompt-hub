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
  X,
} from "lucide-react";

interface SidebarProps {
  projects: Project[];
  folders: Folder[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onAddFolder: () => void;
  onEditFolder: (folder: Folder) => void;
  onToggleFolderFavorite: (folder: Folder) => void;
  onShowAllPrompts: () => void;
  showingAllPrompts: boolean;
  onOpenFeedbackModal: () => void;
  isOpen: boolean;
  onClose: () => void;
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
  onEditProject,
  onAddFolder,
  onEditFolder,
  onToggleFolderFavorite,
  onShowAllPrompts,
  showingAllPrompts,
  onOpenFeedbackModal,
  isOpen,
  onClose,
}) => {
  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>(
    projects.reduce((acc, p) => ({ ...acc, [p.id]: true }), {})
  );
  const [isFoldersOpen, setFoldersOpen] = useState(true);
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

  const projectsWithFolders = projects.filter(
    (p) =>
      folders.some((f) => f.project_id === p.id) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        folders.some(
          (f) =>
            f.project_id === p.id &&
            f.name.toLowerCase().includes(searchQuery.toLowerCase())
        ))
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>
      <aside
        className={`w-72 flex-shrink-0 bg-black backdrop-blur-lg border-r border-zinc-800 flex flex-col p-4 space-y-4 overflow-y-auto fixed inset-y-0 left-0 z-40 md:static md:translate-x-0 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BrainCircuit className="w-6 h-6 mr-2" strokeWidth={1} />
            <h1 className="text-xl font-bold text-white">Prompt Hub</h1>
          </div>
          <button onClick={onClose} className="md:hidden p-1">
            <X className="w-6 h-6 text-zinc-400" />
          </button>
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
                    <FolderIcon
                      className="h-5 w-5 shrink-0"
                      strokeWidth={1.5}
                    />
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
                    onContextMenu={(e) => {
                      e.preventDefault();
                      onEditProject(project);
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
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setFoldersOpen(!isFoldersOpen)}
                className="w-full flex items-center justify-between text-xs font-semibold uppercase text-zinc-500"
              >
                <span>Folders</span>
                {isFoldersOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
            {isFoldersOpen && (
              <ul className="space-y-1">
                {projectsWithFolders.map((project) => (
                  <li key={project.id}>
                    <span className="flex items-center gap-x-3 text-sm leading-6 font-semibold p-2 text-zinc-200">
                      <span
                        className={`w-2 h-2 rounded-full ${project.color}`}
                      ></span>
                      <span className="truncate">{project.name}</span>
                    </span>
                    <FolderTree
                      folders={folders.filter(
                        (f) => f.project_id === project.id
                      )}
                      parentId={null}
                      onSelectFolder={(folderId) => {
                        onSelectProject(project.id);
                        onSelectFolder(folderId);
                      }}
                      selectedFolderId={selectedFolderId}
                      level={1}
                      onEditFolder={onEditFolder}
                      onToggleFolderFavorite={onToggleFolderFavorite}
                    />
                  </li>
                ))}
              </ul>
            )}
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
    </>
  );
};

export default Sidebar;
