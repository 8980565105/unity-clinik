import React, { useEffect, useRef, useState } from "react";
import Section from "../ui/Section";
import Row from "../ui/Row";
import { useDispatch, useSelector } from "react-redux";
import defaultimg from "../../assets/default-avatar.png";
import { Pencil } from "lucide-react";
import { uploadProfilePicture } from "../../features/user/userThunk";
import toast from "react-hot-toast";

export default function UserProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.user);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(user?.profile_picture || defaultimg);

  useEffect(() => {
    setPreview(user?.profile_picture || defaultimg);
  }, [user?.profile_picture]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    const result = await dispatch(uploadProfilePicture(file));

    if (uploadProfilePicture.fulfilled.match(result)) {
      const newUrl = result.payload?.profile_picture;
      if (newUrl) setPreview(newUrl);
      toast.success("Profile picture updated!", { position: "top-center" });
    } else {
      setPreview(user?.profile_picture || defaultimg);
      toast.error(result.payload || "Upload failed", {
        position: "top-center",
      });
    }

    URL.revokeObjectURL(localUrl);
    e.target.value = "";
  };

  return (
    <Section className="bg-theme !pt-[75px]">
      <Row className="flex flex-col md:flex-row justify-between items-center md:items-start gap-y-[30px] md:gap-x-[30px] !max-w-[1122px] pb-[57px]">
        <div className="text-center md:text-left flex-1">
          <h1 className="text-[40px] font-medium text-dark mb-[24px] leading">
            My Account
          </h1>
          <p className="text-[20px] text-dark mb-[20px] leading">
            Hello {user?.name || "User"} !
          </p>
          <p className="text-light text-p">
            Aspernatur magni in repellat repellendus itaque consequuntur alias
            necessitatibus.
          </p>
        </div>

        <div className="relative w-[150px] h-[150px] mx-auto mb-4">
          <img
            src={preview}
            alt="Profile"
            className={`w-full h-full rounded-full border-4 circle-border object-cover transition-opacity duration-300 ${
              loading ? "opacity-50" : "opacity-100"
            }`}
            onError={(e) => {
              e.target.src = defaultimg;
            }}
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div
            className={`absolute bottom-1 right-1 box-shadow bg-color text-white p-2 rounded-full cursor-pointer ${
              loading ? "pointer-events-none opacity-60" : ""
            }`}
            onClick={() => !loading && fileInputRef.current.click()}
          >
            <Pencil size={16} />
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </Row>
    </Section>
  );
}
