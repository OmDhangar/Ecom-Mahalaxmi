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
import { toast } from "../ui/use-toast";


function ProductImageUpload({
  imageFile,
  setImageFile,
  uploadedImageUrl,
  setUploadedImageUrl,
  setImageLoadingState,
  imageLoadingState,
  isEditMode,
  imageFiles,
  setImageFiles,
  uploadedImageUrls,
  setUploadedImageUrls,
  imageLoadingStates,
  setImageLoadingStates,
  existingImages = [],
  handleDeleteExistingImage,
}) {
  const inputRef = useRef(null);
  const mainImageInputRef = useRef(null);
  const [maxImagesReached, setMaxImagesReached] = useState(false);
  const [formData ,setFormData] = useState();

  const MAX_IMAGES = 4; // 1 main + 3 additional

  function extractPublicIdFromUrl(url) {
  try {
    // Parse the URL to extract the public_id
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload' and before file extension
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.split('.')[0];
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
}

// Add this function to delete image from Cloudinary
async function deleteImageFromCloudinary(imageUrl) {
  try {
    const publicId = extractPublicIdFromUrl(imageUrl);
    
    if (!publicId) {
      console.error('Could not extract public_id from URL:', imageUrl);
      return false;
    }
    
    const response = await axios.post('http://localhost:5000/api/admin/products/delete-image', {
      public_id: publicId
    });
    
    return response.data.success;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return false;
  }
}

  useEffect(() => {
    const totalImages = (uploadedImageUrls?.length || 0) + (existingImages?.length || 0);
    setMaxImagesReached(totalImages >= MAX_IMAGES - 1); // exclude main image
  }, [uploadedImageUrls, existingImages]);

  // Prefill main image in edit mode
  // useEffect(() => {
  //   if (isEditMode && existingImages.length > 0 && !uploadedImageUrl) {
  //     setUploadedImageUrl(existingImages[0]); // assuming first image is the main one
  //   }
  // }, [isEditMode, existingImages, uploadedImageUrl]);


  async function handleMainImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log("MAin file:",file);
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
        console.log(response.data.result.url);
        setUploadedImageUrl(response.data.result.url);
      }
    } catch (error) {
      console.error("Error uploading main image:", error);
      toast({
        title:"Error Uploading image",
        variant:"destructive"
      })
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
    <div className={`w-full mt-4 ${ "max-w-md mx-auto"}`}>
      
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
          />
          <Label
            htmlFor="main-image-upload"
            className={`
              cursor-pointer
              flex items-center gap-2 bg-gray-100 px-4 py-2 rounded hover:bg-gray-200
            `}
            onClick={() => mainImageInputRef.current?.click()}
          >
            <UploadCloudIcon className="w-4 h-4" />
            {uploadedImageUrl ? "Change Main Image" : "Upload Main Image"}
          </Label>

          {imageLoadingState ? (
            <Skeleton className="w-24 h-24 rounded" />
          ) : uploadedImageUrl ? (
            <div className="relative group border rounded-md overflow-hidden">
              <img src={uploadedImageUrl} alt="Main" className="w-24 h-24 object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  // Delete from Cloudinary first
                  if (uploadedImageUrl) {
                    deleteImageFromCloudinary(uploadedImageUrl);
                  }
                  setUploadedImageUrl("");
                  setImageFile(null);
                  if (mainImageInputRef.current) {
                    mainImageInputRef.current.value = "";
                  }
                }}
              >
                <XIcon className="w-4 h-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* 🟩 Additional Images */}
      <div className="flex justify-between items-center mb-2">
        <Label className="text-lg font-semibold">Additional Images {isEditMode ? "(optional)" : "*"} </Label>
        <Badge variant={maxImagesReached ? "destructive" : "outline"}>
          {(uploadedImageUrls?.length || 0) + (existingImages?.length || 0)}/{MAX_IMAGES - 1}
        </Badge>
      </div>

      {existingImages.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          {existingImages.map((image, index) => (
            <div key={`existing-${index}`} className="relative group border rounded-md overflow-hidden">
              <img src={image} alt={`Image ${index + 1}`} className="w-full h-24 object-cover" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                onClick={() => {
                  // Delete from Cloudinary first
                  deleteImageFromCloudinary(image);
                  handleDeleteExistingImage(index);
                }}
              >
                <Trash2Icon className="w-4 h-4" />
              </Button>
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
                    onClick={() => {
                      // Delete from Cloudinary first
                      deleteImageFromCloudinary(url);
                      handleRemoveImage(index);
                    }}
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
          ${maxImagesReached ? "opacity-50 cursor-not-allowed" : ""}
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
          disabled={maxImagesReached}
        />
        <Label
          className={`
            ${maxImagesReached ? "cursor-not-allowed" : "cursor-pointer"}
            flex flex-col items-center justify-center h-24
          `}
          onClick={() => !maxImagesReached && inputRef.current?.click()}
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
