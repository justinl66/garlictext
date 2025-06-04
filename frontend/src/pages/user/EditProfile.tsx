import { useContext, useState } from "react";
import { AuthContext } from "../../firebase/firebaseAuth";
import { updateProfile } from "firebase/auth";
import { auth, storage } from "../../firebase/firebaseConfig"; // Make sure storage is exported
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";

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

// Convert data URL to Blob
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

// function to crop the selected image and return a data URL
async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((res) => (image.onload = res));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const diameter = Math.min(pixelCrop.width, pixelCrop.height);

  canvas.width = diameter;
  canvas.height = diameter;

  ctx.beginPath();
  ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, 2 * Math.PI);
  ctx.clip();

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    diameter,
    diameter
  );

  return canvas.toDataURL("image/jpeg", 0.8); // Added quality parameter
}

export default function EditProfile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user?.photoURL || "");
  const [bio, setBio] = useState(localStorage.getItem("bio") || "");
  const [badge, setBadge] = useState(localStorage.getItem("badge") || "");

  // for cropping a newly uploaded file
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  
  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      let finalPhotoURL = selectedAvatar;

      // If selectedAvatar is a data URL, upload it to Firebase Storage first
      if (selectedAvatar.startsWith('data:')) {
        console.log("Uploading custom image to Firebase Storage...");
        
        const blob = dataURLtoBlob(selectedAvatar);
        const timestamp = Date.now();
        const fileName = `avatars/${user.uid}_${timestamp}.jpg`;
        const storageRef = ref(storage, fileName);
        
        const snapshot = await uploadBytes(storageRef, blob);
        finalPhotoURL = await getDownloadURL(snapshot.ref);
        
        console.log("Upload successful, URL:", finalPhotoURL);
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser!, {
        displayName,
        photoURL: finalPhotoURL,
      });

      // Save other data to localStorage (consider moving to Firestore)
      localStorage.setItem("bio", bio);
      localStorage.setItem("badge", badge);

      console.log("Profile updated successfully");
      navigate("/profile");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCropConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    setIsUploading(true);
    try {
      const croppedDataUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedDataUrl);
      setSelectedAvatar(croppedDataUrl);
      setIsCropping(false);
      setImageSrc(null);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error("Cropping failed:", error);
      alert("Failed to crop image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#9B5DE5] via-[#00BBF9] to-[#F15BBF5] flex justify-center px-4 py-12">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8 relative overflow-hidden flex flex-col min-h-[80vh]">
        {/* fields & avatar picker */}
        <div className="space-y-6 flex-grow">
          <h1 className="text-3xl font-bold text-[#9B5DE5]">Edit Profile</h1>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
              Profile Badge
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="put anything in your bio here!"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00BBF9] text-gray-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Avatar
            </label>

            {/* first row of 7 default avatars */}
            <div className="flex gap-4 mb-4 justify-center">
              {defaultAvatars.slice(0, 7).map((avatar) => (
                <img
                  key={avatar}
                  src={avatar}
                  alt="avatar"
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setCroppedAreaPixels(null);
                    setImageSrc(null);
                    setIsCropping(false);
                  }}
                  className={`w-16 h-16 rounded-full cursor-pointer border-4 ${
                    selectedAvatar === avatar ? "border-[#00BBF9]" : "border-black"
                  } hover:opacity-80 transition`}
                />
              ))}
            </div>

            {/* second row of remaining default avatars */}
            <div className="flex gap-4 mb-4 justify-center">
              {defaultAvatars.slice(7).map((avatar) => (
                <img
                  key={avatar}
                  src={avatar}
                  alt="avatar"
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setCroppedAreaPixels(null);
                    setImageSrc(null);
                    setIsCropping(false);
                  }}
                  className={`w-16 h-16 rounded-full cursor-pointer border-4 ${
                    selectedAvatar === avatar ? "border-[#00BBF9]" : "border-black"
                  } hover:opacity-80 transition`}
                />
              ))}
            </div>

            {/* upload custom avatar */}
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Custom Avatar
              </label>
              <div className="flex items-center gap-4">
                {croppedImage && (
                  <img
                    src={croppedImage}
                    alt="custom preview"
                    onClick={() => setSelectedAvatar(croppedImage)}
                    className={`w-16 h-16 object-cover rounded-full cursor-pointer border-4 ${
                      selectedAvatar === croppedImage ? "border-[#00BBF9]" : "border-black"
                    } hover:opacity-80 transition`}
                  />
                )}
                <label
                  htmlFor="customPhoto"
                  className="inline-block px-5 py-2 bg-[#00BBF9] text-white font-semibold rounded-md cursor-pointer transition-transform duration-200 hover:scale-105"
                >
                  {isUploading ? "Processing..." : "Upload"}
                </label>
              </div>
              <input
                id="customPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setImageSrc(reader.result as string);
                      setIsCropping(true);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        {/* bottom buttons */}
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

        {/* cropping modal */}
        {isCropping && imageSrc && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-[90vw] max-w-md border-2 border-black">
              <div className="relative h-72 bg-gray-200 border-2 border-black">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, croppedPixels) =>
                    setCroppedAreaPixels(croppedPixels)
                  }
                />
              </div>
              <div className="mt-4 flex justify-between items-center border-2 border-black p-2">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
                <div className="space-x-3">
                  <button
                    onClick={() => {
                      setIsCropping(false);
                      setCroppedAreaPixels(null);
                      setImageSrc(null);
                    }}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropConfirm}
                    disabled={isUploading}
                    className="px-4 py-2 bg-[#00BBF9] text-white rounded hover:bg-[#009BD9] disabled:opacity-50"
                  >
                    {isUploading ? "Processing..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}