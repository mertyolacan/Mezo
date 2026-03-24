import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  decimal,
  timestamp,
  jsonb,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const campaignTypeEnum = pgEnum("campaign_type", [
  "coupon",
  "cart_total",
  "product",
  "category",
  "bogo",
  "volume",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed",
]);

export const blogStatusEnum = pgEnum("blog_status", ["published", "draft", "archived"]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "open",
  "in_progress",
  "resolved",
  "closed",
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  image: text("image"),
  description: text("description"),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Brands ───────────────────────────────────────────────────────────────────

export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  logo: text("logo"),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Products ─────────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: text("short_description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal("compare_price", { precision: 10, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(5),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  brandId: integer("brand_id").references(() => brands.id, {
    onDelete: "set null",
  }),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  crossSellIds: jsonb("cross_sell_ids").$type<number[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  seoSettings: jsonb("seo_settings").$type<{
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    noIndex?: boolean;
    canonicalUrl?: string;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("products_category_id_idx").on(t.categoryId),
  index("products_brand_id_idx").on(t.brandId),
  index("products_is_active_idx").on(t.isActive),
  index("products_is_featured_idx").on(t.isFeatured),
]);

// ─── Orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerEmail: varchar("customer_email", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }),
  shippingAddress: jsonb("shipping_address").$type<{
    street: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
  }>(),
  items: jsonb("items")
    .$type<
      {
        productId: number;
        name: string;
        price: number;
        quantity: number;
        image: string;
      }[]
    >()
    .notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  appliedCampaigns: jsonb("applied_campaigns")
    .$type<{ id: number; name: string; discount: number }[]>()
    .notNull()
    .default([]),
  status: orderStatusEnum("status").notNull().default("pending"),
  notes: text("notes"),
  adminNotes: text("admin_notes"),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("cod"),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("pending"),
  paymentId: varchar("payment_id", { length: 255 }),
  iyzicoToken: varchar("iyzico_token", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("orders_user_id_idx").on(t.userId),
  index("orders_status_idx").on(t.status),
  index("orders_created_at_idx").on(t.createdAt),
]);

// ─── Campaigns ────────────────────────────────────────────────────────────────

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: campaignTypeEnum("type").notNull(),
  discountType: discountTypeEnum("discount_type").notNull(),
  discountValue: decimal("discount_value", {
    precision: 10,
    scale: 2,
  }).notNull(),
  couponCode: varchar("coupon_code", { length: 50 }).unique(),
  minQuantity: integer("min_quantity"),
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }),
  buyQuantity: integer("buy_quantity"),
  getQuantity: integer("get_quantity"),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "cascade",
  }),
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "cascade",
  }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  maxUsage: integer("max_usage"),
  perUserLimit: integer("per_user_limit"),
  currentUsage: integer("current_usage").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  isStackable: boolean("is_stackable").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("campaigns_is_active_idx").on(t.isActive),
]);

export const campaignUsage = pgTable("campaign_usage", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  orderId: integer("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),
  usedAt: timestamp("used_at").notNull().defaultNow(),
});

