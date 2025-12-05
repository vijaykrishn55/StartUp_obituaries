import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const FounderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Redirect to the user's profile page
  useEffect(() => {
    if (id) {
      navigate(`/profile/${id}`, { replace: true });
    }
  }, [id, navigate]);

  return <div className="p-6">Redirecting to profile...</div>;
};

export default FounderDetail;
