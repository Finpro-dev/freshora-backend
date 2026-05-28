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
    serialNumber: "FS-BRK-001",
    name: "Organic Rolled Oats Premium",
    slug: "organic-rolled-oats-premium",
    productCategoryId: "2386d66f-3a87-403e-9505-7ef2c1b72b2d",
    price: new Prisma.Decimal(45000.0),
    description:
      "Oat gandum utuh organik premium, kaya serat dan sangat baik untuk sarapan sehat keluarga. Bebas pengawet.",
    weightPerGram: new Prisma.Decimal(500.0),
    unit: "PACK",
    storageInstructions:
      "Simpan di tempat kering, sejuk, dan wadah tertutup rapat setelah dibuka.",
    grade: "A",
    dietType: "GLUTEN_FREE",
  },
  {
    serialNumber: "FS-INS-002",
    name: "Mie Instan Sayur Organik",
    slug: "mie-instan-sayur-organik",
    productCategoryId: "40be95f2-7f0d-42f1-a457-d2a563d664dd",
    price: new Prisma.Decimal(12500.0),
    description:
      "Mie instan sehat yang terbuat dari ekstrak sayur organik tanpa tambahan MSG sintetis dan pewarna buatan.",
    weightPerGram: new Prisma.Decimal(85.0),
    unit: "PCS",
    storageInstructions: "Hindari sinar matahari langsung dan tempat lembab.",
    grade: "B",
    dietType: "VEGAN",
  },
  {
    serialNumber: "FS-BRK-003",
    name: "Sosis Ayam Halal Premium",
    slug: "sosis-ayam-halal-premium",
    productCategoryId: "2386d66f-3a87-403e-9505-7ef2c1b72b2d",
    price: new Prisma.Decimal(68000.0),
    description:
      "Sosis daging ayam pilihan berkualitas tinggi dengan racikan bumbu alami. Sangat praktis untuk menu sarapan pagi.",
    weightPerGram: new Prisma.Decimal(1000.0),
    unit: "KG",
    storageInstructions:
      "Wajib disimpan di dalam freezer dengan suhu -18 derajat Celcius.",
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

const stocksData: Prisma.StockCreateManyInput[] = [
  {
    storeId: "f0b8cade-383e-4c1a-ab6b-768004a25cc9",
    productId: "9a7aeda5-0139-470b-a797-359133c08a09",
    quantity: 30,
  },
  {
    storeId: "f0b8cade-383e-4c1a-ab6b-768004a25cc9",
    productId: "4dc10eb2-e3b4-4aba-bcb7-b84904519e5d",
    quantity: 2,
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
  await prisma.referralVoucher.createMany({ data: referralVoucher });
}

main()
  .then(() => console.log("success"))
  .catch((e) => console.log(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
