import { Prisma } from "../generated/prisma/client";
import { prisma } from "../src/configs/prisma.config";

const products: Prisma.ProductCreateManyInput[] = [
  {
    serialNumber: "PRD-DRY-001",
    name: "premium fresh milk",
    slug: "premium-fresh-milk",
    productCategoryId: "045fbc0e-4521-4799-b6a1-274fd3e3fe3d",
    price: 25000.0,
    description:
      "susu sapi segar pasteurisasi murni berkualitas tinggi, kaya akan kalsium dan vitamin d tanpa bahan pengawet tambahan.",
    weightPerGram: 1000.0,
    unit: "PCS",
    storageInstructions:
      "simpan di dalam lemari es dengan suhu 2 sampai 4 derajat celcius.",
    grade: "A",
    dietType: "HALAL",
  },
  {
    serialNumber: "PRD-HLT-001",
    name: "organic rolled oats",
    slug: "organic-rolled-oats",
    productCategoryId: "2be74f9f-8787-496f-b00d-42b017c63f14",
    price: 38000.0,
    description:
      "oat utuh organik kaya serat pangan yang sangat baik untuk menjaga kesehatan jantung dan mengontrol kadar gula darah.",
    weightPerGram: 500.0,
    unit: "PCS",
    storageInstructions:
      "simpan di tempat kering, sejuk, dan jauhkan dari paparan sinar matahari langsung.",
    grade: "A",
    dietType: "VEGAN",
  },
];

async function main() {
  await prisma.product.createMany({ data: products });
}

main()
  .then(() => console.log("success"))
  .catch((e) => console.log(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
