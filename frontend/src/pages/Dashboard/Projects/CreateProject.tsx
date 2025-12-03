import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateProjectModal } from "@shared/ui/CreateProjectModal";

export function CreateProject() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate("/dashboard/projects");
  };

  const handleSuccess = () => {
    navigate("/dashboard/projects");
  };

  return (
    <CreateProjectModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onSuccess={handleSuccess}
    />
  );
}
