import { prisma } from "../configs/prisma.config";
import { CreateProductInput } from "../schemas/product.schema";
import { AppError } from "../utils/appErrror.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import slugify from "slugify";
import { generateSerialNumber } from "../utils/generateSerialNumber";
import { Prisma } from "../../generated/prisma/client";
import { uploadMany } from "../utils/cloudinaryUploader.util";

export const productServices = {
  createProduct: async (data: CreateProductInput) => {
    try {
      const {
        name,
        description,
        price,
        weightPerGram,
        unit,
        storageInstructions,
        grade,
        dietType,
        productCategoryId,
        images,
      } = data;
      const category = await prisma.productCategory.findUnique({
        where: {
          productCategoryId,
        },
      });
      if (!category) {
        throw new AppError(404, "Product category not found");
      }
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: {
            equals: name.trim(),
            mode: "insensitive",
          },
          deletedAt: null,
        },
      });
      if (existingProduct) {
        throw new AppError(409, "Product with this name already exists");
      }
      const baseSlug = slugify(name.trim(), {
        lower: true,
        strict: true,
        trim: true,
      });
      let slug = baseSlug;
      const existingSlug = await prisma.product.findUnique({
        where: {
          slug,
        },
        select: {
          productId: true,
        },
      });
      // If slug already exists -> append timestamp
      if (existingSlug) {
        slug = `${baseSlug}-${Date.now()}`;
      }
      let serialNumber = generateSerialNumber();
      const existingSerial = await prisma.product.findUnique({
        where: {
          serialNumber,
        },
        select: {
          productId: true,
        },
      });
      if (existingSerial) {
        serialNumber = `${generateSerialNumber()}-${Date.now()}`
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 15);
      }
      const imageUrls = await uploadMany(
        images as Express.Multer.File[],
        "freshora/products",
      );
      const newProduct = await prisma.product.create({
        data: {
          name: name.trim(),
          description: description.trim(),
          price: new Prisma.Decimal(price),
          weightPerGram: new Prisma.Decimal(weightPerGram),
          unit,
          storageInstructions: storageInstructions?.trim(),
          grade,
          dietType,
          productCategoryId,
          slug,
          serialNumber,
          productPhotos: {
            create: imageUrls.map((url) => ({
              photoUrl: url,
            })),
          },
        },
      });

      return newProduct;
    } catch (error) {
      throw handlePrismaError(error);
    }
  },

  deleteProduct: async (productId: string) => {},
  updateProduct: async (
    productId: string,
    data: Partial<CreateProductInput>,
  ) => {
    const product = await prisma.product.findUnique({ where: { productId } }); // Validate product existence first
    const productPhotos = await prisma.productPhoto.findMany({
      where: { productId },
    });
    if (!product) throw new AppError(404, "Product not found");
    let imageUrls = productPhotos.map((photo) => photo.photoUrl);
  },
};
