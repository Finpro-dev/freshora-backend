import { Prisma } from "../generated/prisma/client";
import { prisma } from "../src/configs/prisma.config";

const categories: Prisma.ProductCategoryCreateManyInput[] = [
  { category: "Fresh Produce" },
  { category: "Organic Foods" },
  { category: "Dairy & Eggs" },
  { category: "Meat & Poultry" },
  { category: "Seafood" },
  { category: "Frozen Foods" },
  { category: "Bakery" },
  { category: "Snacks" },
  { category: "Beverages" },
  { category: "Instant Foods" },
  { category: "Breakfast Items" },
  { category: "Healthy Foods" },
];

const products: Prisma.ProductCreateManyInput[] = [
  {
    serialNumber: "FS-FRU-001",
    name: "Fresh Lime",
    slug: "fresh-lime",
    productCategoryId: "a75b5566-b0bf-42a5-b783-b8244e3178aa", // Fruits
    price: new Prisma.Decimal(15000.0),
    description:
      "Fresh and juicy limes, perfect for beverages or cooking seasoning.",
    weightPerGram: new Prisma.Decimal(500.0),
    unit: "KG",
    storageInstructions: "Store in the refrigerator to keep them fresh longer.",
    grade: "A",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-FRU-002",
    name: "Sweet California Papaya",
    slug: "sweet-california-papaya",
    productCategoryId: "a75b5566-b0bf-42a5-b783-b8244e3178aa", // Fruits
    price: new Prisma.Decimal(25000.0),
    description:
      "Sweet and perfectly ripe California papaya, rich in vitamins.",
    weightPerGram: new Prisma.Decimal(1000.0),
    unit: "PCS",
    storageInstructions:
      "Keep at room temperature until fully ripe, then refrigerate.",
    grade: "A",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-DAI-001",
    name: "Premium Chicken Eggs",
    slug: "premium-chicken-eggs",
    productCategoryId: "cfa60c5c-2731-4e2a-a839-bcc12a5fb704", // Dairy & Eggs
    price: new Prisma.Decimal(32000.0),
    description:
      "Fresh high-quality chicken eggs, high in protein and nutrition.",
    weightPerGram: new Prisma.Decimal(600.0),
    unit: "PACK",
    storageInstructions: "Store in the refrigerator egg tray.",
    grade: "A",
    dietType: "VEGETARIAN",
  },
  {
    serialNumber: "FS-VEG-001",
    name: "Fresh Organic Spinach",
    slug: "fresh-organic-spinach",
    productCategoryId: "47586e56-5460-41d3-86f0-3a0b126fabc0", // Fresh Produce
    price: new Prisma.Decimal(8000.0),
    description:
      "Crispy and fresh organic spinach leaves, free from pesticides.",
    weightPerGram: new Prisma.Decimal(250.0),
    unit: "PACK",
    storageInstructions:
      "Wrap in a paper towel and store in the refrigerator vegetable crisper.",
    grade: "A",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-SEA-001",
    name: "Fresh Salmon Fillet 500g",
    slug: "fresh-salmon-fillet-500g",
    productCategoryId: "70e3e7a2-193f-4cb7-8eab-4a2337a65ee6", // Seafood
    price: new Prisma.Decimal(185000.0),
    description: "Premium sashimi-grade fresh salmon fillet, rich in Omega-3.",
    weightPerGram: new Prisma.Decimal(500.0),
    unit: "PACK",
    storageInstructions:
      "Keep frozen at -18°C or lower if not consumed immediately.",
    grade: "A",
    dietType: "HALAL",
  },
  {
    serialNumber: "FS-HRB-001",
    name: "Fresh Garlic",
    slug: "fresh-garlic",
    productCategoryId: "3a743fe3-31d3-4d56-b073-e92b33053354", // Herbs
    price: new Prisma.Decimal(20000.0),
    description:
      "High-quality aromatic garlic bulbs, essential for everyday cooking.",
    weightPerGram: new Prisma.Decimal(500.0),
    unit: "G",
    storageInstructions: "Store in a cool, dry, and well-ventilated place.",
    grade: "B",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-HRB-002",
    name: "Premium Dried Chilli",
    slug: "premium-dried-chilli",
    productCategoryId: "3a743fe3-31d3-4d56-b073-e92b33053354", // Herbs
    price: new Prisma.Decimal(15000.0),
    description:
      "Spicy dried red chillies, perfect for making chili oil or sambal.",
    weightPerGram: new Prisma.Decimal(100.0),
    unit: "PACK",
    storageInstructions: "Store in an airtight container in a dry place.",
    grade: "A",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-VEG-002",
    name: "Large Red Chilli",
    slug: "large-red-chilli",
    productCategoryId: "47586e56-5460-41d3-86f0-3a0b126fabc0", // Fresh Produce
    price: new Prisma.Decimal(18000.0),
    description:
      "Fresh large red chillies, moderately spicy and vibrant in color.",
    weightPerGram: new Prisma.Decimal(250.0),
    unit: "G",
    storageInstructions:
      "Store unwashed in a plastic bag inside the refrigerator.",
    grade: "A",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-FRU-003",
    name: "Sweet Sunkist Orange",
    slug: "sweet-sunkist-orange",
    productCategoryId: "a75b5566-b0bf-42a5-b783-b8244e3178aa", // Fruits
    price: new Prisma.Decimal(35000.0),
    description: "Juicy and sweet Sunkist oranges, packed with Vitamin C.",
    weightPerGram: new Prisma.Decimal(1000.0),
    unit: "KG",
    storageInstructions:
      "Can be kept at room temperature or refrigerated for a cooler taste.",
    grade: "A",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-VEG-003",
    name: "Fresh Beef Tomato",
    slug: "fresh-beef-tomato",
    productCategoryId: "47586e56-5460-41d3-86f0-3a0b126fabc0", // Fresh Produce
    price: new Prisma.Decimal(12000.0),
    description:
      "Large, meaty, and juicy tomatoes, ideal for salads or burgers.",
    weightPerGram: new Prisma.Decimal(500.0),
    unit: "KG",
    storageInstructions: "Store at room temperature away from direct sunlight.",
    grade: "A",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-FRU-004",
    name: "Fresh Blueberry Premium",
    slug: "fresh-blueberry-premium",
    productCategoryId: "a75b5566-b0bf-42a5-b783-b8244e3178aa", // Fruits
    price: new Prisma.Decimal(45000.0),
    description: "Sweet and tangy premium blueberries, rich in antioxidants.",
    weightPerGram: new Prisma.Decimal(125.0),
    unit: "PACK",
    storageInstructions: "Keep refrigerated and wash right before consuming.",
    grade: "A",
    dietType: "GLUTEN_FREE",
  },
  {
    serialNumber: "FS-FRU-005",
    name: "Sweet Sweet Strawberry",
    slug: "sweet-sweet-strawberry",
    productCategoryId: "a75b5566-b0bf-42a5-b783-b8244e3178aa", // Fruits
    price: new Prisma.Decimal(30000.0),
    description:
      "Freshly picked local strawberries with a balanced sweet and sour taste.",
    weightPerGram: new Prisma.Decimal(250.0),
    unit: "PACK",
    storageInstructions:
      "Store in the refrigerator and avoid stacking to prevent bruising.",
    grade: "B",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-HRB-003",
    name: "Fresh Dill Leaves",
    slug: "fresh-dill-leaves",
    productCategoryId: "3a743fe3-31d3-4d56-b073-e92b33053354", // Herbs
    price: new Prisma.Decimal(9000.0),
    description:
      "Aromatic fresh dill leaves, excellent for seafood garnishes and sauces.",
    weightPerGram: new Prisma.Decimal(50.0),
    unit: "PACK",
    storageInstructions: "Wrap loosely in a damp paper towel and refrigerate.",
    grade: "A",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-VEG-004",
    name: "Fresh Mustard Greens",
    slug: "fresh-mustard-greens",
    productCategoryId: "47586e56-5460-41d3-86f0-3a0b126fabc0", // Fresh Produce
    price: new Prisma.Decimal(7000.0),
    description:
      "Crisp mustard greens (Sawi Hijau), perfect for stir-fries or noodle soup toppings.",
    weightPerGram: new Prisma.Decimal(500.0),
    unit: "PACK",
    storageInstructions:
      "Store in a plastic bag inside the vegetable compartment of your fridge.",
    grade: "B",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-VEG-005",
    name: "Fresh Purple Cabbage",
    slug: "fresh-purple-cabbage",
    productCategoryId: "47586e56-5460-41d3-86f0-3a0b126fabc0", // Fresh Produce
    price: new Prisma.Decimal(16000.0),
    description:
      "Vibrant and crunchy purple cabbage, great for colorful salads and coleslaw.",
    weightPerGram: new Prisma.Decimal(700.0),
    unit: "PCS",
    storageInstructions:
      "Keep tightly wrapped in plastic wrap in the refrigerator.",
    grade: "A",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-FRU-006",
    name: "Manalagi Sweet Grapes",
    slug: "manalagi-sweet-grapes",
    productCategoryId: "a75b5566-b0bf-42a5-b783-b8244e3178aa", // Fruits
    price: new Prisma.Decimal(40000.0),
    description: "Local sweet Manalagi grapes, crisp texture and seedless.",
    weightPerGram: new Prisma.Decimal(500.0),
    unit: "KG",
    storageInstructions: "Refrigerate unwashed in a ventilated plastic bag.",
    grade: "A",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-BAK-001",
    name: "Classic French Baguette",
    slug: "classic-french-baguette",
    productCategoryId: "dd385405-9ca2-4d72-b0c3-0acc36122c65", // Bakery
    price: new Prisma.Decimal(18000.0),
    description:
      "Traditional French baguette with a crusty exterior and soft, airy interior.",
    weightPerGram: new Prisma.Decimal(250.0),
    unit: "PCS",
    storageInstructions:
      "Consume within a day or freeze. Reheat in the oven before serving.",
    grade: "A",
    dietType: "HALAL",
  },
  {
    serialNumber: "FS-SEA-002",
    name: "Fresh Cleaned Squid",
    slug: "fresh-cleaned-squid",
    productCategoryId: "70e3e7a2-193f-4cb7-8eab-4a2337a65ee6", // Seafood
    price: new Prisma.Decimal(65000.0),
    description:
      "Freshly caught squid, pre-cleaned (skinned and gutted), ready to cook.",
    weightPerGram: new Prisma.Decimal(500.0),
    unit: "PACK",
    storageInstructions:
      "Keep in the freezer at -18°C. Defrost in the fridge before cooking.",
    grade: "A",
    dietType: "HALAL",
  },
];

