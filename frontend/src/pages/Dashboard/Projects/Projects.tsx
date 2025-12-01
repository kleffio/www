import { Sidebar } from "@shared/ui/Sidebar";
import { Link } from "react-router-dom";

export function Projects() {
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <p>List of projects will appear here.</p>
      <div className="mt-4">
        <Link
          to="/dashboard/projects/create"
          className="bg-sky-600 text-white px-3 py-2 rounded"
        >
          Create Project
        </Link>
      </div>
    </div>
    </div>
      </div>
     </div>
       </div>
         </div>
           </div>
  );
}