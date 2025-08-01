export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
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
  },
];

export const shoppingViewHeaderMenuItems = [
  { id: "home", label: "Home", path: "/shop/home" },
  { id: "products", label: "Products", path: "/shop/listing" },
  { id: "electronics", label: "Electronics", path: "/shop/listing?category=electronics" },
  { id: "fashion", label: "Fashion", path: "/shop/listing?category=fashion" },
  { id: "toys", label: "Toys", path: "/shop/listing?category=toys" },
  { id: "farming", label: "Farming", path: "/shop/listing?category=farming" },
  { id: "search", label: "Search", path: "/shop/search" },
];

export const categoryOptionsMap = {
  electronics: "Electronics",
  fashion: "Fashion",
  toys: "Toys",
  farming :"Farming"
};

export const brandOptionsMap = {
  // Fashion
  nike: "Nike",
  adidas: "Adidas",
  puma: "Puma",
  levi: "Levi's",
  zara: "Zara",
  "h&m": "H&M",
  // Electronics
  samsung: "Samsung",
  sony: "Sony",
  apple: "Apple",
  lg: "LG",
  panasonic: "Panasonic",
  // Toys
  lego: "LEGO",
  nerf: "NERF",
  hasbro: "Hasbro",
  barbie: "Barbie",
  hotwheels: "Hot Wheels",
  //Farming
   kraftseeds: "KraftSeeds",          
  crompton: "Crompton",              
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
      { id: "puma", label: "Puma" },
      { id: "levi", label: "Levi's" },
      { id: "zara", label: "Zara" },
      { id: "h&m", label: "H&M" },
    ],
    electronics: [
      { id: "samsung", label: "Samsung" },
      { id: "sony", label: "Sony" },
      { id: "apple", label: "Apple" },
      { id: "lg", label: "LG" },
      { id: "panasonic", label: "Panasonic" },
    ],
    toys: [
      { id: "lego", label: "LEGO" },
      { id: "nerf", label: "NERF" },
      { id: "hasbro", label: "Hasbro" },
      { id: "barbie", label: "Barbie" },
      { id: "hotwheels", label: "Hot Wheels" },
    ],
     farming: [
      { id: "kraftseeds", label: "KraftSeeds" },     // ✅ Added
      { id: "crompton", label: "Crompton" },         // ✅ Added
      { id: "kisankraft", label: "KisanKraft" },     // ✅ Added
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
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];
