import { Link } from "react-router-dom";

export function Projects() {
  return (
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
  );
}