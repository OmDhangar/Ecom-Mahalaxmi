import {
  UploadCloudIcon,
  XIcon,
  Trash2Icon
} from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

function ProductImageUpload({
  imageFile,
  setImageFile,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  imageLoadingState,
  imageFiles,
  setImageFiles,
  imageLoadingStates,
  uploadedImageUrls,
  setUploadedImageUrls,
  setImageLoadingStates,
  isEditMode,
  isCustomStyling = false,
  existingImages = [],
  handleDeleteExistingImage,
}) {
  const inputRef = useRef(null);
  const mainImageInputRef = useRef(null);
  const [maxImagesReached, setMaxImagesReached] = useState(false);

  const MAX_IMAGES = 4; // 1 main + 3 additional

  useEffect(() => {
    const totalImages = (uploadedImageUrls?.length || 0) + (existingImages?.length || 0);
    setMaxImagesReached(totalImages >= MAX_IMAGES - 1); // exclude main image
  }, [uploadedImageUrls, existingImages]);

  async function handleMainImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImageLoadingState(true);

    const data = new FormData();
    data.append("my_file", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        data
      );

      if (response?.data?.success) {
        setUploadedImageUrl(response.data.result.url);
      }
    } catch (error) {
      console.error("Error uploading main image:", error);
    } finally {
      setImageLoadingState(false);
    }
  }

  function handleImageFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    const remainingSlots = (MAX_IMAGES - 1) - ((uploadedImageUrls?.length || 0) + (existingImages?.length || 0));
    const filesToUpload = selectedFiles.slice(0, remainingSlots);

    if (filesToUpload.length > 0) {
      setImageFiles(prev => [...(prev || []), ...filesToUpload]);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    const remainingSlots = (MAX_IMAGES - 1) - ((uploadedImageUrls?.length || 0) + (existingImages?.length || 0));
    const filesToUpload = droppedFiles.slice(0, remainingSlots);

    if (filesToUpload.length > 0) {
      setImageFiles(prev => [...(prev || []), ...filesToUpload]);
    }
  }

  function handleRemoveImage(index) {
    const newImageFiles = [...(imageFiles || [])];
    const newUploadedUrls = [...(uploadedImageUrls || [])];
    const newLoadingStates = [...(imageLoadingStates || [])];

    newImageFiles.splice(index, 1);
    newUploadedUrls.splice(index, 1);
    newLoadingStates.splice(index, 1);

    setImageFiles(newImageFiles);
    setUploadedImageUrls(newUploadedUrls);
    setImageLoadingStates(newLoadingStates);
  }

  async function uploadImageToCloudinary(file, index) {
    const newLoadingStates = [...(imageLoadingStates || [])];
    newLoadingStates[index] = true;
    setImageLoadingStates(newLoadingStates);

    const data = new FormData();
    data.append("my_file", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        data
      );

      if (response?.data?.success) {
        const newUrls = [...(uploadedImageUrls || [])];
        newUrls[index] = response.data.result.url;
        setUploadedImageUrls(newUrls);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      const updatedLoadingStates = [...(imageLoadingStates || [])];
      updatedLoadingStates[index] = false;
      setImageLoadingStates(updatedLoadingStates);
    }
  }

  useEffect(() => {
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file, index) => {
        if (!uploadedImageUrls || !uploadedImageUrls[index]) {
          uploadImageToCloudinary(file, index);
        }
      });
    }
  }, [imageFiles]);

  return (
    <div className={`w-full mt-4 ${isCustomStyling ? "" : "max-w-md mx-auto"}`}>
      
      {/* 🟦 Main Product Image */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <Label className="text-lg font-semibold text-primary">Main Product Image *</Label>
          {uploadedImageUrl && <Badge variant="outline">Uploaded</Badge>}
        </div>
        <div className="text-sm text-gray-500 mb-2">Primary image displayed for this product</div>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            ref={mainImageInputRef}
            onChange={handleMainImageUpload}
            disabled={isEditMode}
          />
          <Label
            htmlFor="main-image-upload"
            className={`
              ${isEditMode ? "cursor-not-allowed" : "cursor-pointer"}
              flex items-center gap-2 bg-gray-100 px-4 py-2 rounded hover:bg-gray-200
            `}
            onClick={() => !isEditMode && mainImageInputRef.current?.click()}
          >
            <UploadCloudIcon className="w-4 h-4" />
            {uploadedImageUrl ? "Change Main Image" : "Upload Main Image"}
          </Label>

          {imageLoadingState ? (
            <Skeleton className="w-24 h-24 rounded" />
          ) : uploadedImageUrl ? (
            <div className="relative group border rounded-md overflow-hidden">
              <img src={uploadedImageUrl} alt="Main" className="w-24 h-24 object-cover" />
              {!isEditMode && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setUploadedImageUrl("");
                    setImageFile(null);
                    if (mainImageInputRef.current) {
                      mainImageInputRef.current.value = "";
                    }
                  }}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* 🟩 Additional Images */}
      <div className="flex justify-between items-center mb-2">
        <Label className="text-lg font-semibold">Additional Images</Label>
        <Badge variant={maxImagesReached ? "destructive" : "outline"}>
          {(uploadedImageUrls?.length || 0) + (existingImages?.length || 0)}/{MAX_IMAGES - 1}
        </Badge>
      </div>

      {existingImages.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {existingImages.map((image, index) => (
            <div key={`existing-${index}`} className="relative group border rounded-md overflow-hidden">
              <img src={image} alt={`Image ${index + 1}`} className="w-full h-24 object-cover" />
              {!isEditMode && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDeleteExistingImage(index)}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {uploadedImageUrls.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {uploadedImageUrls.map((url, index) => (
            <div key={`new-${index}`} className="relative group border rounded-md overflow-hidden">
              {imageLoadingStates[index] ? (
                <Skeleton className="w-full h-24" />
              ) : (
                <>
                  <img src={url} alt={`Uploaded ${index}`} className="w-full h-24 object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <XIcon className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload More */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          ${isEditMode || maxImagesReached ? "opacity-50 cursor-not-allowed" : ""}
          border-2 border-dashed rounded-lg p-4
        `}
      >
        <Input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode || maxImagesReached}
        />
        <Label
          className={`
            ${isEditMode || maxImagesReached ? "cursor-not-allowed" : "cursor-pointer"}
            flex flex-col items-center justify-center h-24
          `}
          onClick={() => !isEditMode && !maxImagesReached && inputRef.current?.click()}
        >
          <UploadCloudIcon className="w-8 h-8 text-muted-foreground mb-2" />
          <span className="text-center text-sm">
            Drag & drop or click to upload<br />
            <span className="text-xs text-muted-foreground">
              (Max: {MAX_IMAGES - 1} additional images)
            </span>
          </span>
        </Label>
      </div>
    </div>
  );
}

export default ProductImageUpload;
