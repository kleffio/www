import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@shared/api/client";
import { Sidebar } from "@shared/ui/Sidebar";

export function CreateProject() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [dockerComposePath, setDockerComposePath] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name,
        description,
        repositoryUrl,
        branch,
        dockerComposePath,
      } as const;

      await apiClient.post("/api/v1/projects", payload);
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
      
      <h2 className="text-xl font-semibold mb-4">Create Project</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded p-2"
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded p-2"
          rows={4}
        />

        <label htmlFor="repositoryUrl">Repository URL</label>
        <input
          id="repositoryUrl"
          name="repositoryUrl"
          type="url"
          value={repositoryUrl}
          onChange={(e) => setRepositoryUrl(e.target.value)}
          className="border rounded p-2"
        />

        <label htmlFor="branch">Branch</label>
        <input
          id="branch"
          name="branch"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          className="border rounded p-2"
        />

        <label htmlFor="dockerComposePath">Docker Compose Path</label>
        <input
          id="dockerComposePath"
          name="dockerComposePath"
          value={dockerComposePath}
          onChange={(e) => setDockerComposePath(e.target.value)}
          className="border rounded p-2"
        />

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-sky-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
     </div>
       </div>
         </div>
           </div>
             </div>
  );
}