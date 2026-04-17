import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authThunk";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      toast.success("Logged in successfully!");

      const userRole = result.payload.user.role;
      if (userRole === "admin") navigate("/");
      else navigate("/store_user"); // store_user
    } else {
      const message =
        (result.payload as string) || "Login failed: Invalid credentials";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-md animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Email Address
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 mb-2 font-medium">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[70%] transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => { navigate("/forgate-password") }}>
            Forgot password?
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center bg-blue-600 text-white py-3 rounded-lg font-semibold transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              "Login"
            )}
          </button>

        </form>
        <div className="flex justify-center mt-2 text-red-500">
          <button
            type="button"

            onClick={() => navigate("/register")}
          >
            Create account?
          </button>
        </div>

      </div>
    </div>
  );
}
