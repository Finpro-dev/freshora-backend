import { prisma } from "../configs/prisma.config";
import {
  CreateProductInput,
  ProductParamsInput,
  UpdateProductInput,
} from "../schemas/product.schema";
import { AppError } from "../utils/appError.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import slugify from "slugify";
import { generateSerialNumber } from "../utils/generateSerialNumber";
import { Prisma, Product } from "../../generated/prisma/client";
import { uploadMany } from "../utils/cloudinaryUploader.util";

export const productServices = {
  getAllProducts: async (params: ProductParamsInput) => {
    const { page = 1, limit = 10, search, category } = params;
    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };
    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }
    if (category) {
      where.productCategoryId = category;
    }
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: where,
        skip,
        take: limit,
        include: {
          productCategory: {
            select: {
              productCategoryId: true,
              category: true,
            },
          },
          productPhotos: {
            select: {
              photoUrl: true,
            },
          },
          stocks: {
            select: {
              quantity: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.product.count({
        where: where,
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: products,
      pagination: {
        page,
        limit,
        totalItems: totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  },

  getProductById: async (productId: string) => {
    const product = await prisma.product.findUnique({
      where: {
        productId,
        deletedAt: null,
      },
    });
    if (!product) {
      throw new AppError(404, "Product not found");
    }
    return product;
  },

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
  deleteProduct: async (productId: string) => {
    try {
      //existing product check
      const product = await prisma.product.findUnique({
        where: {
          productId,
        },
        include: { productPhotos: true },
      });
      if (!product || product.deletedAt !== null) {
        throw new AppError(404, "Product not found or already deleted");
      }
      const deletedProduct = await prisma.$transaction(async (tx) => {
        // productPhoto deletion
        await tx.productPhoto.deleteMany({
          where: { productId },
        });
        // Soft Delete
        return await tx.product.update({
          where: { productId },
          data: { deletedAt: new Date() },
        });
      });

      return deletedProduct;
    } catch (error) {
      throw handlePrismaError(error);
    }
  },
  updateProduct: async (
    productId: string,
    data: Partial<UpdateProductInput>,
  ) => {
    try {
      const { images, ...updateData } = data;
      const product = await prisma.product.findUnique({
        where: { productId },
        include: { productPhotos: true },
      }); // Validate product existence first
      if (!product) throw new AppError(404, "Product not found");
      if (images && (images as Express.Multer.File[]).length > 0) {
        await prisma.productPhoto.deleteMany({
          where: { productId },
        });
        const newImageUrls = await uploadMany(
          images as Express.Multer.File[],
          "freshora/products",
        );
        (updateData as any).productPhotos = {
          create: newImageUrls.map((url) => ({
            photoUrl: url,
          })),
        };
      }
      // new slug for updated name
      if (updateData.name && updateData.name !== product.name) {
        const baseSlug = slugify(updateData.name.trim(), {
          lower: true,
          strict: true,
        });
        (updateData as any).slug = `${baseSlug}-${Date.now()}`;
      }
      const finalData: any = { ...updateData };
      if (updateData.price)
        finalData.price = new Prisma.Decimal(updateData.price);
      if (updateData.weightPerGram)
        finalData.weightPerGram = new Prisma.Decimal(updateData.weightPerGram);
      const updatedProduct = await prisma.product.update({
        where: { productId },
        data: finalData,
        include: { productPhotos: true },
      });
      return updatedProduct;
    } catch (error) {
      throw handlePrismaError(error);
    }
  },
};
