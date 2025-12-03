import { useState } from "react";
import axiosInstance from "@shared/axiosInstance/axiosInstance";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Button } from "@shared/ui/Button";
import { X } from "lucide-react";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [collaboratorInput, setCollaboratorInput] = useState("");
  const [containers, setContainers] = useState<string[]>([]);
  const [containerInput, setContainerInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const projectId = 'Owner123';
  const ownerId = 'Owner123';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        projectId,
        name,
        description,
        ownerId,
        collaborators,
        containers,
      } as const;

      const url = `/api/v1/projects`;
      // eslint-disable-next-line no-console
      console.debug("Creating project via:", url, payload);
      await axiosInstance.post(url, payload);
      
      setName("");
      setDescription("");
      setCollaborators([]);
      setContainers([]);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <section className="relative z-50 w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
        <SoftPanel>
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <h1 className="text-2xl font-semibold text-neutral-50">Create Project</h1>
              <p className="mt-1 text-sm text-neutral-400">Set up a new project for deployment</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-neutral-400 hover:text-neutral-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                {error}
              </div>
            )}

            <section>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-200 mb-2">
                Project Name *
              </label>
              <input
                id="name"
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-neutral-50 placeholder-neutral-500 transition-colors hover:border-white/20 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                placeholder="My awesome project"
              />
            </section>

            <section>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-200 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-neutral-50 placeholder-neutral-500 transition-colors hover:border-white/20 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                placeholder="A brief description of your project"
                rows={4}
              />
            </section>

            <section>
              <label htmlFor="collaborators" className="block text-sm font-medium text-neutral-200 mb-2">
                Add Collaborator
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  id="collaborators"
                  type="email"
                  value={collaboratorInput}
                  onChange={(e) => setCollaboratorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (collaboratorInput.trim()) {
                        setCollaborators([...collaborators, collaboratorInput]);
                        setCollaboratorInput("");
                      }
                    }
                  }}
                  className="flex-1 rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-neutral-50 placeholder-neutral-500 transition-colors hover:border-white/20 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                  placeholder="collaborator@example.com"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (collaboratorInput.trim()) {
                      setCollaborators([...collaborators, collaboratorInput]);
                      setCollaboratorInput("");
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Add
                </Button>
              </div>
              {collaborators.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {collaborators.map((collab, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg px-3 py-1">
                      <span className="text-sm text-emerald-200">{collab}</span>
                      <button
                        type="button"
                        onClick={() => setCollaborators(collaborators.filter((_, i) => i !== idx))}
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <label htmlFor="containers" className="block text-sm font-medium text-neutral-200 mb-2">
                Add Container
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  id="containers"
                  type="text"
                  value={containerInput}
                  onChange={(e) => setContainerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (containerInput.trim()) {
                        setContainers([...containers, containerInput]);
                        setContainerInput("");
                      }
                    }
                  }}
                  className="flex-1 rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-neutral-50 placeholder-neutral-500 transition-colors hover:border-white/20 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                  placeholder="container-name"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (containerInput.trim()) {
                      setContainers([...containers, containerInput]);
                      setContainerInput("");
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Add
                </Button>
              </div>
              {containers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {containers.map((container, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg px-3 py-1">
                      <span className="text-sm text-emerald-200">{container}</span>
                      <button
                        type="button"
                        onClick={() => setContainers(containers.filter((_, i) => i !== idx))}
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Footer */}
            <section className="flex gap-3 pt-4 border-t border-white/10">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-kleff rounded-full px-6 text-sm font-semibold text-black shadow-md shadow-black/40 hover:brightness-110 disabled:opacity-60 disabled:hover:brightness-100"
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-white/20 bg-white/5 text-neutral-200 hover:border-white/40 hover:bg-white/10"
              >
                Cancel
              </Button>
            </section>
          </form>
        </SoftPanel>
      </section>
    </section>
  );
}