const store: Prisma.StoreCreateManyInput[] = [
  {
    userId: "ce4cdf82-8621-4191-9b2e-858c23262f1e",
    name: "Freshora Hub Jakarta Barat",
    address: "Jl. Kemerdekaan No. 45, RT 02/RW 04",
    districtId: 2190,
    district: "Kebon Jeruk",
    cityId: 152,
    city: "Jakarta Barat",
    provinceId: 9,
    province: "DKI Jakarta",
    postalCode: "11530",
    latitude: -6.1944,
    longitude: 106.7612,
    phone: "081234567890",
  },
];

const productPhotos: Prisma.ProductPhotoCreateManyInput[] = [
  {
    productId: "02d9917a-cfd7-4c13-9a21-ae16c8b3d9ca", // Fresh Cleaned Squid
    photoUrl:
      "https://i.pinimg.com/736x/f3/b2/d8/f3b2d86d71ed6ab3b729aef16fe80b37.jpg",
  },
  {
    productId: "17d1594b-aa24-46e4-b873-2680c91ac3c3", // Fresh Mustard Greens
    photoUrl:
      "https://i.pinimg.com/1200x/79/cf/8f/79cf8f92d185ab12dac3261b10d3f770.jpg",
  },
  {
    productId: "1568e035-06c0-4538-854c-b1923ce06138", // Fresh Purple Cabbage
    photoUrl:
      "https://i.pinimg.com/736x/a7/8c/f2/a78cf21bb164cefd42bab5f3f8a44734.jpg",
  },
  {
    productId: "5a9fef5a-bf85-4d3d-a5c0-4fa5a7e386c5", // Manalagi Sweet Grapes
    photoUrl:
      "https://i.pinimg.com/736x/9e/24/b9/9e24b90e7da4d81737d1f4caf80457fc.jpg",
  },
  {
    productId: "1fe02c9f-8da7-4d0e-b0f9-b10d204e24d0", // Classic French Baguette
    photoUrl:
      "https://i.pinimg.com/736x/13/e3/b1/13e3b103e835b2e9ca67330f9ce4af6a.jpg",
  },
  {
    productId: "75c8498e-50ec-4c35-8f9e-bfbad06a1c2f", // Fresh Lime
    photoUrl:
      "https://i.pinimg.com/736x/47/eb/90/47eb909cf0996a4293a663232ce46b6b.jpg",
  },
  {
    productId: "1e058e8d-81df-4fc0-923d-61f0043bcf42", // Sweet California Papaya
    photoUrl:
      "https://i.pinimg.com/736x/bd/85/5c/bd855cd97cc0e8e5896cce06bf8a4343.jpg",
  },
  {
    productId: "c0b19460-80ab-4e82-8f3a-e4d4cf84ba6f", // Premium Chicken Eggs
    photoUrl:
      "https://i.pinimg.com/736x/9f/4a/9f/9f4a9f43f90b11d8746a6a5ffd98c4c1.jpg",
  },
  {
    productId: "e213b154-0c29-406c-ade6-de4b53c75795", // Fresh Organic Spinach
    photoUrl:
      "https://i.pinimg.com/736x/db/15/53/db155376ffaab24aa480e4522b5774f7.jpg",
  },
  {
    productId: "a508ffdf-2f23-4da5-b78f-9f044333c6d1", // Fresh Salmon Fillet 500g
    photoUrl:
      "https://i.pinimg.com/736x/99/66/fd/9966fd3a7e1e949c3804438b6b4aaa83.jpg",
  },
  {
    productId: "4247b56e-0d32-4d64-a428-e626474ab70b", // Fresh Garlic
    photoUrl:
      "https://i.pinimg.com/736x/9d/2d/92/9d2d927328ca0707e354b98bdb300434.jpg",
  },
  {
    productId: "9130fefc-3c6c-44ea-bfbd-8ec50161741a", // Premium Dried Chilli
    photoUrl:
      "https://i.pinimg.com/736x/21/35/90/2135901f4a05e7558700cbd7d53620c6.jpg",
  },
  {
    productId: "4b3c22ce-12e3-467c-877e-e5e7079e5e37", // Large Red Chilli
    photoUrl:
      "https://i.pinimg.com/736x/cc/90/33/cc903353027d2684a5febaab2ddc0d69.jpg",
  },
  {
    productId: "0fdd4a23-d3d0-4129-9640-2accc355edd6", // Sweet Sunkist Orange
    photoUrl:
      "https://i.pinimg.com/736x/1f/14/30/1f1430faf44415229395ddc7a939f3b7.jpg",
  },
  {
    productId: "02bde60e-5122-4c7b-a23b-0b8d13b06bdf", // Fresh Beef Tomato
    photoUrl:
      "https://i.pinimg.com/736x/de/4b/95/de4b959b7a005c7d50a603be3303d06c.jpg",
  },
  {
    productId: "91266910-36cb-4856-9372-15beac9f8d0c", // Fresh Blueberry Premium
    photoUrl:
      "https://i.pinimg.com/736x/f6/b9/89/f6b9890ed8f7d9e9b11d8875151c9b9c.jpg",
  },
  {
    productId: "c7bde0a4-846a-4203-8d86-e2b3534b99ac", // Sweet Sweet Strawberry
    photoUrl:
      "https://i.pinimg.com/736x/1d/00/66/1d006662ba61d4eda66429dcc79624a9.jpg",
  },
  {
    productId: "f0a62b5a-93eb-42c5-aa42-18ed2c32cad4", // Fresh Dill Leaves
    photoUrl:
      "https://i.pinimg.com/736x/e1/f4/b4/e1f4b428ba5c9065649f469f83b219e8.jpg",
  },
];

