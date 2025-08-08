import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements as baseFormElements ,filterOptions } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  additionalImages: [],
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
  batteryHealth:"",
  condition:"",
  sizes:[],
  weight: "",      // 🚀 Required for Shiprocket
  length: "",
  breadth: "",
  height: "",
};


function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState([]);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const { productList } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function resetFormState() {
  setOpenCreateProductsDialog(false);
  setImageFile(null);
  setImageFiles([]);
  setUploadedImageUrl("");
  setUploadedImageUrls([]);
  setImageLoadingState(false);
  setImageLoadingStates([]);
  setFormData(initialFormData);
  setCurrentEditedId(null);
}
  useEffect(() => {
    if (uploadedImageUrl) {
      setFormData((prev) => ({ ...prev, image: uploadedImageUrl }));
    }
  }, [uploadedImageUrl]);




  console.log("image file",uploadedImageUrl);
  console.log("additional image file",uploadedImageUrls);

  function onSubmit(event) {
  event.preventDefault();

  const missingFields = [];

  // Check image
  if (!uploadedImageUrl) {
    missingFields.push("Main Image");
  }

  if (uploadedImageUrls.length === 0) {
    missingFields.push("Additional Images");
  }

  // Check form fields
  Object.entries(formData).forEach(([key, value]) => {
    if (
      key !== "averageReview" &&
      key !== "additionalImages" &&
      key !== "featuredDescription" &&

      value === ""
    ) {
      missingFields.push(key);
    }
  });

  if (missingFields.length > 0) {
    toast({
      title: "Please complete all required fields",
      description: `Missing: ${missingFields.join(", ")}`,
      variant: "destructive",
    });
    return;
  }

  // Prepare final form data
 const preparedFormData = {
    ...formData,
    image: uploadedImageUrl,
    additionalImages: uploadedImageUrls,
    // Convert numeric fields
    price: Number(formData.price),
    salePrice: Number(formData.salePrice),
    totalStock: Number(formData.totalStock),
    weight: Number(formData.weight),
    length: Number(formData.length),
    breadth: Number(formData.breadth),
    height: Number(formData.height),
  };

  if (currentEditedId !== null) {
    dispatch(editProduct({ id: currentEditedId, formData: preparedFormData }))
      .then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          resetFormState();
        }
      });
  } else {
    console.log(preparedFormData);
    dispatch(addNewProduct(preparedFormData))
    .then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        resetFormState();
        toast({ title: "Product added successfully" });
      }
    });
  }
}


const getDynamicFormControls = () => {
  return baseFormElements.map((field) => {
    if (field.name === "category") {
      return {
        ...field,
        options: filterOptions.category,
      };
    }

    if (field.name === "brand") {
      const selectedCategory = formData.category;
      const brandOptions = selectedCategory && filterOptions.brand[selectedCategory]
        ? filterOptions.brand[selectedCategory]
        : [];

      return {
        ...field,
        options: brandOptions,
      };
    }

    return field;
  }).filter((field)=> !field.showWhen || field.showWhen(formData))
};

//  // Add category-specific form elements
//   const visibleFields = addProductFormElements.filter(field => 
//     !field.showWhen || field.showWhen(formData)
//   );


  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  function isFormValid() {
    if (!uploadedImageUrl) {
      return false;
    }
    if (uploadedImageUrls.length === 0) {
      return false;
    }

    return Object.keys(formData)
      .filter((currentKey) => currentKey !== "averageReview" && currentKey !== "additionalImages")
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  console.log(formData, "productList");

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Product
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent side="right" className="overflow-auto">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={ currentEditedId ? formData.image :uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
            // Additional props for multiple images
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={currentEditedId ? formData.additionalImages:uploadedImageUrls}
            setUploadedImageUrls={setUploadedImageUrls}
            imageLoadingStates={imageLoadingStates}
            setImageLoadingStates={setImageLoadingStates}
            existingImages={formData.additionalImages || []}
            handleDeleteExistingImage={(index) => {
              setFormData(prev => ({
                ...prev,
                additionalImages: prev.additionalImages.filter((_, i) => i !== index)
              }));
            }}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={getDynamicFormControls()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
