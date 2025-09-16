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
import { addProductFormElements as baseFormElements, filterOptions } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const MAX_IMAGES = 5; // 🚀 Set your max limit

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
  batteryHealth: "",
  condition: "",
  sizes: [], // Will be array of objects like [{size: "S", stock: 10}] for fashion products
  weight: "",
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

function onSubmit(event) {
  event.preventDefault();

  const missingFields = [];

  // Check images only when adding new product
  if (currentEditedId === null) {
    if (!uploadedImageUrl) missingFields.push("Main Image");
    // Additional images are now optional - no validation required
  }

  // Base required fields for all products
  let baseRequiredFields = [
    "title",
    "description",
    "category",
    "brand",
    "price",
    "salePrice",
    "weight",
    "length",
    "breadth",
    "height",
  ];
  
  // Add totalStock requirement only for non-fashion products
  if (formData.category !== 'fashion') {
    baseRequiredFields.push("totalStock");
  }

  // Category-based required fields config
  const categoryRequiredFieldsMap = {
    electronics: ["batteryHealth", "condition"],
    fashion: ["sizes"],
    // add more categories as needed
    // e.g. "books": ["author", "isbn"],
  };

  // Get current category
  const category = formData.category;

  // Gather required fields: base + category-specific (if any)
  const requiredFields = [
    ...baseRequiredFields,
    ...(categoryRequiredFieldsMap[category] || []),
  ];

  // Validate all required fields
  requiredFields.forEach((field) => {
    const value = formData[field];
    if (
      value === "" ||
      value === null ||
      (Array.isArray(value) && value.length === 0)
    ) {
      missingFields.push(field);
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

  // Prepare form data numbers etc.
  const mergedAdditionalImages = [
    ...(formData.additionalImages || []),
    ...(uploadedImageUrls || []),
  ]
    .filter((item, index, self) => self.indexOf(item) === index) // remove duplicates
    .slice(0, MAX_IMAGES);

  // Calculate totalStock for fashion products based on sizes
  let calculatedTotalStock = Number(formData.totalStock);
  if (formData.category === 'fashion' && Array.isArray(formData.sizes) && formData.sizes.length > 0) {
    calculatedTotalStock = formData.sizes.reduce((total, sizeObj) => total + (sizeObj.stock || 0), 0);
  }

  const preparedFormData = {
    ...formData,
    image:
      uploadedImageUrl && uploadedImageUrl.trim() !== ""
        ? uploadedImageUrl
        : formData.image,
    additionalImages: mergedAdditionalImages,
    price: Number(formData.price),
    salePrice: Number(formData.salePrice),
    totalStock: calculatedTotalStock,
    weight: Number(formData.weight),
    length: Number(formData.length),
    breadth: Number(formData.breadth),
    height: Number(formData.height),
  };

  if (currentEditedId !== null) {
    dispatch(editProduct({ id: currentEditedId, formData: preparedFormData })).then(
      (data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          resetFormState();
        }
      }
    );
  } else {
    dispatch(addNewProduct(preparedFormData)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        resetFormState();
        toast({ title: "Product added successfully" });
      }
    });
  }
}


  const getDynamicFormControls = () => {
    return baseFormElements
      .map((field) => {
        if (field.name === "category") {
          return {
            ...field,
            options: filterOptions.category,
          };
        }
        if (field.name === "brand") {
          const selectedCategory = formData.category;
          const brandOptions =
            selectedCategory && filterOptions.brand[selectedCategory]
              ? filterOptions.brand[selectedCategory]
              : [];
          return {
            ...field,
            options: brandOptions,
          };
        }
        return field;
      })
      .filter((field) => !field.showWhen || field.showWhen(formData));
  };

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

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
            uploadedImageUrl={currentEditedId ? formData.image : uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
            imageFiles={imageFiles}
            setImageFiles={setImageFiles}
            uploadedImageUrls={uploadedImageUrls} // always from state
            setUploadedImageUrls={(urls) => {
              // 🚀 enforce max limit at selection time
              if (urls.length > MAX_IMAGES) {
                toast({
                  title: `You can upload a maximum of ${MAX_IMAGES} images.`,
                  variant: "destructive",
                });
                setUploadedImageUrls(urls.slice(0, MAX_IMAGES));
              } else {
                setUploadedImageUrls(urls);
              }
            }}
            imageLoadingStates={imageLoadingStates}
            setImageLoadingStates={setImageLoadingStates}
            existingImages={currentEditedId ? formData.additionalImages || [] : []}
            handleDeleteExistingImage={(index) => {
              setFormData((prev) => ({
                ...prev,
                additionalImages: prev.additionalImages.filter((_, i) => i !== index),
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
