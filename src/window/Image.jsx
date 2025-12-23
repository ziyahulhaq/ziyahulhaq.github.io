import WindowControls from "#components/WindowControls";
import WindowWrapper from "#hoc/windowWrapper";
import useWindowStore from "#store/window";
import { Plus, Share, SquarePen } from "lucide-react";


const ImageWindowContent = () => {
  const { windows } = useWindowStore();
  const data = windows.imgfile?.data;

  if (!data) return null;

  const { name, imageUrl } = data;

  return (
    <>
      <div id="window-header">
        <WindowControls target="imgfile" />
        <div className="w-full flex justify-end items-center gap-3 text-gray-500">
          <SquarePen className="icon" />
          <Plus className="icon" />
          <Share className="icon" />
        </div>
      </div>

      <div className="p-5 bg-white">
        {imageUrl ? (
          <div className="w-full">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-auto max-h-[70vh] object-contain rounded"
            />
          </div>
        ) : null}
      </div>
    </>
  );
};

const ImageWindow = WindowWrapper(ImageWindowContent, "imgfile");

export default ImageWindow;