import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@shared/axiosInstance/axiosInstance";
import { Sidebar } from "@shared/ui/Sidebar";
import { SoftPanel } from "@shared/ui/SoftPanel";
import { Button } from "@shared/ui/Button";

export function CreateProject() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [dockerComposePath, setDockerComposePath] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const projectId = 'Owner123';
  const ownerId = 'Owner123';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        projectId,
        name,
        description,
        ownerId,
        repositoryUrl,
        branch,
        dockerComposePath,
      } as const;

     
      const url = `/api/v1/projects`;
      // eslint-disable-next-line no-console
      console.debug("Creating project via:", url, payload);
      await axiosInstance.post(url, payload);
      navigate("/dashboard/projects");
    } catch (err) {
      // TODO: handle and show error to user
       
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-kleff-bg relative isolate flex h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="bg-modern-noise bg-kleff-spotlight h-full w-full opacity-60" />
        <div className="bg-kleff-grid absolute inset-0 opacity-[0.25]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-linear-to-b from-white/10 via-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-t from-black via-transparent" />

      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="app-container py-8">
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-neutral-50">Create Project</h1>
                <p className="mt-1 text-sm text-neutral-400">Set up a new project for deployment</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 max-w-2xl">
            <SoftPanel>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
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
                </div>

                <div>
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
                </div>

                <div>
                  <label htmlFor="repositoryUrl" className="block text-sm font-medium text-neutral-200 mb-2">
                    Repository URL
                  </label>
                  <input
                    id="repositoryUrl"
                    name="repositoryUrl"
                    type="url"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-neutral-50 placeholder-neutral-500 transition-colors hover:border-white/20 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                    placeholder="https://github.com/user/repo"
                  />
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-medium text-neutral-200 mb-2">
                    Branch
                  </label>
                  <input
                    id="branch"
                    name="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-neutral-50 placeholder-neutral-500 transition-colors hover:border-white/20 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                    placeholder="main"
                  />
                </div>

                <div>
                  <label htmlFor="dockerComposePath" className="block text-sm font-medium text-neutral-200 mb-2">
                    Docker Compose Path
                  </label>
                  <input
                    id="dockerComposePath"
                    name="dockerComposePath"
                    value={dockerComposePath}
                    onChange={(e) => setDockerComposePath(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-neutral-50 placeholder-neutral-500 transition-colors hover:border-white/20 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400/50"
                    placeholder="docker-compose.yml"
                  />
                </div>

                <div className="flex gap-3 pt-2">
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
                    onClick={() => navigate("/dashboard/projects")}
                    className="border-white/20 bg-white/5 text-neutral-200 hover:border-white/40 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </SoftPanel>
          </div>
        </div>
      </div>
    </div>
  );
}