// const stocksData: Prisma.StockCreateManyInput[] = [
//   {
//     storeId: "f0b8cade-383e-4c1a-ab6b-768004a25cc9",
//     productId: "9a7aeda5-0139-470b-a797-359133c08a09",
//     quantity: 30,
//   },
//   {
//     storeId: "f0b8cade-383e-4c1a-ab6b-768004a25cc9",
//     productId: "4dc10eb2-e3b4-4aba-bcb7-b84904519e5d",
//     quantity: 2,
//   },
// ];

const storeId = "4a6db395-43cd-4182-a796-cfd878e7eb01";

const productStocks: Prisma.StockCreateManyInput[] = [
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "02d9917a-cfd7-4c13-9a21-ae16c8b3d9ca", // Fresh Cleaned Squid
    quantity: 250,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "17d1594b-aa24-46e4-b873-2680c91ac3c3", // Fresh Mustard Greens
    quantity: 210,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "1568e035-06c0-4538-854c-b1923ce06138", // Fresh Purple Cabbage
    quantity: 220,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "5a9fef5a-bf85-4d3d-a5c0-4fa5a7e386c5", // Manalagi Sweet Grapes
    quantity: 240,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "1fe02c9f-8da7-4d0e-b0f9-b10d204e24d0", // Classic French Baguette
    quantity: 300,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "75c8498e-50ec-4c35-8f9e-bfbad06a1c2f", // Fresh Lime
    quantity: 280,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "1e058e8d-81df-4fc0-923d-61f0043bcf42", // Sweet California Papaya
    quantity: 215,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "c0b19460-80ab-4e82-8f3a-e4d4cf84ba6f", // Premium Chicken Eggs
    quantity: 500,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "e213b154-0c29-406c-ade6-de4b53c75795", // Fresh Organic Spinach
    quantity: 230,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "a508ffdf-2f23-4da5-b78f-9f044333c6d1", // Fresh Salmon Fillet 500g
    quantity: 250,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "4247b56e-0d32-4d64-a428-e626474ab70b", // Fresh Garlic
    quantity: 400,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "9130fefc-3c6c-44ea-bfbd-8ec50161741a", // Premium Dried Chilli
    quantity: 350,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "4b3c22ce-12e3-467c-877e-e5e7079e5e37", // Large Red Chilli
    quantity: 320,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "0fdd4a23-d3d0-4129-9640-2accc355edd6", // Sweet Sunkist Orange
    quantity: 260,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "02bde60e-5122-4c7b-a23b-0b8d13b06bdf", // Fresh Beef Tomato
    quantity: 245,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "91266910-36cb-4856-9372-15beac9f8d0c", // Fresh Blueberry Premium
    quantity: 210,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "c7bde0a4-846a-4203-8d86-e2b3534b99ac", // Sweet Sweet Strawberry
    quantity: 225,
  },
  {
    storeId: "3ff1684b-a20f-4f47-985a-1e4447c93896",
    productId: "f0a62b5a-93eb-42c5-aa42-18ed2c32cad4", // Fresh Dill Leaves
    quantity: 215,
  },
];

