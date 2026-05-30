-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'STORE_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "AddressStatus" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('KG', 'G', 'PCS', 'PACK');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('CREDENTIALS', 'GOOGLE');

-- CreateEnum
CREATE TYPE "DietType" AS ENUM ('VEGAN', 'VEGETARIAN', 'GLUTEN_FREE', 'HALAL');

-- CreateEnum
CREATE TYPE "ProductGrade" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "MutationStatus" AS ENUM ('PENDING', 'PROCESSED', 'SHIPPING', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PROCESSING', 'SHIPPING', 'CANCELED', 'COMPLETED', 'WAITING_FOR_PAYMENT');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('BUY_ONE_GET_ONE', 'MIN_TRANSACTION', 'NO_REQUIREMENT');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('GOPAY', 'BANK_TRANSFER', 'CREDIT_CARD', 'SHOPEEPAY', 'OVO', 'DANA', 'QRIS', 'ALFAMART', 'INDOMARET', 'AKULAKU', 'KREDIVO', 'GOOGLE_PAY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SETTLEMENT', 'DENIED', 'EXPIRED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('MANUAL_ADD', 'MANUAL_DEDUCT', 'ORDER_REDUCTION', 'ORDER_CANCELED', 'MUTATION_IN', 'MUTATION_OUT');

-- CreateTable
CREATE TABLE "users" (
    "email" VARCHAR(30) NOT NULL,
    "password" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "avatar" TEXT,
    "firstName" VARCHAR(30) NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'MALE',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastName" VARCHAR(30) NOT NULL,
    "myReferralCode" VARCHAR(8) NOT NULL,
    "phone" VARCHAR(15),
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "usedReferralCode" TEXT,
    "userId" TEXT NOT NULL,
    "authProvider" "AuthProvider" NOT NULL,
    "authProviderId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "addresses" (
    "addressId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" VARCHAR(100) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "province" VARCHAR(50) NOT NULL,
    "postalCode" VARCHAR(5) NOT NULL,
    "addressStatus" "AddressStatus" NOT NULL DEFAULT 'SECONDARY',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "cityId" INTEGER NOT NULL,
    "districtId" INTEGER NOT NULL,
    "provinceId" INTEGER NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("addressId")
);

-- CreateTable
CREATE TABLE "verifications" (
    "verificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("verificationId")
);

-- CreateTable
CREATE TABLE "refreshTokens" (
    "refreshTokenId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL,

    CONSTRAINT "refreshTokens_pkey" PRIMARY KEY ("refreshTokenId")
);

-- CreateTable
CREATE TABLE "resetPasswords" (
    "resetPasswordId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "resetPasswords_pkey" PRIMARY KEY ("resetPasswordId")
);

-- CreateTable
CREATE TABLE "carts" (
    "cartId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "carts_pkey" PRIMARY KEY ("cartId")
);

-- CreateTable
CREATE TABLE "cartItems" (
    "cartItemId" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "cartItems_pkey" PRIMARY KEY ("cartItemId")
);

-- CreateTable
CREATE TABLE "productCategories" (
    "productCategoryId" TEXT NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "productCategories_pkey" PRIMARY KEY ("productCategoryId")
);

-- CreateTable
CREATE TABLE "products" (
    "productId" TEXT NOT NULL,
    "serialNumber" VARCHAR(15) NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "slug" TEXT NOT NULL,
    "productCategoryId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "weightPerGram" DECIMAL(10,2) NOT NULL,
    "unit" "Unit" NOT NULL,
    "storageInstructions" VARCHAR(150),
    "grade" "ProductGrade" NOT NULL,
    "dietType" "DietType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("productId")
);

-- CreateTable
CREATE TABLE "productPhotos" (
    "productPhotoId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "productPhotos_pkey" PRIMARY KEY ("productPhotoId")
);

-- CreateTable
CREATE TABLE "stores" (
    "storeId" TEXT NOT NULL,
    "userId" TEXT,
    "name" VARCHAR(30) NOT NULL,
    "address" VARCHAR(100) NOT NULL,
    "district" VARCHAR(50) NOT NULL,
    "city" VARCHAR(50) NOT NULL,
    "province" VARCHAR(50) NOT NULL,
    "postalCode" VARCHAR(5) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" VARCHAR(15) NOT NULL,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "cityId" INTEGER NOT NULL,
    "districtId" INTEGER NOT NULL,
    "provinceId" INTEGER NOT NULL,

    CONSTRAINT "stores_pkey" PRIMARY KEY ("storeId")
);

-- CreateTable
CREATE TABLE "stocks" (
    "stockId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("stockId")
);

-- CreateTable
CREATE TABLE "stockJournals" (
    "stockJournalId" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    "quantityChange" INTEGER NOT NULL,
    "type" "ActivityType" NOT NULL,
    "transactionId" TEXT,
    "mutationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "stockJournals_pkey" PRIMARY KEY ("stockJournalId")
);

-- CreateTable
CREATE TABLE "mutations" (
    "mutationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fromStoreId" TEXT NOT NULL,
    "toStoreId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "mutationStatus" "MutationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "mutations_pkey" PRIMARY KEY ("mutationId")
);

-- CreateTable
CREATE TABLE "freeShippingVouchers" (
    "freeShippingVoucherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT,
    "currentTotalTransactions" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "freeShippingVouchers_pkey" PRIMARY KEY ("freeShippingVoucherId")
);

-- CreateTable
CREATE TABLE "transactions" (
    "transactionId" TEXT NOT NULL,
    "transactionNumber" VARCHAR(15) NOT NULL,
    "userId" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "totalDiscount" DECIMAL(10,2) NOT NULL,
    "grandTotal" DECIMAL(10,2) NOT NULL,
    "shippedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "discountId" TEXT,
    "shippingCost" DECIMAL(10,2) NOT NULL,
    "storeId" TEXT NOT NULL,
    "transactionStatus" "TransactionStatus" NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("transactionId")
);

-- CreateTable
CREATE TABLE "referralVouchers" (
    "referralVoucherId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralOwnerId" TEXT NOT NULL,
    "couponCode" VARCHAR(8) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "referralVouchers_pkey" PRIMARY KEY ("referralVoucherId")
);

-- CreateTable
CREATE TABLE "payments" (
    "paymentId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "snapToken" TEXT NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "discounts" (
    "discountId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "minTransaction" DECIMAL(10,2),
    "validUntil" TIMESTAMP(3) NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("discountId")
);

-- CreateTable
CREATE TABLE "orderItems" (
    "orderItemId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "subTotalItem" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "transactionId" TEXT NOT NULL,

    CONSTRAINT "orderItems_pkey" PRIMARY KEY ("orderItemId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_myReferralCode_key" ON "users"("myReferralCode");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "verifications_hashedToken_key" ON "verifications"("hashedToken");

-- CreateIndex
CREATE UNIQUE INDEX "refreshTokens_token_key" ON "refreshTokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "resetPasswords_hashedToken_key" ON "resetPasswords"("hashedToken");

-- CreateIndex
CREATE UNIQUE INDEX "carts_userId_key" ON "carts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "productCategories_category_key" ON "productCategories"("category");

-- CreateIndex
CREATE UNIQUE INDEX "products_serialNumber_key" ON "products"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "stores_userId_key" ON "stores"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_storeId_productId_key" ON "stocks"("storeId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "freeShippingVouchers_transactionId_key" ON "freeShippingVouchers"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_transactionNumber_key" ON "transactions"("transactionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "referralVouchers_userId_key" ON "referralVouchers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "referralVouchers_couponCode_key" ON "referralVouchers"("couponCode");

-- CreateIndex
CREATE UNIQUE INDEX "referralVouchers_transactionId_key" ON "referralVouchers"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refreshTokens" ADD CONSTRAINT "refreshTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resetPasswords" ADD CONSTRAINT "resetPasswords_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("cartId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartItems" ADD CONSTRAINT "cartItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "productCategories"("productCategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productPhotos" ADD CONSTRAINT "productPhotos_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks" ADD CONSTRAINT "stocks_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockJournals" ADD CONSTRAINT "stockJournals_mutationId_fkey" FOREIGN KEY ("mutationId") REFERENCES "mutations"("mutationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockJournals" ADD CONSTRAINT "stockJournals_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "stocks"("stockId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stockJournals" ADD CONSTRAINT "stockJournals_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("transactionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutations" ADD CONSTRAINT "mutations_fromStoreId_fkey" FOREIGN KEY ("fromStoreId") REFERENCES "stores"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutations" ADD CONSTRAINT "mutations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mutations" ADD CONSTRAINT "mutations_toStoreId_fkey" FOREIGN KEY ("toStoreId") REFERENCES "stores"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freeShippingVouchers" ADD CONSTRAINT "freeShippingVouchers_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("transactionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "freeShippingVouchers" ADD CONSTRAINT "freeShippingVouchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("addressId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "discounts"("discountId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("storeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referralVouchers" ADD CONSTRAINT "referralVouchers_referralOwnerId_fkey" FOREIGN KEY ("referralOwnerId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referralVouchers" ADD CONSTRAINT "referralVouchers_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("transactionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referralVouchers" ADD CONSTRAINT "referralVouchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("transactionId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discounts" ADD CONSTRAINT "discounts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("productId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderItems" ADD CONSTRAINT "orderItems_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("transactionId") ON DELETE RESTRICT ON UPDATE CASCADE;
