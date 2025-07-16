import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { Project, Folder, Prompt, Tag, PromptVersion } from "../types";

const DB_NAME = "AI-Prompt-Manager";
const DB_VERSION = 1;

interface MyDB extends DBSchema {
  projects: {
    key: string;
    value: Project;
    indexes: { "by-name": string };
  };
  folders: {
    key: string;
    value: Folder;
    indexes: { "by-project": string };
  };
  prompts: {
    key: string;
    value: Prompt;
    indexes: { "by-project": string; "by-folder": string };
  };
  tags: {
    key: string;
    value: Tag;
  };
  prompt_versions: {
    key: string;
    value: PromptVersion;
    indexes: { "by-prompt": string };
  };
}

let db: IDBPDatabase<MyDB>;

async function initDB() {
  if (db) return db;

  db = await openDB<MyDB>(DB_NAME, DB_VERSION, {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains("projects")) {
        db.createObjectStore("projects", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("folders")) {
        db.createObjectStore("folders", { keyPath: "id" }).createIndex(
          "by-project",
          "project_id"
        );
      }
      if (!db.objectStoreNames.contains("prompts")) {
        const promptStore = db.createObjectStore("prompts", { keyPath: "id" });
        promptStore.createIndex("by-project", "project_id");
        promptStore.createIndex("by-folder", "folder_id");
      }
      if (!db.objectStoreNames.contains("tags")) {
        db.createObjectStore("tags", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("prompt_versions")) {
        db.createObjectStore("prompt_versions", { keyPath: "id" }).createIndex(
          "by-prompt",
          "prompt_id"
        );
      }
    },
  });
  return db;
}

// Project functions
export const getProjects = async (): Promise<Project[]> => {
  const db = await initDB();
  return db.getAll("projects");
};

export const createProject = async (
  project: Omit<Project, "id">
): Promise<Project> => {
  const db = await initDB();
  const id = crypto.randomUUID();
  const newProject = { ...project, id };
  await db.add("projects", newProject);
  return newProject;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(
    ["projects", "folders", "prompts", "prompt_versions"],
    "readwrite"
  );

  // Delete project
  await tx.objectStore("projects").delete(projectId);

  // Find and delete folders
  const foldersToDelete = await tx
    .objectStore("folders")
    .index("by-project")
    .getAllKeys(projectId);
  for (const folderId of foldersToDelete) {
    await tx.objectStore("folders").delete(folderId);
  }

  // Find and delete prompts and their versions
  const promptsToDelete = await tx
    .objectStore("prompts")
    .index("by-project")
    .getAll(projectId);
  for (const prompt of promptsToDelete) {
    await tx.objectStore("prompts").delete(prompt.id);
    // Delete all versions of the prompt
    const versionsToDelete = await tx
      .objectStore("prompt_versions")
      .index("by-prompt")
      .getAllKeys(prompt.id);
    for (const versionId of versionsToDelete) {
      await tx.objectStore("prompt_versions").delete(versionId);
    }
  }

  await tx.done;
};

// Folder functions
export const getAllFolders = async (): Promise<Folder[]> => {
  const db = await initDB();
  return db.getAll("folders");
};

export const getFoldersByProject = async (
  projectId: string
): Promise<Folder[]> => {
  const db = await initDB();
  return db.getAllFromIndex("folders", "by-project", projectId);
};

export const createFolder = async (
  folder: Omit<Folder, "id" | "is_favorite">
): Promise<Folder> => {
  const db = await initDB();
  const id = crypto.randomUUID();
  const newFolder = { ...folder, id, is_favorite: false };
  await db.add("folders", newFolder);
  return newFolder;
};

export const updateFolder = async (folder: Folder): Promise<Folder> => {
  const db = await initDB();
  await db.put("folders", folder);
  return folder;
};

export const deleteFolder = async (folderId: string): Promise<void> => {
  const db = await initDB();
  await db.delete("folders", folderId);
  // Todo: Also delete all prompts in this folder
};

// Prompt functions
export const getAllPrompts = async (): Promise<Prompt[]> => {
  const db = await initDB();
  return db.getAll("prompts");
};

export const getPromptsByProject = async (
  projectId: string
): Promise<Prompt[]> => {
  const db = await initDB();
  return db.getAllFromIndex("prompts", "by-project", projectId);
};

export const createPrompt = async (
  prompt: Omit<
    Prompt,
    "id" | "created_at" | "versions" | "current_version_id"
  > & { content: string }
): Promise<Prompt> => {
  const db = await initDB();
  const promptId = crypto.randomUUID();
  const versionId = crypto.randomUUID();

  const newVersion: PromptVersion = {
    id: versionId,
    prompt_id: promptId,
    version_number: 1,
    content: prompt.content,
    model_settings: {
      model: "gemini-2.5-flash",
      temperature: 0.7,
      max_tokens: 1024,
    },
    created_at: new Date().toISOString(),
  };

  const newPrompt: Prompt = {
    ...prompt,
    id: promptId,
    created_at: new Date().toISOString(),
    versions: [newVersion],
    current_version_id: versionId,
  };

  const tx = db.transaction(["prompts", "prompt_versions"], "readwrite");
  await Promise.all([
    tx.objectStore("prompts").add(newPrompt),
    tx.objectStore("prompt_versions").add(newVersion),
  ]);
  await tx.done;

  return newPrompt;
};

export const updatePrompt = async (prompt: Prompt): Promise<Prompt> => {
  const db = await initDB();
  await db.put("prompts", prompt);
  return prompt;
};

export const deletePrompt = async (promptId: string): Promise<void> => {
  const db = await initDB();
  await db.delete("prompts", promptId);
};

// Tag functions
export const getAllTags = async (): Promise<Tag[]> => {
  const db = await initDB();
  return db.getAll("tags");
};

export const createTag = async (tag: Tag): Promise<Tag> => {
  const db = await initDB();
  await db.add("tags", tag);
  return tag;
};
