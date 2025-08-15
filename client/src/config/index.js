export const registerFormControls = [
  {
    name: "userName",
    label: "Username",
    type: "text",
    placeholder: "Enter your username",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter your email",
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
  },
];

export const loginFormControls = [
    {
    name: "emailOrPhone",
    label: "Email or Phone",
    type: "text",
    placeholder: "Enter your email or phone number"
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];
export const mobileConditionOptions = [
  { id: "new", label: "New" },
  { id: "refurbished", label: "Refurbished" },
  { id: "Second-hand", label: "Second-hand" },
];

// Add clothing size options
export const clothingSizeOptions = [
  { id: "XS", label: "XS" },
  { id: "S", label: "S" },
  { id: "M", label: "M" },
  { id: "L", label: "L" },
  { id: "XL", label: "XL" },
  { id: "XXL", label: "XXL" },
  { id: "3XL", label: "3XL" },
  { id: "4XL", label: "4XL" },
  { id: "5XL", label: "5XL" },
];


export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "electronics", label: "Electronics" },
      { id: "fashion", label: "Fashion" },
      { id: "toys", label: "Toys" },
      { id: "farming", label: "Farming" },
    ],
  },
  //Dynamic fields based on category
  {
    label:"Battery Health",
    name: "batteryHealth",
    componentType: "input",
    type:"text",
    placeholder: "Enter Battery health percentage",
    showWhen: (formData)=> formData.category == "electronics"
  },
  {
    label: "Condition",
    name: "condition",
    componentType: "select",
    options: [
      { id: "new", label: "New" },
      { id: "refurbished", label: "Refurbished" },
      { id: "second-hand", label: "Second-hand" }
    ],
    showWhen: (formData) => formData.category === "electronics"
  },
  {
    label: "Sizes",
    name: "sizes",
    componentType: "fashionsizes",
    options: clothingSizeOptions,
    showWhen: (formData) => formData.category === "fashion"
  },

  {
    label: "Brand",
    name: "brand",
    componentType: "select",
    options: [],
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
  {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter sale price (optional)",
  },
  {
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
    showWhen: (formData) => formData.category !== "fashion"
  },
  {
    name: "weight",
    label: "Weight (kg)",
    type: "number",
    placeholder: "e.g., 0.5",
    min: 0.01,
  },
  {
    name: "length",
    label: "Length (cm)",
    type: "number",
    placeholder: "e.g., 10",
    min: 1,
  },
  {
    name: "breadth",
    label: "Breadth (cm)",
    type: "number",
    placeholder: "e.g., 10",
    min: 1,
  },
  {
    name: "height",
    label: "Height (cm)",
    type: "number",
    placeholder: "e.g., 5",
    min: 1,
  },


];

export const shoppingViewHeaderMenuItems = [
  { id: "home", label: "Home", path: "/shop/home" },
  { id: "products", label: "Products", path: "/shop/listing" },
  { id: "electronics", label: "Electronics", path: "/shop/listing?category=electronics" },
  { id: "fashion", label: "Fashion", path: "/shop/listing?category=fashion" },
  { id: "toys", label: "Toys", path: "/shop/listing?category=toys" },
  { id: "farming", label: "Farming", path: "/shop/listing?category=farming" },
];

export const categoryOptionsMap = {
  electronics: "Electronics",
  fashion: "Fashion",
  toys: "Toys",
  farming :"Farming"
};

export const brandOptionsMap = {
  // Fashion
  KittuFashion:"Kittu Fashion",
  // Electronics
  samsung: "Samsung",
  sony: "Sony",
  apple: "Apple",
  lg: "LG",
  panasonic: "Panasonic",
  iqoo:"IQOO",
  xiaomi: "Xiaomi",
  oneplus: "OnePlus",
  nokia: "Nokia",
  motorola: "Motorola",
  google: "Google",
  // Toys
  lego: "LEGO",
  Mahalaxmi:"Shri Mahalaxmi",
  nerf: "NERF",
  hotwheels: "Hot Wheels",
  //Farming
  kraftseeds: "KraftSeeds",          
  crompton: "Crompton", 
  Mahalaxmi:"Shri Mahalaxmi",             
  kisankraft: "KisanKraft",          
  mahindraagri: "Mahindra Agri",
};

export const filterOptions = {
  category: [
    { id: "electronics", label: "Electronics" },
    { id: "fashion", label: "Fashion" },
    { id: "toys", label: "Toys" },
    { id: "farming", label: "Farming" },
  ],
  brand: {
    fashion: [
      { id: "nike", label: "Nike" },
      { id: "adidas", label: "Adidas" },
      {id:"KittuFashion",label:"Kittu Fashion"},
      { id: "puma", label: "Puma" },
    ],
    electronics: [
      { id: "samsung", label: "Samsung" },
      { id: "sony", label: "Sony" },
      { id: "apple", label: "Apple" },
      { id: "lg", label: "LG" },
      {id:"iqoo",label:"IQOO"},
      { id: "panasonic", label: "Panasonic" },
      { id: "xiaomi", label: "Xiaomi" },
      { id: "oneplus", label: "OnePlus" },
      { id: "nokia", label: "Nokia" },
      { id: "motorola", label: "Motorola" },
      { id: "google", label: "Google" },
    ],
    toys: [
      { id: "lego", label: "LEGO" },
      { id: "nerf", label: "NERF" },
      {id:"Mahalaxmi", label:"Shree Mahalaxmi"},
      { id: "hasbro", label: "Hasbro" },
      { id: "barbie", label: "Barbie" },
      { id: "hotwheels", label: "Hot Wheels" },
    ],
     farming: [
      { id: "kraftseeds", label: "KraftSeeds" },     // ✅ Added
      { id: "crompton", label: "Crompton" },         // ✅ Added
      { id: "kisankraft", label: "KisanKraft" }, 
      {id:"Mahalaxmi", label:"Shree Mahalaxmi"},    // ✅ Added
      { id: "mahindraagri", label: "Mahindra Agri" } // ✅ Added
    ],
  },
};



export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [
  {
    label: "Full Name",
    name: "name",
    componentType: "input",
    type: "text",
    placeholder: "Enter your full name",
  },
  {
    label: "Email",
    name: "email",
    componentType: "input",
    type: "email",
    placeholder: "Enter your email address",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "State",
    name: "state",
    componentType: "input",
    type: "text",
    placeholder: "Enter your state",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Landmark / Notes",
    name: "notes", // ✅ Corrected to match formData
    componentType: "textarea",
    placeholder: "Enter any additional notes or landmark",
  },
];
