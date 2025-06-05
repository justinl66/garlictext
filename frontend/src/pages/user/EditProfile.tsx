import { useContext, useState } from "react";
import { AuthContext } from "../../firebase/firebaseAuth";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";

const defaultAvatars = [
  "/vampire.png",
  "/unicorn.png",
  "/strawberry.jpg",
  "/burger.png",
  "/panda.png",
  "/alien.png",
  "/bomb.png",
  "/pizza.png",
  "/fish.png",
  "/monkey.png",
  "/clown.png",
  "/pineapple.png",
  "/Dinosaur.png",
];

function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export default function EditProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.photoURL || "");
  const [bio, setBio] = useState(localStorage.getItem("bio") || "");
  const [badge, setBadge] = useState(localStorage.getItem("badge") || "");

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      let finalPhotoURL = selectedAvatar;

      if (selectedAvatar.startsWith('data:')) {
        const blob = dataURLtoBlob(selectedAvatar);
        const timestamp = Date.now();
        const fileName = `avatars/${user.uid}_${timestamp}.jpg`;
        const storageRef = ref(storage, fileName);

        const snapshot = await uploadBytes(storageRef, blob);
        finalPhotoURL = await getDownloadURL(snapshot.ref);
      }

      await updateProfile(auth.currentUser!, {
        displayName,
        photoURL: finalPhotoURL,
      });

      localStorage.setItem("bio", bio);
      localStorage.setItem("badge", badge);

      navigate("/profile");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#9B5DE5] via-[#00BBF9] to-[#F15BBF5] flex justify-center px-4 py-12">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8 relative overflow-hidden flex flex-col min-h-[80vh]">
        <div className="space-y-6 flex-grow">
          <h1 className="text-3xl font-bold text-[#9B5DE5]">Edit Profile</h1>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">Profile Badge</label>
            <select
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-800"
            >
              <option value="">None</option>
              <option value="Aspiring Artist">Aspiring Artist</option>
              <option value="Sketchy Scribbler">Sketchy Scribbler</option>
              <option value="Confident Creator">Confident Creator</option>
              <option value="Master Illustrator">Master Illustrator</option>
              <option value="Legendary Drawer">Legendary Drawer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="put anything in your bio here!"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose Avatar</label>

            <div className="flex gap-4 mb-4 justify-center">
              {defaultAvatars.slice(0, 7).map((avatar) => (
                <img
                  key={avatar}
                  src={avatar}
                  alt="avatar"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-16 h-16 rounded-full cursor-pointer border-4 ${
                    selectedAvatar === avatar ? "border-[#00BBF9]" : "border-black"
                  } hover:opacity-80 transition`}
                />
              ))}
            </div>

            <div className="flex gap-4 mb-4 justify-center">
              {defaultAvatars.slice(7).map((avatar) => (
                <img
                  key={avatar}
                  src={avatar}
                  alt="avatar"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`w-16 h-16 rounded-full cursor-pointer border-4 ${
                    selectedAvatar === avatar ? "border-[#00BBF9]" : "border-black"
                  } hover:opacity-80 transition`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 mt-6 border-t border-gray-200">
          <button
            onClick={() => navigate("/profile")}
            className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-gradient-to-br from-[#9B5DE5] via-[#00BBF9] to-[#F15BBF5] text-white font-semibold rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
