# Issue 03 — Prisma ORM & Database Schema

**Labels:** `setup`, `database` | **Priority:** 🔴 Critical | **Depends on:** Issue 02

## Checklist
- [ ] Initialize Prisma
- [ ] Create `.env` with all environment variables
- [ ] Create `prisma.config.mjs`
- [ ] Write the full `schema.prisma`
- [ ] Run `pnpm prisma db push`
- [ ] Verify with `pnpm prisma studio`

## Instructions

### 1. Initialize Prisma
```bash
pnpm prisma init
```

### 2. Create `.env` in project root
> ⚠️ Each team member sets their own database credentials. Do NOT commit this file.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME"
JWT_SECRET="generate-a-64-char-hex-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="your_preset"
CLOUDINARY_API_SECRET="your_secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Create `prisma.config.mjs` in project root
```js
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
```

### 4. Replace `prisma/schema.prisma` with the full schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model User {
  id           Int       @id @default(autoincrement())
  email        String    @unique
  passwordHash String    @map("password_hash")
  name         String
  role         String    @default("buyer") // "buyer" | "seller"
  avatarUrl    String?   @map("avatar_url")
  bio          String?
  location     String?
  socialLinks  Json?     @map("social_links")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  products  Product[]
  reviews   Review[]
  cartItems CartItem[]
  orders    Order[]

  @@map("users")
}

model Category {
  id          Int       @id @default(autoincrement())
  name        String    @unique
  slug        String    @unique
  description String?
  imageUrl    String?   @map("image_url")
  products    Product[]
  @@map("categories")
}

model Product {
  id           Int       @id @default(autoincrement())
  sellerId     Int       @map("seller_id")
  categoryId   Int       @map("category_id")
  title        String
  slug         String    @unique
  description  String
  price        Decimal   @db.Decimal(10, 2)
  inventoryQty Int       @default(0) @map("inventory_qty")
  tags         String[]  @default([])
  status       String    @default("draft") // "active" | "draft" | "sold_out"
  avgRating    Float     @default(0) @map("avg_rating")
  reviewCount  Int       @default(0) @map("review_count")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  seller     User          @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  category   Category      @relation(fields: [categoryId], references: [id])
  images     ProductImage[]
  reviews    Review[]
  cartItems  CartItem[]
  orderItems OrderItem[]

  @@index([sellerId])
  @@index([categoryId])
  @@index([status])
  @@index([avgRating])
  @@index([createdAt])
  @@map("products")
}

model ProductImage {
  id           Int     @id @default(autoincrement())
  productId    Int     @map("product_id")
  url          String
  publicId     String? @map("public_id")
  displayOrder Int     @default(0) @map("display_order")
  isPrimary    Boolean @default(false) @map("is_primary")
  product      Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@index([productId])
  @@map("product_images")
}

model Review {
  id            Int       @id @default(autoincrement())
  productId     Int       @map("product_id")
  userId        Int       @map("user_id")
  rating        Int       // 1-5
  comment       String
  sellerReply   String?   @map("seller_reply")
  sellerReplyAt DateTime? @map("seller_reply_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  orderItemId   Int?      @unique @map("order_item_id")

  product   Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  orderItem OrderItem? @relation(fields: [orderItemId], references: [id])

  @@index([productId])
  @@index([userId])
  @@map("reviews")
}

model CartItem {
  id        Int      @id @default(autoincrement())
  userId    Int      @map("user_id")
  productId Int      @map("product_id")
  quantity  Int      @default(1)
  createdAt DateTime @default(now()) @map("created_at")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@unique([userId, productId])
  @@index([userId])
  @@map("cart_items")
}

model Order {
  id              Int      @id @default(autoincrement())
  userId          Int      @map("user_id")
  status          String   @default("pending") // "pending" | "confirmed" | "shipped" | "delivered"
  totalAmount     Decimal  @db.Decimal(10, 2) @map("total_amount")
  shippingAddress Json     @map("shipping_address")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  items           OrderItem[]
  @@index([userId])
  @@index([status])
  @@map("orders")
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int     @map("order_id")
  productId Int     @map("product_id")
  quantity  Int
  unitPrice Decimal @db.Decimal(10, 2) @map("unit_price")
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
  review    Review?
  @@index([orderId])
  @@map("order_items")
}
```

### 5. Push the schema to the database
```bash
pnpm prisma db push
```

### 6. Verify
```bash
pnpm prisma studio
```
This should open a browser with all empty tables visible.
