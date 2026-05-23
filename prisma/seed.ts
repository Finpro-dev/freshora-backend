import { Prisma } from "../generated/prisma/client";
import { prisma } from "../src/configs/prisma.config";

const stocksData: Prisma.StockCreateManyInput[] = [
  {
    storeId: "ae60eedb-ef2a-45d8-bb4e-02a29e986f11",
    productId: "de9e5e4a-9d8c-4543-a765-bc03c5809f45",
    quantity: 3,
  },
  {
    storeId: "ae60eedb-ef2a-45d8-bb4e-02a29e986f11",
    productId: "f709b918-8524-4ad4-a573-5ef960f84385",
    quantity: 2,
  },
];

async function main() {
  await prisma.stock.createMany({ data: stocksData });
}

main()
  .then(() => console.log("success"))
  .catch((e) => console.log(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
