import { useNavigate } from "react-router-dom";

const useProtectedLink = (setIsLoginOpen, token) => {
  const navigate = useNavigate();

  const openProtectedLink = (path) => {
    if (!token) {
      localStorage.setItem("redirectAfterLogin", path);

      setIsLoginOpen(true);
    } else {
      navigate(path);
    }
  };

  return openProtectedLink;
};

export default useProtectedLink;