const productDiscounts: Prisma.DiscountCreateManyInput[] = [
  {
    productId: "332f53c1-5090-495f-8af2-856d2dc03800",
    type: "NO_REQUIREMENT",
    discountAmount: new Prisma.Decimal(10),
    validFrom: new Date("2026-05-01T00:00:00Z"),
    validUntil: new Date("2026-06-30T23:59:59Z"),
  },
  {
    productId: "4dc10eb2-e3b4-4aba-bcb7-b84904519e5d",
    type: "BUY_ONE_GET_ONE",
    discountAmount: new Prisma.Decimal(0.0),
    validFrom: new Date("2026-05-25T00:00:00Z"),
    validUntil: new Date("2026-06-05T23:59:59Z"),
  },
  {
    productId: "9a7aeda5-0139-470b-a797-359133c08a09",
    type: "NO_REQUIREMENT",
    discountAmount: new Prisma.Decimal(5),
    validFrom: new Date("2026-05-15T00:00:00Z"),
    validUntil: new Date("2026-07-15T23:59:59Z"),
  },
];

const referralVoucher: Prisma.ReferralVoucherCreateManyInput[] = [
  {
    userId: "ef18777a-85ed-4987-a846-7e8066ec2209",
    referralOwnerId: "a8371c28-9f5d-4956-bdc9-9b5e6c435619",
    couponCode: "CA34DQ5Z",
    discountAmount: new Prisma.Decimal(5),
    validFrom: new Date("2026-05-28T00:00:00Z"),
    validUntil: new Date("2026-08-28T23:59:59Z"),
  },
];

async function main() {
  await prisma.stock.createMany({ data: productStocks });
}

main()
  .then(() => console.log("success"))
  .catch((e) => console.log(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
