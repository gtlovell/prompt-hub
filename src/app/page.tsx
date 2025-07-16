"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import PromptList from "../components/PromptList";
import PromptEditorModal from "../components/PromptEditorModal";
import ProjectEditorModal from "../components/ProjectEditorModal";
import FolderEditorModal from "../components/FolderEditorModal";
import FeedbackModal from "../components/FeedbackModal";
import {
  getProjects,
  createPrompt,
  updatePrompt,
  deletePrompt,
  createProject,
  createFolder,
  updateFolder,
  deleteFolder,
  deleteProject,
  getAllFolders,
  getAllTags,
  getAllPrompts,
} from "../services/indexedDBService";
import type { Project, Folder, Prompt, Tag } from "../types";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [showingAllPrompts, setShowingAllPrompts] = useState(false);

  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setProjectModalOpen] = useState(false);
  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const projectsData = await getProjects();
      setProjects(projectsData);
      if (projectsData.length > 0) {
        setSelectedProjectId(projectsData[0].id);
      } else {
        // Create a default project if none exist
        const newProject = await createProject({
          name: "My First Project",
          description: "A default project",
          color: "bg-blue-500",
        });
        setProjects([newProject]);
        setSelectedProjectId(newProject.id);
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchFolders = async () => {
      const foldersData = await getAllFolders();
      setFolders(foldersData);
    };
    fetchFolders();
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      const tagsData = await getAllTags();
      setTags(tagsData);
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      const promptsData = await getAllPrompts();
      setPrompts(promptsData);
      setLoading(false);
    };
    fetchPrompts();
  }, []);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );
  const selectedFolder = useMemo(
    () => folders.find((f) => f.id === selectedFolderId) || null,
    [folders, selectedFolderId]
  );

  const filteredPrompts = useMemo(() => {
    if (showingAllPrompts) {
      return prompts.filter((prompt) => {
        const hasTag =
          selectedTagId === null ? true : prompt.tags.includes(selectedTagId);
        return hasTag;
      });
    }

    if (!selectedProjectId) return [];

    return prompts.filter((prompt) => {
      const inProject = prompt.project_id === selectedProjectId;
      const inFolder =
        selectedFolderId === null
          ? true
          : prompt.folder_id === selectedFolderId;
      const hasTag =
        selectedTagId === null ? true : prompt.tags.includes(selectedTagId);
      return inProject && inFolder && hasTag;
    });
  }, [
    prompts,
    selectedProjectId,
    selectedFolderId,
    selectedTagId,
    showingAllPrompts,
  ]);

  const handleSelectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedFolderId(null);
    setShowingAllPrompts(false);
  }, []);

  const handleSelectFolder = useCallback((folderId: string | null) => {
    setSelectedFolderId(folderId);
    setShowingAllPrompts(false);
  }, []);

  const handleSelectTag = useCallback((tagId: string | null) => {
    setSelectedTagId(tagId);
  }, []);

  const handleShowAllPrompts = useCallback(() => {
    setShowingAllPrompts(true);
    setSelectedProjectId(null);
    setSelectedFolderId(null);
  }, []);

  const handleSelectPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
  };

  const handleAddProject = () => {
    setProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectModalOpen(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
  };

  const handleCloseModal = () => {
    setEditingPrompt(null);
    setProjectModalOpen(false);
    setEditingFolder(null);
    setEditingProject(null);
    setFeedbackModalOpen(false);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleCreatePrompt = () => {
    if (!selectedProjectId && !showingAllPrompts) return;

    const newPrompt: Omit<
      Prompt,
      "id" | "created_at" | "versions" | "current_version_id"
    > = {
      project_id: selectedProjectId || projects[0].id,
      folder_id: selectedFolderId,
      title: "",
      tags: [],
      is_favorite: false,
    };

    setEditingPrompt(newPrompt as unknown as Prompt);
  };

  const handleCreateFolder = async () => {
    if (!selectedProjectId) return;
    const newFolder = await createFolder({
      project_id: selectedProjectId,
      name: "New Folder",
      parent_folder_id: null,
    });
    setFolders((prevFolders) => [...prevFolders, newFolder]);
  };

  const handleSaveProject = async (project: Omit<Project, "id">) => {
    const newProject = await createProject(project);
    setProjects((prevProjects) => [...prevProjects, newProject]);
    setSelectedProjectId(newProject.id);
  };

  const handleDeleteProject = async (projectId: string) => {
    setLoading(true);
    await deleteProject(projectId);
    const updatedProjects = projects.filter((p) => p.id !== projectId);
    setProjects(updatedProjects);
    if (selectedProjectId === projectId) {
      setSelectedProjectId(
        updatedProjects.length > 0 ? updatedProjects[0].id : null
      );
    }
    setLoading(false);
    handleCloseModal();
  };

  const handleSavePrompt = async (updatedPrompt: Prompt, newTags: Tag[]) => {
    setLoading(true);
    if (updatedPrompt.created_at) {
      const savedPrompt = await updatePrompt(updatedPrompt);
      setPrompts((prevPrompts) =>
        prevPrompts.map((p) => (p.id === savedPrompt.id ? savedPrompt : p))
      );
    } else {
      const newPromptData: Omit<
        Prompt,
        "id" | "created_at" | "versions" | "current_version_id"
      > & { content: string } = {
        project_id: updatedPrompt.project_id,
        folder_id: updatedPrompt.folder_id,
        title: updatedPrompt.title,
        tags: updatedPrompt.tags,
        is_favorite: updatedPrompt.is_favorite,
        content: updatedPrompt.versions[0].content,
      };
      const newPrompt = await createPrompt(newPromptData);
      setPrompts((prevPrompts) => [...prevPrompts, newPrompt]);
    }

    setTags(newTags);
    setLoading(false);
    handleCloseModal();
  };

  const handleDeletePrompt = async (promptId: string) => {
    setLoading(true);
    await deletePrompt(promptId);
    setPrompts((prev) => prev.filter((p) => p.id !== promptId));
    setLoading(false);
    handleCloseModal();
  };

  const handleSaveFolder = async (folder: Folder) => {
    const savedFolder = await updateFolder(folder);
    setFolders((prev) =>
      prev.map((f) => (f.id === savedFolder.id ? savedFolder : f))
    );
    handleCloseModal();
  };

  const handleDeleteFolder = async (folderId: string) => {
    await deleteFolder(folderId);
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    handleCloseModal();
  };

  const handleToggleFolderFavorite = async (folder: Folder) => {
    const updatedFolder = { ...folder, is_favorite: !folder.is_favorite };
    setFolders((prev) =>
      prev.map((f) => (f.id === updatedFolder.id ? updatedFolder : f))
    );
    await updateFolder(updatedFolder);
  };

  const handleOpenFeedbackModal = () => {
    setFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = async (message: string) => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        console.log("Feedback sent successfully");
      } else {
        const errorData = await response.json();
        console.error(
          "Failed to send feedback:",
          errorData.error || response.statusText
        );
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
    handleCloseModal();
  };

  return (
    <div className="h-screen w-screen bg-zinc-900 flex text-slate-200 font-sans">
      <Sidebar
        projects={projects}
        folders={folders}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        selectedFolderId={selectedFolderId}
        onSelectFolder={handleSelectFolder}
        onAddProject={handleAddProject}
        onEditProject={handleEditProject}
        onAddFolder={handleCreateFolder}
        onEditFolder={handleEditFolder}
        onToggleFolderFavorite={handleToggleFolderFavorite}
        onShowAllPrompts={handleShowAllPrompts}
        showingAllPrompts={showingAllPrompts}
        onOpenFeedbackModal={handleOpenFeedbackModal}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : (
          <PromptList
            prompts={filteredPrompts}
            allTags={tags}
            selectedProject={selectedProject}
            selectedFolder={selectedFolder}
            onSelectPrompt={handleSelectPrompt}
            onCreatePrompt={handleCreatePrompt}
            onSelectTag={handleSelectTag}
            selectedTagId={selectedTagId}
            showingAllPrompts={showingAllPrompts}
            onToggleSidebar={handleToggleSidebar}
          />
        )}
      </main>

      {editingPrompt && (
        <PromptEditorModal
          prompt={editingPrompt}
          allTags={tags}
          onClose={handleCloseModal}
          onSave={handleSavePrompt}
          onDelete={handleDeletePrompt}
        />
      )}

      <ProjectEditorModal
        isOpen={isProjectModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
        project={editingProject}
      />

      <FolderEditorModal
        isOpen={!!editingFolder}
        onClose={handleCloseModal}
        onSave={handleSaveFolder}
        onDelete={handleDeleteFolder}
        folder={editingFolder}
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitFeedback}
      />
    </div>
  );
}
