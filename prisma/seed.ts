import { PrismaClient, ContentType, MediaPlatform, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  ["Leaderboards & Attention Markets", "leaderboards", "Attention markets and leaderboards"],
  ["SEO & AI Visibility", "seo", "SEO and AI search visibility"],
  ["Marketing & Advertising", "marketing", "Marketing and advertising tools"],
  ["Productivity & Personal Tools", "productivity", "Productivity apps"],
  ["AI Agents & Infrastructure", "agents", "AI agents and infrastructure"],
  ["Crypto, Web3 & Investing", "crypto", "Crypto and web3"],
  ["Developer Tools", "developer", "Developer tools"],
  ["Other", "other", "Everything else"],
  ["Health, Fitness & Wellness", "health", "Health and fitness"],
  ["Business, Finance & Legal", "business", "Business and finance"],
  ["Games & Entertainment", "games", "Games and entertainment"],
  ["Ecommerce & Retail", "ecommerce", "Ecommerce"],
  ["Travel, Local & Lifestyle", "travel", "Travel and lifestyle"],
  ["Directories, Launch & Discovery", "directories", "Directories and launches"],
  ["Agencies, Studios & Services", "agencies", "Agencies and services"],
  ["AI Media Generation", "ai-media", "AI media generation"],
  ["Education & Learning", "education", "Education"],
  ["Social Media & Creator Tools", "social", "Social and creators"],
  ["People & Profiles", "people", "People and profiles"],
  ["Design & Creative", "design", "Design"],
  ["Hiring, Jobs & Careers", "hiring", "Hiring"],
  ["Domains & Web Assets", "domains", "Domains"],
  ["Security, Privacy & Compliance", "security", "Security"],
  ["Sales & Lead Generation", "sales", "Sales"],
  ["Media & News", "news", "Media and news"],
  ["Real Estate & Property", "real-estate", "Real estate"],
  ["Writing & Content", "writing", "Writing"],
  ["Audio, Voice & Podcasting", "audio", "Audio"],
  ["Analytics", "analytics", "Analytics"],
];

const PROFILE_SEEDS = [
  ["nikestore", "Nike Store", "Fashion & Sports", "https://www.nike.com"],
  ["urbanbites", "Urban Bites", "Food", "https://example.com/urbanbites"],
  ["technest", "TechNest", "Technology", "https://example.com/technest"],
  ["reelcraft", "ReelCraft", "Creators", "https://youtube.com"],
  ["dealhunter", "Deal Hunter", "Deals", "https://example.com/deals"],
  ["glowlab", "Glow Lab", "Beauty", "https://example.com/glow"],
  ["pixelplay", "Pixel Play", "Gaming", "https://example.com/pixel"],
  ["wanderlist", "WanderList", "Travel", "https://example.com/travel"],
  ["learnly", "Learnly", "Education", "https://example.com/learn"],
  ["freshbasket", "Fresh Basket", "Groceries", "https://example.com/fresh"],
  ["startuplane", "Startup Lane", "Startups", "https://example.com/startups"],
  ["appforge", "AppForge", "Apps", "https://example.com/apps"],
  ["localspice", "Local Spice", "Local Businesses", "https://example.com/local"],
  ["stylehaus", "Style Haus", "Fashion", "https://example.com/style"],
  ["servewise", "ServeWise", "Services", "https://example.com/services"],
];

const PRODUCT_TITLES = [
  "Nike Air Max Everyday Runner",
  "Minimal Leather Crossbody",
  "Noise-Canceling Travel Headphones",
  "Ceramic Pour-Over Set",
  "Matte Black Mechanical Keyboard",
  "Portable Espresso Maker",
  "Merino Travel Tee",
  "Smart LED Desk Lamp",
  "Recycled Canvas Tote",
  "Wireless Charging Stand",
];

const FOOD_TITLES = [
  "Butter Chicken Thali Bowl",
  "Sourdough Avocado Toast Kit",
  "Midnight Ramen Broth Pack",
  "Cold Brew Concentrate",
  "Street-Style Pav Bhaji Kit",
];

const DEAL_TITLES = [
  "Flash Deal: 40% off Studio Monitors",
  "Weekend Grocery Bundle",
  "Creator Softbox Duo Discount",
  "Limited Run Sneaker Drop",
];

function img(seed: string) {
  return `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=800&q=80`;
}

