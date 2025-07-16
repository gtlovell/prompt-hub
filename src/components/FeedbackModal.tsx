import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message);
      setMessage("");
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-zinc-800 p-6">
          <Dialog.Title className="text-xl font-bold text-white flex justify-between items-center">
            Send Feedback
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </Dialog.Title>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="mt-4 space-y-4"
          >
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-zinc-300"
              >
                Your message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="mt-1 block w-full rounded-md border-zinc-600 bg-zinc-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Tell us what you think..."
              />
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                Send
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default FeedbackModal;
