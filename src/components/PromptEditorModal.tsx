import React, { useState, useEffect } from "react";
import type { Prompt, Tag as TagType, PromptVersion } from "../types";
import Tag from "./Tag";
import { X, Plus } from "lucide-react";
import { createTag } from "../services/indexedDBService";

interface PromptEditorModalProps {
  prompt: Prompt | null;
  allTags: TagType[];
  onClose: () => void;
  onSave: (prompt: Prompt, newTags: TagType[]) => void;
  onDelete?: (promptId: string) => void;
}

const tagColors = [
  "bg-red-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-lime-500",
  "bg-emerald-500",
];

const PromptEditorModal: React.FC<PromptEditorModalProps> = ({
  prompt,
  allTags,
  onClose,
  onSave,
  onDelete,
}) => {
  const [editedPrompt, setEditedPrompt] = useState<Prompt | null>(null);
  const [currentVersion, setCurrentVersion] = useState<PromptVersion | null>(
    null
  );
  const [newTagName, setNewTagName] = useState("");
  const [localTags, setLocalTags] = useState<TagType[]>(allTags);

  useEffect(() => {
    if (prompt) {
      const newEditedPrompt = JSON.parse(JSON.stringify(prompt));

      if (prompt.current_version_id && prompt.versions) {
        const version = prompt.versions.find(
          (v) => v.id === prompt.current_version_id
        );
        setCurrentVersion(version ? JSON.parse(JSON.stringify(version)) : null);
        setEditedPrompt(newEditedPrompt);
      } else {
        // New prompt, create a default version to work with
        const defaultVersion: PromptVersion = {
          id: `temp-version-${Date.now()}`,
          prompt_id: "temp-prompt",
          version_number: 1,
          content: "",
          model_settings: {
            model: "gemini-2.5-flash",
            temperature: 0.7,
            max_tokens: 1024,
          },
          created_at: new Date().toISOString(),
        };
        setCurrentVersion(defaultVersion);
        setEditedPrompt({
          ...newEditedPrompt,
          versions: [defaultVersion],
          current_version_id: defaultVersion.id,
        });
      }
    } else {
      setEditedPrompt(null);
      setCurrentVersion(null);
    }
  }, [prompt]);

  const handleContentChange = (
    e: React.ChangeEvent<
      HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (!currentVersion) return;

    if (name === "title" && editedPrompt) {
      setEditedPrompt({ ...editedPrompt, title: value });
      return;
    }

    if (name === "temperature" || name === "max_tokens") {
      setCurrentVersion({
        ...currentVersion,
        model_settings: {
          ...currentVersion.model_settings,
          [name]: parseFloat(value),
        },
      });
    } else if (name === "model") {
      setCurrentVersion({
        ...currentVersion,
        model_settings: {
          ...currentVersion.model_settings,
          [name]: value as PromptVersion["model_settings"]["model"],
        },
      });
    } else {
      setCurrentVersion({ ...currentVersion, [name]: value });
    }
  };

  const handleTagRemove = (tagId: string) => {
    if (!editedPrompt) return;
    setEditedPrompt({
      ...editedPrompt,
      tags: editedPrompt.tags.filter((id) => id !== tagId),
    });
  };

  const handleTagAdd = (tagId: string) => {
    if (!editedPrompt || editedPrompt.tags.includes(tagId)) return;
    setEditedPrompt({
      ...editedPrompt,
      tags: [...editedPrompt.tags, tagId],
    });
  };

  const handleCreateAndAddTag = async () => {
    if (newTagName.trim() === "" || !editedPrompt) return;
    const existingTag = localTags.find(
      (t) => t.name.toLowerCase() === newTagName.trim().toLowerCase()
    );
    if (existingTag) {
      handleTagAdd(existingTag.id);
    } else {
      const newTag: TagType = {
        id: crypto.randomUUID(),
        name: newTagName.trim().toLowerCase(),
        color: tagColors[Math.floor(Math.random() * tagColors.length)],
      };
      await createTag(newTag);
      setLocalTags([...localTags, newTag]);
      handleTagAdd(newTag.id);
    }
    setNewTagName("");
  };

  const handleSave = () => {
    if (!editedPrompt || !currentVersion) return;

    const finalPrompt: Prompt = {
      ...editedPrompt,
      versions: editedPrompt.versions.map((v) =>
        v.id === currentVersion.id ? currentVersion : v
      ),
      current_version_id: currentVersion.id,
    };

    onSave(finalPrompt, localTags);
    onClose();
  };

  if (!prompt || !editedPrompt || !currentVersion) return null;

  const currentTags = localTags.filter((t) => editedPrompt.tags.includes(t.id));

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Edit Prompt</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Editor */}
          <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
            <input
              type="text"
              name="title"
              value={editedPrompt.title}
              onChange={handleContentChange}
              placeholder="Prompt Title"
              className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-lg font-semibold text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <textarea
              name="content"
              value={currentVersion.content}
              onChange={handleContentChange}
              placeholder="Enter your prompt here..."
              className="w-full flex-1 bg-black border border-zinc-700 rounded-lg p-3 text-base text-zinc-300 font-mono leading-relaxed resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </main>

          {/* Settings Sidebar */}
          <aside className="w-80 rounded-xl border-zinc-700 p-6 flex flex-col gap-6 overflow-y-auto bg-black mr-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 mb-2">
                Model Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="model"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Model
                  </label>
                  <select
                    id="model"
                    name="model"
                    value={currentVersion.model_settings.model}
                    onChange={handleContentChange}
                    className="mt-1 block w-full bg-zinc-700 border-zinc-600 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 text-white"
                  >
                    <option>gemini-2.5-flash</option>
                    <option>gpt-4</option>
                    <option>claude-3</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="temperature"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Temperature: {currentVersion.model_settings.temperature}
                  </label>
                  <input
                    type="range"
                    id="temperature"
                    name="temperature"
                    min="0"
                    max="1"
                    step="0.1"
                    value={currentVersion.model_settings.temperature}
                    onChange={handleContentChange}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="max_tokens"
                    className="block text-sm font-medium text-zinc-300"
                  >
                    Max Tokens: {currentVersion.model_settings.max_tokens}
                  </label>
                  <input
                    type="range"
                    id="max_tokens"
                    name="max_tokens"
                    min="64"
                    max="4096"
                    step="64"
                    value={currentVersion.model_settings.max_tokens}
                    onChange={handleContentChange}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-700 pt-6">
              <h3 className="text-sm font-semibold text-zinc-400 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {currentTags.map((tag) => (
                  <Tag key={tag.id} tag={tag} onRemove={handleTagRemove} />
                ))}
              </div>

              <div className="mt-4">
                <h4 className="text-xs text-zinc-500 mb-2">Add Tag</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCreateAndAddTag()
                    }
                    placeholder="New or existing tag"
                    className="flex-1 bg-zinc-700 border-zinc-600 rounded-md shadow-sm p-2 text-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleCreateAndAddTag}
                    className="p-2 bg-indigo-600 rounded-md hover:bg-indigo-500 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="p-4 flex justify-between items-center">
          {onDelete && (
            <button
              onClick={() => onDelete(prompt.id)}
              className="px-4 py-2 text-sm font-semibold text-red-400 rounded-md hover:bg-red-500/20 transition-colors"
            >
              Delete Prompt
            </button>
          )}
          <div className="flex gap-4 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors"
            >
              Save
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PromptEditorModal;