const IMAGE_SEEDS = [
  "1542291026-7eec264c27ff",
  "1523275335684-37898b6baf30",
  "1505740420928-5e560c06d30e",
  "1565299624946-b28f40a0ae38",
  "1498049794561-7780e7231661",
  "1511920170033-f8396924c348",
  "1483985988355-763728e1935b",
  "1558618666-fcd25c85f82e",
  "1441986300917-64674bd600d8",
  "1511707171634-5f897ff02aa9",
  "1476224203421-9ac39bcb3327",
  "1504674900247-0877df9cc836",
  "1556742049-0cfed4f6a45d",
  "1517248135467-4c7eded8d8b7",
  "1493770348161-369560ae357d",
];

async function main() {
  console.log("Seeding MakeMeViral...");

  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.moderationAction.deleteMany();
  await prisma.report.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.save.deleteMany();
  await prisma.like.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.promotionSlot.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.listingMedia.deleteMany();
  await prisma.listingCategory.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.promotionProduct.deleteMany();
  await prisma.category.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.siteSetting.deleteMany();

  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: "Free",
        slug: "free",
        description: "Start discovering and publishing",
        price: 0,
        billingCycle: "NONE",
        listingLimit: 50,
        sortOrder: 1,
        features: ["50 listings", "Basic profile"],
      },
    }),
    prisma.plan.create({
      data: {
        name: "Creator",
        slug: "creator",
        description: "For growing creators",
        price: 499,
        billingCycle: "MONTHLY",
        listingLimit: 100,
        analyticsEnabled: true,
        profileCustomization: true,
        promotionCredits: 1,
        sortOrder: 2,
        features: ["100 listings", "Analytics", "Customization"],
      },
    }),
    prisma.plan.create({
      data: {
        name: "Business",
        slug: "business",
        description: "For brands and stores",
        price: 1999,
        billingCycle: "MONTHLY",
        listingLimit: 500,
        analyticsEnabled: true,
        profileCustomization: true,
        featuredListingLimit: 5,
        promotionCredits: 5,
        sortOrder: 3,
        features: ["500 listings", "Advanced analytics", "Featured slots"],
      },
    }),
    prisma.plan.create({
      data: {
        name: "Pro",
        slug: "pro",
        description: "High-volume publishers",
        price: 4999,
        billingCycle: "MONTHLY",
        listingLimit: 2000,
        analyticsEnabled: true,
        profileCustomization: true,
        featuredListingLimit: 20,
        promotionCredits: 15,
        sortOrder: 4,
        features: ["2000 listings", "Priority support", "Advanced features"],
      },
    }),
  ]);

  const promoProducts = [
    { type: "TOP_50" as const, name: "Top 50", description: "More visibility in category feeds", price: 299, durationHours: 72, slotLimit: 50, sortOrder: 1 },
    { type: "TOP_20" as const, name: "Top 20", description: "High visibility placement", price: 599, durationHours: 48, slotLimit: 20, sortOrder: 2 },
    { type: "TOP_10" as const, name: "Top 10", description: "Maximum category visibility", price: 999, durationHours: 24, slotLimit: 10, sortOrder: 3 },
    { type: "FEATURED" as const, name: "Featured", description: "Premium placement badges", price: 1499, durationHours: 168, slotLimit: 12, sortOrder: 4 },
    { type: "HOMEPAGE_FEATURE" as const, name: "Homepage Feature", description: "Highest visibility on homepage", price: 2499, durationHours: 72, slotLimit: 6, sortOrder: 5 },
  ];
  for (const p of promoProducts) {
    await prisma.promotionProduct.create({ data: p });
  }

  const categories = [];
  for (let i = 0; i < CATEGORIES.length; i++) {
    const [name, slug, description] = CATEGORIES[i];
    categories.push(
      await prisma.category.create({
        data: { name, slug, description, sortOrder: i + 1, icon: "spark" },
      }),
    );
  }

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@viralme.live",
      passwordHash,
      name: "Platform Admin",
      role: Role.SUPER_ADMIN,
      profile: { create: { username: "admin", displayName: "viralme Admin", isVerified: true } },
      subscription: { create: { planId: plans[3].id, status: "ACTIVE" } },
    },
    include: { profile: true },
  });

  const users = [admin];
  for (let i = 0; i < 30; i++) {
    const seed = PROFILE_SEEDS[i % PROFILE_SEEDS.length];
    const username = i < PROFILE_SEEDS.length ? seed[0] : `creator${i + 1}`;
    const displayName = i < PROFILE_SEEDS.length ? seed[1] : `Creator ${i + 1}`;
    const category = i < PROFILE_SEEDS.length ? seed[2] : "Creators";
    const website = i < PROFILE_SEEDS.length ? seed[3] : undefined;
    const emailBase = i < PROFILE_SEEDS.length ? username : `creator${i + 1}`;
    const user = await prisma.user.create({
      data: {
        email: `${emailBase}@makemeviral.app`,
        passwordHash,
        name: displayName,
        role: Role.USER,
        profile: {
          create: {
            username: i < PROFILE_SEEDS.length ? username : `creator${i + 1}`,
            displayName,
            bio: `${displayName} shares curated discoveries on MakeMeViral.`,
            category,
            website,
            avatarUrl: img(IMAGE_SEEDS[i % IMAGE_SEEDS.length]),
            coverUrl: img(IMAGE_SEEDS[(i + 3) % IMAGE_SEEDS.length]),
            isVerified: i % 4 === 0,
            followerCount: 120 + i * 37,
            viewCount: 800 + i * 120,
          },
        },
        subscription: {
          create: {
            planId: plans[i % 3 === 0 ? 2 : i % 2 === 0 ? 1 : 0].id,
            status: "ACTIVE",
          },
        },
      },
      include: { profile: true },
    });
    users.push(user);
  }

  const profileUsers = users.filter((u) => u.profile);
  const listings = [];
  let listingIndex = 0;

  function nextTitle(type: ContentType) {
    if (type === "FOOD" || type === "GROCERY") return FOOD_TITLES[listingIndex % FOOD_TITLES.length];
    if (type === "DEAL") return DEAL_TITLES[listingIndex % DEAL_TITLES.length];
    if (type === "VIDEO") return `Creator Cut #${(listingIndex % 40) + 1}`;
    return PRODUCT_TITLES[listingIndex % PRODUCT_TITLES.length];
  }

  const types: ContentType[] = [
    "PRODUCT",
    "VIDEO",
    "FOOD",
    "GROCERY",
    "DEAL",
    "CREATOR",
    "APP",
    "SERVICE",
    "PRODUCT",
    "VIDEO",
  ];

  for (let i = 0; i < 150; i++) {
    listingIndex = i;
    const owner = profileUsers[i % profileUsers.length];
    const contentType = types[i % types.length];
    const title = `${nextTitle(contentType)} ${i > 20 ? i : ""}`.trim();
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)}-${i}`;
    const isVideo = contentType === "VIDEO";
    const youtubeIds = ["dQw4w9WgXcQ", "jNQXAC9IVRw", "9bZkp7q19f0", "kJQP7kiw5Fk", "3JZ_D3ELwOQ"];
    const platform = isVideo
      ? i % 3 === 0
        ? MediaPlatform.YOUTUBE_SHORTS
        : MediaPlatform.YOUTUBE
      : MediaPlatform.EXTERNAL;
    const externalId = isVideo ? youtubeIds[i % youtubeIds.length] : undefined;
    const originalUrl = isVideo
      ? platform === MediaPlatform.YOUTUBE_SHORTS
        ? `https://www.youtube.com/shorts/${externalId}`
        : `https://www.youtube.com/watch?v=${externalId}`
      : `https://example.com/item/${slug}`;

    const viewCount = 200 + ((i * 97) % 12000);
    const likeCount = 10 + ((i * 13) % 1800);
    const saveCount = 5 + ((i * 7) % 900);
    const clickCount = 20 + ((i * 11) % 2500);
    const publishedAt = new Date(Date.now() - i * 3 * 60 * 60 * 1000);
    const organicScore = 0;

    const cat = categories[(i + contentType.length) % categories.length];

    const listing = await prisma.listing.create({
      data: {
        ownerId: owner.id,
        profileId: owner.profile!.id,
        title,
        slug,
        description: `${title} — curated for discovery on MakeMeViral. Real-world product and content inspiration.`,
        contentType,
        status: "PUBLISHED",
        originalUrl,
        externalUrl: originalUrl,
        platform,
        externalId,
        thumbnailUrl: isVideo
          ? `https://i.ytimg.com/vi/${externalId}/hqdefault.jpg`
          : img(IMAGE_SEEDS[i % IMAGE_SEEDS.length]),
        price: contentType === "PRODUCT" || contentType === "DEAL" ? 499 + (i % 40) * 50 : null,
        currency: "INR",
        location: i % 5 === 0 ? "Mumbai" : i % 5 === 1 ? "Bengaluru" : null,
        tags: [contentType.toLowerCase(), cat.slug, "trending"],
        creatorHandle: `@${owner.profile!.username}`,
        viewCount,
        uniqueViewCount: Math.floor(viewCount * 0.72),
        likeCount,
        saveCount,
        shareCount: Math.floor(likeCount * 0.2),
        clickCount,
        organicScore,
        rankAmount: Math.max(0, 50 - i) * (i < 20 ? 100 : 0) + (i < 15 ? (15 - i) * 200 : 0),
        todayRankAmount: i < 10 ? (10 - i) * 25 : 0,
        todayRankDate: i < 10 ? new Date().toISOString().slice(0, 10) : null,
        publishedAt,
        isFeatured: i % 17 === 0,
        categories: { create: [{ categoryId: cat.id }] },
        media: {
          create: [
            {
              url: isVideo
                ? `https://i.ytimg.com/vi/${externalId}/hqdefault.jpg`
                : img(IMAGE_SEEDS[i % IMAGE_SEEDS.length]),
              type: isVideo ? "video" : "image",
              platform,
              externalId,
            },
          ],
        },
      },
    });
    listings.push(listing);
  }

  // Active promotions in slots
  for (let i = 0; i < 8; i++) {
    const listing = listings[i];
    const type = i < 5 ? ("TOP_10" as const) : ("HOMEPAGE_FEATURE" as const);
    const promo = await prisma.promotion.create({
      data: {
        listingId: listing.id,
        userId: listing.ownerId,
        type,
        status: "ACTIVE",
        price: 999,
        startAt: new Date(),
        endAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        slotPosition: i + 1,
      },
    });
    await prisma.promotionSlot.create({
      data: {
        promotionId: promo.id,
        type,
        position: (i % 6) + 1,
        listingId: listing.id,
        startAt: new Date(),
        endAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });
  }

  // Social graph samples
  for (let i = 1; i < 20; i++) {
    await prisma.like.create({
      data: { userId: users[i].id, listingId: listings[i].id },
    });
    await prisma.save.create({
      data: { userId: users[i].id, listingId: listings[(i + 3) % listings.length].id },
    });
    if (users[i].profile && users[(i + 1) % users.length].profile) {
      await prisma.follow.create({
        data: {
          followerId: users[i].id,
          followingId: users[(i + 1) % users.length].profile!.id,
        },
      });
    }
  }

  await prisma.featureFlag.createMany({
    data: [
      { key: "ENABLE_INSTAGRAM", enabled: true, description: "Instagram reel embeds" },
      { key: "ENABLE_YOUTUBE", enabled: true, description: "YouTube embeds" },
      { key: "ENABLE_PAID_PROMOTIONS", enabled: true, description: "Paid promotion checkout" },
      { key: "ENABLE_COMMENTS", enabled: false, description: "Comments (future)" },
      { key: "ENABLE_FOLLOWERS", enabled: true, description: "Follow profiles" },
      { key: "ENABLE_SAVES", enabled: true, description: "Save listings" },
      { key: "ENABLE_CREATOR_PROFILES", enabled: true, description: "Creator profiles" },
    ],
  });

  await prisma.siteSetting.createMany({
    data: [
      { key: "siteName", value: "MakeMeViral" },
      { key: "tagline", value: "Claim a rank on the public leaderboard" },
      { key: "supportEmail", value: "hello@makemeviral.app" },
      { key: "rankMinAmount", value: 10 },
      { key: "rankBumpAmount", value: 5 },
      { key: "rankCurrency", value: "USD" },
    ],
  });

  // Update listing counts on profiles
  for (const u of profileUsers) {
    const count = await prisma.listing.count({ where: { profileId: u.profile!.id } });
    await prisma.profile.update({ where: { id: u.profile!.id }, data: { listingCount: count } });
  }

  console.log(`Seeded ${users.length} users, ${profileUsers.length} profiles, ${listings.length} listings, ${categories.length} categories`);
  console.log("Admin login: admin@makemeviral.app / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