// ─── Favorites ────────────────────────────────────────────────────────────────

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Blog ─────────────────────────────────────────────────────────────────────

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  image: text("image"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  status: blogStatusEnum("status").notNull().default("draft"),
  authorId: integer("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  seoSettings: jsonb("seo_settings").$type<{
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    noIndex?: boolean;
    canonicalUrl?: string;
  }>(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Contact Messages ─────────────────────────────────────────────────────────

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Support Tickets ──────────────────────────────────────────────────────────

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: varchar("ticket_number", { length: 50 }).notNull().unique(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: ticketStatusEnum("status").notNull().default("open"),
  priority: ticketPriorityEnum("priority").notNull().default("medium"),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ticketReplies = pgTable("ticket_replies", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id")
    .notNull()
    .references(() => supportTickets.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── SEO Pages ────────────────────────────────────────────────────────────────

export const seoPages = pgTable("seo_pages", {
  id: serial("id").primaryKey(),
  page: varchar("page", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  keywords: text("keywords"),
  ogTitle: varchar("og_title", { length: 255 }),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  twitterCard: varchar("twitter_card", { length: 50 }).default("summary_large_image"),
  robots: varchar("robots", { length: 100 }).default("index, follow"),
  canonical: text("canonical"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Site Settings ────────────────────────────────────────────────────────────

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),

  // ── SEO / Meta (GlobalSettingsForm tarafından yönetilir) ──────────────────
  siteName: varchar("site_name", { length: 255 }).notNull().default("MesoPro"),
  titleSeparator: varchar("title_separator", { length: 20 }).notNull().default(" | "),
  defaultDescription: text("default_description"),
  defaultOgImage: text("default_og_image"),
  gaId: varchar("ga_id", { length: 50 }),
  gscId: varchar("gsc_id", { length: 100 }),
  faviconUrl: text("favicon_url"),
  customScripts: jsonb("custom_scripts").$type<{
    head?: string;
    bodyStart?: string;
    bodyEnd?: string;
  }>(),

  // ── Marka / Genel (SiteSettingsForm tarafından yönetilir) ─────────────────
  siteTagline: varchar("site_tagline", { length: 255 }),
  logoUrl: text("logo_url"),

  // ── İletişim ──────────────────────────────────────────────────────────────
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactEmail: varchar("contact_email", { length: 100 }),
  contactAddress: text("contact_address"),
  workingHours: varchar("working_hours", { length: 255 }),

  // ── Sosyal Medya ──────────────────────────────────────────────────────────
  socialInstagram: varchar("social_instagram", { length: 255 }),
  socialFacebook: varchar("social_facebook", { length: 255 }),
  socialTwitter: varchar("social_twitter", { length: 255 }),
  socialYoutube: varchar("social_youtube", { length: 255 }),
  socialLinkedin: varchar("social_linkedin", { length: 255 }),
  socialTiktok: varchar("social_tiktok", { length: 255 }),
  socialWhatsapp: varchar("social_whatsapp", { length: 50 }),

  // ── Ödeme ─────────────────────────────────────────────────────────────────
  paymentCodEnabled: boolean("payment_cod_enabled").notNull().default(true),
  paymentCardEnabled: boolean("payment_card_enabled").notNull().default(false),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  favorites: many(favorites),
  supportTickets: many(supportTickets),
  blogPosts: many(blogPosts),
  campaignUsage: many(campaignUsage),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  favorites: many(favorites),
  campaigns: many(campaigns),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  campaigns: many(campaigns),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  products: many(products),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  campaignUsage: many(campaignUsage),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  product: one(products, {
    fields: [campaigns.productId],
    references: [products.id],
  }),
  category: one(categories, {
    fields: [campaigns.categoryId],
    references: [categories.id],
  }),
  usage: many(campaignUsage),
}));

export const supportTicketsRelations = relations(
  supportTickets,
  ({ one, many }) => ({
    user: one(users, {
      fields: [supportTickets.userId],
      references: [users.id],
    }),
    replies: many(ticketReplies),
  })
);

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, { fields: [blogPosts.authorId], references: [users.id] }),
}));

// ─── Navigation Menus ─────────────────────────────────────────────────────────

export const navMenus = pgTable("nav_menus", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  location: varchar("location", { length: 50 }).notNull().unique(), // e.g. "header", "footer"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const navItems = pgTable("nav_items", {
  id: serial("id").primaryKey(),
  menuId: integer("menu_id").notNull().references(() => navMenus.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"),
  label: varchar("label", { length: 100 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  target: varchar("target", { length: 20 }).notNull().default("_self"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Dynamic Pages (Page Builder) ─────────────────────────────────────────────

export const pageStatusEnum = pgEnum("page_status", ["draft", "published", "scheduled"]);

export const dynamicPages = pgTable("dynamic_pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  sections: jsonb("sections").$type<Array<{ type: string; data: Record<string, unknown> }>>().notNull().default([]),
  status: pageStatusEnum("status").notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  scheduledAt: timestamp("scheduled_at"),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  ogImage: text("og_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Product Reviews ──────────────────────────────────────────────────────────

export const productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  comment: text("comment"),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, { fields: [productReviews.productId], references: [products.id] }),
  user: one(users, { fields: [productReviews.userId], references: [users.id] }),
}));

// ─── Password Reset Tokens ────────────────────────────────────────────────────

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, { fields: [passwordResetTokens.userId], references: [users.id] }),
}));

// ─── User Addresses ───────────────────────────────────────────────────────────

export const userAddresses = pgTable("user_addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 100 }).notNull(), // ör. "Ev", "İş"
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  street: text("street").notNull(),
  district: varchar("district", { length: 100 }),
  city: varchar("city", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }).notNull().default("Türkiye"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userAddressesRelations = relations(userAddresses, ({ one }) => ({
  user: one(users, { fields: [userAddresses.userId], references: [users.id] }),
}));

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Nav Relations ────────────────────────────────────────────────────────────

export const navMenusRelations = relations(navMenus, ({ many }) => ({
  items: many(navItems),
}));

export const navItemsRelations = relations(navItems, ({ one }) => ({
  menu: one(navMenus, { fields: [navItems.menuId], references: [navMenus.id] }),
}));
