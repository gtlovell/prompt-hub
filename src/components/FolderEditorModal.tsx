import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import type { Folder } from "../types";

interface FolderEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folder: Folder) => void;
  onDelete: (folderId: string) => void;
  folder: Folder | null;
}

const FolderEditorModal: React.FC<FolderEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  folder,
}) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (folder) {
      setName(folder.name);
    } else {
      setName("");
    }
  }, [folder, isOpen]);

  const handleSave = () => {
    if (folder) {
      onSave({ ...folder, name });
    }
  };

  const handleDelete = () => {
    if (folder) {
      onDelete(folder.id);
    }
  };

  if (!folder) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-zinc-800 p-6">
          <Dialog.Title className="text-xl font-bold text-white">
            Edit Folder
          </Dialog.Title>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="mt-4 space-y-4"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-300"
              >
                Folder Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-zinc-600 bg-zinc-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
              >
                Delete
              </button>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default FolderEditorModal;
