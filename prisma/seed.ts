import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...\n')

  // ============================================
  // STEP 1: Create Admin User
  // ============================================
  console.log('Creating admin user...')
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@allergy.my' },
    update: {},
    create: {
      email: 'admin@allergy.my',
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
    }
  })
  console.log('✓ Admin user created')

  // ============================================
  // STEP 2: Create Allergens
  // ============================================
  console.log('\nCreating allergens...')
  const allergenData = [
    { nameEn: 'Peanuts', nameMs: 'Kacang Tanah', icon: '🥜', displayOrder: 1, descriptionEn: 'Common allergen found in many Malaysian dishes', isMajor: true },
    { nameEn: 'Tree Nuts', nameMs: 'Kacang Pokok', icon: '🌰', displayOrder: 2, descriptionEn: 'Includes cashews, almonds, walnuts', isMajor: true },
    { nameEn: 'Milk', nameMs: 'Susu', icon: '🥛', displayOrder: 3, descriptionEn: 'Dairy products and milk-based ingredients', isMajor: true },
    { nameEn: 'Eggs', nameMs: 'Telur', icon: '🥚', displayOrder: 4, descriptionEn: 'Eggs and egg-based products', isMajor: true },
    { nameEn: 'Wheat', nameMs: 'Gandum', icon: '🌾', displayOrder: 5, descriptionEn: 'Wheat flour and wheat-based products', isMajor: true },
    { nameEn: 'Soy', nameMs: 'Kacang Soya', icon: '🫘', displayOrder: 6, descriptionEn: 'Soy sauce, tofu, and soy-based products', isMajor: true },
    { nameEn: 'Fish', nameMs: 'Ikan', icon: '🐟', displayOrder: 7, descriptionEn: 'All types of fish and fish products', isMajor: true },
    { nameEn: 'Shellfish', nameMs: 'Makanan Laut Berkulit', icon: '🦐', displayOrder: 8, descriptionEn: 'Shrimp, crab, lobster, and other shellfish', isMajor: true },
    { nameEn: 'Sesame', nameMs: 'Bijan', icon: '🫘', displayOrder: 9, descriptionEn: 'Sesame seeds and sesame oil', isMajor: true },
    { nameEn: 'Gluten', nameMs: 'Gluten', icon: '🌾', displayOrder: 10, descriptionEn: 'Found in wheat, barley, and rye', isMajor: true },
    { nameEn: 'Belacan', nameMs: 'Belacan', icon: '🦐', displayOrder: 11, descriptionEn: 'Malaysian shrimp paste, common in local cuisine', isMajor: false },
    { nameEn: 'Tempoyak', nameMs: 'Tempoyak', icon: '🍈', displayOrder: 12, descriptionEn: 'Fermented durian paste', isMajor: false },
    { nameEn: 'Budu', nameMs: 'Budu', icon: '🐟', displayOrder: 13, descriptionEn: 'Fermented fish sauce, popular in East Coast Malaysia', isMajor: false },
    { nameEn: 'Petai', nameMs: 'Petai', icon: '🫘', displayOrder: 14, descriptionEn: 'Stink beans, common in Malaysian cooking', isMajor: false },
  ]

  for (const allergen of allergenData) {
    await prisma.allergen.upsert({
      where: { nameEn: allergen.nameEn },
      update: {},
      create: allergen
    })
  }
  console.log('✓ 14 allergens created')

  // Get all allergen IDs for later use
  const allAllergens = await prisma.allergen.findMany()
  const allergenMap = Object.fromEntries(
    allAllergens.map(a => [a.nameEn, a.id])
  )

  // ============================================
  // STEP 3: Create Consumer Users
  // ============================================
  console.log('\nCreating consumer users...')
  const consumers = []

  const consumer1 = await prisma.user.upsert({
    where: { email: 'sarah@demo.my' },
    update: {},
    create: {
      email: 'sarah@demo.my',
      name: 'Sarah Ahmad',
      role: 'CONSUMER',
      emailVerified: true,
    }
  })
  consumers.push(consumer1)

  const consumer2 = await prisma.user.upsert({
    where: { email: 'john@demo.my' },
    update: {},
    create: {
      email: 'john@demo.my',
      name: 'John Tan',
      role: 'CONSUMER',
      emailVerified: true,
    }
  })
  consumers.push(consumer2)

  const consumer3 = await prisma.user.upsert({
    where: { email: 'mei@demo.my' },
    update: {},
    create: {
      email: 'mei@demo.my',
      name: 'Mei Ling',
      role: 'CONSUMER',
      emailVerified: true,
    }
  })
  consumers.push(consumer3)

  console.log('✓ 3 consumer users created')

  // Create allergen profiles for consumers
  console.log('\nCreating allergen profiles for consumers...')

  // Sarah is allergic to peanuts and shellfish
  await prisma.userAllergenProfile.upsert({
    where: { userId_allergenId: { userId: consumer1.id, allergenId: allergenMap['Peanuts'] } },
    update: {},
    create: {
      userId: consumer1.id,
      allergenId: allergenMap['Peanuts'],
      severity: 'SEVERE',
      notes: 'Anaphylaxis risk - carries EpiPen'
    }
  })
  await prisma.userAllergenProfile.upsert({
    where: { userId_allergenId: { userId: consumer1.id, allergenId: allergenMap['Shellfish'] } },
    update: {},
    create: {
      userId: consumer1.id,
      allergenId: allergenMap['Shellfish'],
      severity: 'MODERATE',
      notes: 'Causes hives and difficulty breathing'
    }
  })

  // John is lactose intolerant and allergic to eggs
  await prisma.userAllergenProfile.upsert({
    where: { userId_allergenId: { userId: consumer2.id, allergenId: allergenMap['Milk'] } },
    update: {},
    create: {
      userId: consumer2.id,
      allergenId: allergenMap['Milk'],
      severity: 'MILD',
      notes: 'Lactose intolerant - causes digestive issues'
    }
  })
  await prisma.userAllergenProfile.upsert({
    where: { userId_allergenId: { userId: consumer2.id, allergenId: allergenMap['Eggs'] } },
    update: {},
    create: {
      userId: consumer2.id,
      allergenId: allergenMap['Eggs'],
      severity: 'MODERATE',
      notes: 'Causes skin rashes'
    }
  })

  // Mei has gluten sensitivity
  await prisma.userAllergenProfile.upsert({
    where: { userId_allergenId: { userId: consumer3.id, allergenId: allergenMap['Gluten'] } },
    update: {},
    create: {
      userId: consumer3.id,
      allergenId: allergenMap['Gluten'],
      severity: 'MODERATE',
      notes: 'Celiac disease - strict gluten-free diet'
    }
  })

  console.log('✓ Allergen profiles created for consumers')

  // ============================================
  // STEP 4: Create Vendors
  // ============================================
  console.log('\nCreating vendors...')
  const vendors = []

  // Vendor 1: Nasi Lemak Corner
  const vendorUser1 = await prisma.user.upsert({
    where: { email: 'ali@nasilemak.my' },
    update: {},
    create: {
      email: 'ali@nasilemak.my',
      name: 'Pak Ali',
      role: 'VENDOR',
      emailVerified: true,
    }
  })

  const vendor1 = await prisma.vendor.upsert({
    where: { userId: vendorUser1.id },
    update: {},
    create: {
      userId: vendorUser1.id,
      businessNameEn: 'Nasi Lemak Corner',
      businessNameMs: 'Warung Nasi Lemak',
      businessType: 'hawker',
      address: 'Jalan Raja Laut, Kuala Lumpur',
      state: 'Kuala Lumpur',
      status: 'APPROVED',
      halalCertified: true,
      halalCertNumber: 'JAKIM-2024-001',
      verifiedBy: admin.id,
      verifiedAt: new Date(),
    }
  })
  vendors.push(vendor1)

  // Vendor 2: Dim Sum Palace
  const vendorUser2 = await prisma.user.upsert({
    where: { email: 'wong@dimsum.my' },
    update: {},
    create: {
      email: 'wong@dimsum.my',
      name: 'Chef Wong',
      role: 'VENDOR',
      emailVerified: true,
    }
  })

  const vendor2 = await prisma.vendor.upsert({
    where: { userId: vendorUser2.id },
    update: {},
    create: {
      userId: vendorUser2.id,
      businessNameEn: 'Golden Dragon Dim Sum',
      businessNameMs: 'Dim Sum Naga Emas',
      businessType: 'restaurant',
      address: 'Jalan Alor, Bukit Bintang',
      state: 'Kuala Lumpur',
      status: 'APPROVED',
      halalCertified: false,
      verifiedBy: admin.id,
      verifiedAt: new Date(),
    }
  })
  vendors.push(vendor2)

  // Vendor 3: Indian Cuisine
  const vendorUser3 = await prisma.user.upsert({
    where: { email: 'kumar@tandoori.my' },
    update: {},
    create: {
      email: 'kumar@tandoori.my',
      name: 'Kumar Raj',
      role: 'VENDOR',
      emailVerified: true,
    }
  })

  const vendor3 = await prisma.vendor.upsert({
    where: { userId: vendorUser3.id },
    update: {},
    create: {
      userId: vendorUser3.id,
      businessNameEn: 'Tandoori Nights',
      businessNameMs: 'Tandoori Nights',
      businessType: 'restaurant',
      address: 'Brickfields, Kuala Lumpur',
      state: 'Kuala Lumpur',
      status: 'APPROVED',
      halalCertified: true,
      halalCertNumber: 'JAKIM-2024-002',
      verifiedBy: admin.id,
      verifiedAt: new Date(),
    }
  })
  vendors.push(vendor3)

  // Vendor 4: Western Cafe
  const vendorUser4 = await prisma.user.upsert({
    where: { email: 'emma@cafe.my' },
    update: {},
    create: {
      email: 'emma@cafe.my',
      name: 'Emma Lee',
      role: 'VENDOR',
      emailVerified: true,
    }
  })

  const vendor4 = await prisma.vendor.upsert({
    where: { userId: vendorUser4.id },
    update: {},
    create: {
      userId: vendorUser4.id,
      businessNameEn: 'The Cozy Cafe',
      businessNameMs: 'Kafe Selesa',
      businessType: 'cafe',
      address: 'Bangsar Village, Kuala Lumpur',
      state: 'Kuala Lumpur',
      status: 'APPROVED',
      halalCertified: false,
      verifiedBy: admin.id,
      verifiedAt: new Date(),
    }
  })
  vendors.push(vendor4)

  // Vendor 5: Japanese Restaurant
  const vendorUser5 = await prisma.user.upsert({
    where: { email: 'yuki@sushi.my' },
    update: {},
    create: {
      email: 'yuki@sushi.my',
      name: 'Yuki Tanaka',
      role: 'VENDOR',
      emailVerified: true,
    }
  })

  const vendor5 = await prisma.vendor.upsert({
    where: { userId: vendorUser5.id },
    update: {},
    create: {
      userId: vendorUser5.id,
      businessNameEn: 'Sakura Sushi House',
      businessNameMs: 'Rumah Sushi Sakura',
      businessType: 'restaurant',
      address: 'Pavilion KL, Kuala Lumpur',
      state: 'Kuala Lumpur',
      status: 'APPROVED',
      halalCertified: false,
      verifiedBy: admin.id,
      verifiedAt: new Date(),
    }
  })
  vendors.push(vendor5)

  // Pending vendor for demo
  const pendingVendorUser = await prisma.user.upsert({
    where: { email: 'pending@vendor.my' },
    update: {},
    create: {
      email: 'pending@vendor.my',
      name: 'Restoran Pak Abu',
      role: 'VENDOR',
      emailVerified: true,
    }
  })

  await prisma.vendor.upsert({
    where: { userId: pendingVendorUser.id },
    update: {},
    create: {
      userId: pendingVendorUser.id,
      businessNameEn: 'Pak Abu Chinese Restaurant',
      businessNameMs: 'Restoran Cina Pak Abu',
      businessType: 'restaurant',
      address: 'Jalan Petaling, Kuala Lumpur',
      state: 'Kuala Lumpur',
      status: 'PENDING',
      halalCertified: false,
    }
  })

  console.log('✓ 6 vendors created (5 approved, 1 pending)')

  // ============================================
  // STEP 5: Create Dishes
  // ============================================
  console.log('\nCreating dishes...')

  // Dishes for Vendor 1: Nasi Lemak Corner
  const dishes = []

  const dish1 = await prisma.dish.create({
    data: {
      vendorId: vendor1.id,
      nameEn: 'Nasi Lemak with Fried Chicken',
      nameMs: 'Nasi Lemak dengan Ayam Goreng',
      descriptionEn: 'Fragrant coconut rice served with fried chicken, sambal, ikan bilis, peanuts, and cucumber',
      descriptionMs: 'Nasi wangi kelapa disajikan dengan ayam goreng, sambal, ikan bilis, kacang tanah, dan timun',
      category: 'main',
      cuisineType: 'malay',
      price: 8.50,
      imageUrl: 'https://i.pinimg.com/736x/12/45/ef/1245ef1f6b6df2b3c1b99405e039e6b7.jpg',
      preparationTime: 15,
      servingSize: '1 plate',
      calories: 650,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Peanuts'], contains: 'YES', notes: 'Contains roasted peanuts as topping' },
          { allergenId: allergenMap['Shellfish'], contains: 'YES', notes: 'Anchovies (ikan bilis)' },
          { allergenId: allergenMap['Belacan'], contains: 'YES', notes: 'Sambal contains belacan' },
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Coconut milk in rice' },
        ]
      }
    }
  })
  dishes.push(dish1)

  const dish2 = await prisma.dish.create({
    data: {
      vendorId: vendor1.id,
      nameEn: 'Beef Rendang',
      nameMs: 'Rendang Daging',
      descriptionEn: 'Slow-cooked beef in rich coconut curry with aromatic spices',
      descriptionMs: 'Daging lembu dimasak perlahan dalam kuah kelapa yang kaya dengan rempah ratus',
      category: 'main',
      cuisineType: 'malay',
      price: 12.00,
      imageUrl: 'https://i.pinimg.com/736x/12/45/ef/1245ef1f6b6df2b3c1b99405e039e6b7.jpg',
      preparationTime: 20,
      servingSize: '1 plate',
      calories: 580,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Contains coconut milk' },
          { allergenId: allergenMap['Tree Nuts'], contains: 'YES', notes: 'Contains candlenuts' },
          { allergenId: allergenMap['Peanuts'], contains: 'NO' },
        ]
      }
    }
  })
  dishes.push(dish2)

  const dish3 = await prisma.dish.create({
    data: {
      vendorId: vendor1.id,
      nameEn: 'Teh Tarik',
      nameMs: 'Teh Tarik',
      descriptionEn: 'Malaysian pulled tea with condensed milk, served hot',
      descriptionMs: 'Teh Malaysia yang ditarik dengan susu pekat manis, disajikan panas',
      category: 'beverage',
      cuisineType: 'malay',
      price: 2.50,
      imageUrl: 'https://i.pinimg.com/736x/12/45/ef/1245ef1f6b6df2b3c1b99405e039e6b7.jpg',
      preparationTime: 5,
      servingSize: '1 cup',
      calories: 150,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Contains condensed milk' },
        ]
      }
    }
  })
  dishes.push(dish3)

  const dish4 = await prisma.dish.create({
    data: {
      vendorId: vendor1.id,
      nameEn: 'Mee Goreng Mamak',
      nameMs: 'Mee Goreng Mamak',
      descriptionEn: 'Spicy fried yellow noodles with vegetables, tofu, and potatoes',
      descriptionMs: 'Mi kuning goreng pedas dengan sayuran, tauhu, dan kentang',
      category: 'main',
      cuisineType: 'mamak',
      price: 7.00,
      imageUrl: 'https://i.pinimg.com/736x/12/45/ef/1245ef1f6b6df2b3c1b99405e039e6b7.jpg',
      preparationTime: 12,
      servingSize: '1 plate',
      calories: 520,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Wheat'], contains: 'YES', notes: 'Made with wheat noodles' },
          { allergenId: allergenMap['Gluten'], contains: 'YES', notes: 'Contains gluten from noodles' },
          { allergenId: allergenMap['Soy'], contains: 'YES', notes: 'Contains soy sauce and tofu' },
          { allergenId: allergenMap['Eggs'], contains: 'YES', notes: 'Contains egg in noodles' },
        ]
      }
    }
  })
  dishes.push(dish4)

  // Dishes for Vendor 2: Golden Dragon Dim Sum
  const dish5 = await prisma.dish.create({
    data: {
      vendorId: vendor2.id,
      nameEn: 'Har Gow (Shrimp Dumplings)',
      nameMs: 'Har Gow (Dumpling Udang)',
      descriptionEn: 'Delicate steamed shrimp dumplings wrapped in translucent rice flour wrapper',
      descriptionMs: 'Dumpling udang kukus halus dibalut dengan kulit tepung beras lut sinar',
      category: 'appetizer',
      cuisineType: 'chinese',
      price: 6.80,
      imageUrl: 'https://i.pinimg.com/736x/12/45/ef/1245ef1f6b6df2b3c1b99405e039e6b7.jpg',
      preparationTime: 10,
      servingSize: '4 pieces',
      calories: 180,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: false,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Shellfish'], contains: 'YES', notes: 'Main ingredient is shrimp' },
          { allergenId: allergenMap['Soy'], contains: 'MAY_CONTAIN', notes: 'May contain traces from sauce' },
        ]
      }
    }
  })
  dishes.push(dish5)

  const dish6 = await prisma.dish.create({
    data: {
      vendorId: vendor2.id,
      nameEn: 'Char Siu Bao (BBQ Pork Buns)',
      nameMs: 'Char Siu Bao (Pau Babi Panggang)',
      descriptionEn: 'Fluffy steamed buns filled with sweet BBQ pork',
      descriptionMs: 'Pau gebu kukus berisi daging babi panggang manis',
      category: 'main',
      cuisineType: 'chinese',
      price: 5.50,
      imageUrl: 'https://i.pinimg.com/736x/52/95/68/52956865e536067f7bf9574ccd6bfc8d.jpg',
      preparationTime: 12,
      servingSize: '3 pieces',
      calories: 320,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: false,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Wheat'], contains: 'YES', notes: 'Wheat flour in bun dough' },
          { allergenId: allergenMap['Gluten'], contains: 'YES', notes: 'Contains gluten' },
          { allergenId: allergenMap['Soy'], contains: 'YES', notes: 'Soy sauce in BBQ marinade' },
        ]
      }
    }
  })
  dishes.push(dish6)

  const dish7 = await prisma.dish.create({
    data: {
      vendorId: vendor2.id,
      nameEn: 'Fried Carrot Cake',
      nameMs: 'Kuih Lobak Goreng',
      descriptionEn: 'Pan-fried radish cake with eggs, garlic, and dark soy sauce',
      descriptionMs: 'Kuih lobak goreng dengan telur, bawang putih, dan kicap pekat',
      category: 'main',
      cuisineType: 'chinese',
      price: 6.00,
      imageUrl: 'https://i.pinimg.com/736x/aa/30/55/aa305509e2811bfdb1c69f5a77d64bd4.jpg',
      preparationTime: 10,
      servingSize: '1 plate',
      calories: 280,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: false,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Eggs'], contains: 'YES', notes: 'Contains eggs' },
          { allergenId: allergenMap['Soy'], contains: 'YES', notes: 'Dark soy sauce' },
          { allergenId: allergenMap['Wheat'], contains: 'MAY_CONTAIN', notes: 'May contain wheat flour' },
        ]
      }
    }
  })
  dishes.push(dish7)

  const dish8 = await prisma.dish.create({
    data: {
      vendorId: vendor2.id,
      nameEn: 'Vegetable Spring Rolls',
      nameMs: 'Popia Sayur',
      descriptionEn: 'Crispy fried spring rolls filled with vegetables',
      descriptionMs: 'Popia goreng rangup berisi sayuran',
      category: 'appetizer',
      cuisineType: 'chinese',
      price: 5.00,
      imageUrl: 'https://i.pinimg.com/1200x/51/27/86/512786517a519ba80cc85756e0694508.jpg',
      preparationTime: 8,
      servingSize: '5 pieces',
      calories: 220,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Wheat'], contains: 'YES', notes: 'Wheat flour wrapper' },
          { allergenId: allergenMap['Gluten'], contains: 'YES', notes: 'Contains gluten' },
          { allergenId: allergenMap['Soy'], contains: 'MAY_CONTAIN', notes: 'May contain soy sauce' },
        ]
      }
    }
  })
  dishes.push(dish8)

  // Dishes for Vendor 3: Tandoori Nights
  const dish9 = await prisma.dish.create({
    data: {
      vendorId: vendor3.id,
      nameEn: 'Chicken Biryani',
      nameMs: 'Nasi Briyani Ayam',
      descriptionEn: 'Aromatic basmati rice cooked with spiced chicken and herbs',
      descriptionMs: 'Nasi basmati wangi dimasak dengan ayam berempah dan herba',
      category: 'main',
      cuisineType: 'indian',
      price: 14.00,
      imageUrl: 'https://i.pinimg.com/736x/cb/85/b7/cb85b7d595a1ca821322cc25c8b0adc2.jpg',
      preparationTime: 25,
      servingSize: '1 plate',
      calories: 680,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Contains yogurt and ghee' },
          { allergenId: allergenMap['Tree Nuts'], contains: 'MAY_CONTAIN', notes: 'May contain cashews' },
        ]
      }
    }
  })
  dishes.push(dish9)

  const dish10 = await prisma.dish.create({
    data: {
      vendorId: vendor3.id,
      nameEn: 'Butter Chicken',
      nameMs: 'Ayam Mentega',
      descriptionEn: 'Tender chicken in creamy tomato butter sauce',
      descriptionMs: 'Ayam lembut dalam sos mentega tomato berkrim',
      category: 'main',
      cuisineType: 'indian',
      price: 15.00,
      imageUrl: 'https://i.pinimg.com/1200x/b3/9d/e6/b39de6efe729d803e1778f729dcb510d.jpg',
      preparationTime: 20,
      servingSize: '1 plate',
      calories: 620,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Contains butter, cream, and yogurt' },
          { allergenId: allergenMap['Tree Nuts'], contains: 'MAY_CONTAIN', notes: 'May contain cashew paste' },
        ]
      }
    }
  })
  dishes.push(dish10)

  const dish11 = await prisma.dish.create({
    data: {
      vendorId: vendor3.id,
      nameEn: 'Palak Paneer',
      nameMs: 'Palak Paneer',
      descriptionEn: 'Spinach curry with cottage cheese cubes',
      descriptionMs: 'Kari bayam dengan keju kotej',
      category: 'main',
      cuisineType: 'indian',
      price: 13.00,
      imageUrl: 'https://i.pinimg.com/1200x/dc/e4/3a/dce43a188393f21d8c961b4b790e0033.jpg',
      preparationTime: 18,
      servingSize: '1 plate',
      calories: 380,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Paneer is made from milk' },
        ]
      }
    }
  })
  dishes.push(dish11)

  const dish12 = await prisma.dish.create({
    data: {
      vendorId: vendor3.id,
      nameEn: 'Garlic Naan',
      nameMs: 'Naan Bawang Putih',
      descriptionEn: 'Soft flatbread topped with garlic and butter',
      descriptionMs: 'Roti pipih lembut dengan bawang putih dan mentega',
      category: 'side',
      cuisineType: 'indian',
      price: 4.00,
      imageUrl: 'https://i.pinimg.com/1200x/fc/f1/de/fcf1dea14c28bd53e91f89f6860aced7.jpg',
      preparationTime: 8,
      servingSize: '1 piece',
      calories: 260,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Wheat'], contains: 'YES', notes: 'Wheat flour' },
          { allergenId: allergenMap['Gluten'], contains: 'YES', notes: 'Contains gluten' },
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Contains butter and yogurt' },
        ]
      }
    }
  })
  dishes.push(dish12)

  const dish13 = await prisma.dish.create({
    data: {
      vendorId: vendor3.id,
      nameEn: 'Mango Lassi',
      nameMs: 'Lassi Mangga',
      descriptionEn: 'Refreshing yogurt-based mango drink',
      descriptionMs: 'Minuman yogurt mangga yang menyegarkan',
      category: 'beverage',
      cuisineType: 'indian',
      price: 5.50,
      imageUrl: 'https://i.pinimg.com/1200x/0e/3b/44/0e3b44d67342d6b910ee49bd8ac1805b.jpg',
      preparationTime: 5,
      servingSize: '1 glass',
      calories: 180,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Yogurt-based drink' },
        ]
      }
    }
  })
  dishes.push(dish13)

  // Dishes for Vendor 4: The Cozy Cafe
  const dish14 = await prisma.dish.create({
    data: {
      vendorId: vendor4.id,
      nameEn: 'Classic Beef Burger',
      nameMs: 'Burger Daging Klasik',
      descriptionEn: 'Juicy beef patty with lettuce, tomato, cheese, and special sauce',
      descriptionMs: 'Patty daging berair dengan salad, tomato, keju, dan sos istimewa',
      category: 'main',
      cuisineType: 'western',
      price: 18.00,
      imageUrl: 'https://i.pinimg.com/1200x/45/e7/ff/45e7ff9eddf597996d4354b7c2fc53e6.jpg',
      preparationTime: 15,
      servingSize: '1 burger',
      calories: 720,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: false,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Wheat'], contains: 'YES', notes: 'Burger bun' },
          { allergenId: allergenMap['Gluten'], contains: 'YES', notes: 'Contains gluten' },
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Cheese' },
          { allergenId: allergenMap['Eggs'], contains: 'YES', notes: 'Special sauce contains eggs' },
          { allergenId: allergenMap['Soy'], contains: 'MAY_CONTAIN', notes: 'May contain soy lecithin' },
        ]
      }
    }
  })
  dishes.push(dish14)

  const dish15 = await prisma.dish.create({
    data: {
      vendorId: vendor4.id,
      nameEn: 'Caesar Salad',
      nameMs: 'Salad Caesar',
      descriptionEn: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
      descriptionMs: 'Salad romaine segar dengan sos Caesar, crouton, dan keju parmesan',
      category: 'appetizer',
      cuisineType: 'western',
      price: 12.00,
      imageUrl: 'https://i.pinimg.com/1200x/43/9e/88/439e88ac8cf554c495b337a372d99f94.jpg',
      preparationTime: 10,
      servingSize: '1 bowl',
      calories: 320,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isHalal: false,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Parmesan cheese' },
          { allergenId: allergenMap['Eggs'], contains: 'YES', notes: 'Caesar dressing contains eggs' },
          { allergenId: allergenMap['Fish'], contains: 'YES', notes: 'Anchovies in dressing' },
          { allergenId: allergenMap['Wheat'], contains: 'YES', notes: 'Croutons' },
          { allergenId: allergenMap['Gluten'], contains: 'YES', notes: 'Contains gluten' },
        ]
      }
    }
  })
  dishes.push(dish15)

  const dish16 = await prisma.dish.create({
    data: {
      vendorId: vendor4.id,
      nameEn: 'Chocolate Lava Cake',
      nameMs: 'Kek Coklat Lava',
      descriptionEn: 'Warm chocolate cake with molten chocolate center, served with vanilla ice cream',
      descriptionMs: 'Kek coklat hangat dengan inti coklat cair, disajikan dengan ais krim vanila',
      category: 'dessert',
      cuisineType: 'western',
      price: 9.50,
      imageUrl: 'https://i.pinimg.com/736x/81/98/73/819873298e099a845e042ded5a19ca95.jpg',
      preparationTime: 12,
      servingSize: '1 piece',
      calories: 480,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Wheat'], contains: 'YES', notes: 'Wheat flour in cake' },
          { allergenId: allergenMap['Gluten'], contains: 'YES', notes: 'Contains gluten' },
          { allergenId: allergenMap['Eggs'], contains: 'YES', notes: 'Eggs in cake batter' },
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Butter, milk, and ice cream' },
          { allergenId: allergenMap['Soy'], contains: 'MAY_CONTAIN', notes: 'May contain soy lecithin from chocolate' },
        ]
      }
    }
  })
  dishes.push(dish16)

  const dish17 = await prisma.dish.create({
    data: {
      vendorId: vendor4.id,
      nameEn: 'Cappuccino',
      nameMs: 'Cappuccino',
      descriptionEn: 'Espresso with steamed milk and foam',
      descriptionMs: 'Espresso dengan susu kukus dan buih',
      category: 'beverage',
      cuisineType: 'western',
      price: 7.00,
      imageUrl: 'https://i.pinimg.com/736x/52/41/31/52413159c7f291bbc186422481b3ac50.jpg',
      preparationTime: 5,
      servingSize: '1 cup',
      calories: 120,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Contains steamed milk' },
        ]
      }
    }
  })
  dishes.push(dish17)

  // Dishes for Vendor 5: Sakura Sushi House
  const dish18 = await prisma.dish.create({
    data: {
      vendorId: vendor5.id,
      nameEn: 'Salmon Sushi Set',
      nameMs: 'Set Sushi Salmon',
      descriptionEn: 'Assorted salmon sushi including nigiri and maki rolls',
      descriptionMs: 'Pelbagai sushi salmon termasuk nigiri dan maki roll',
      category: 'main',
      cuisineType: 'japanese',
      price: 22.00,
      imageUrl: 'https://i.pinimg.com/736x/f6/28/81/f62881ee59be1712c32d231e17000aec.jpg',
      preparationTime: 15,
      servingSize: '8 pieces',
      calories: 380,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: false,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Fish'], contains: 'YES', notes: 'Contains salmon' },
          { allergenId: allergenMap['Soy'], contains: 'YES', notes: 'Soy sauce for dipping' },
          { allergenId: allergenMap['Sesame'], contains: 'MAY_CONTAIN', notes: 'May contain sesame seeds' },
        ]
      }
    }
  })
  dishes.push(dish18)

  const dish19 = await prisma.dish.create({
    data: {
      vendorId: vendor5.id,
      nameEn: 'Tempura Udon',
      nameMs: 'Udon Tempura',
      descriptionEn: 'Thick wheat noodles in hot broth with crispy tempura',
      descriptionMs: 'Mi gandum tebal dalam sup panas dengan tempura rangup',
      category: 'main',
      cuisineType: 'japanese',
      price: 16.00,
      imageUrl: 'https://i.pinimg.com/736x/b9/bd/e5/b9bde5fcdac4b9c0373ebe04e16c44ab.jpg',
      preparationTime: 18,
      servingSize: '1 bowl',
      calories: 520,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: false,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Wheat'], contains: 'YES', notes: 'Udon noodles and tempura batter' },
          { allergenId: allergenMap['Gluten'], contains: 'YES', notes: 'Contains gluten' },
          { allergenId: allergenMap['Shellfish'], contains: 'YES', notes: 'Shrimp tempura' },
          { allergenId: allergenMap['Soy'], contains: 'YES', notes: 'Soy sauce in broth' },
          { allergenId: allergenMap['Fish'], contains: 'YES', notes: 'Fish-based broth' },
        ]
      }
    }
  })
  dishes.push(dish19)

  const dish20 = await prisma.dish.create({
    data: {
      vendorId: vendor5.id,
      nameEn: 'Chicken Teriyaki',
      nameMs: 'Ayam Teriyaki',
      descriptionEn: 'Grilled chicken with sweet teriyaki sauce, served with rice',
      descriptionMs: 'Ayam panggang dengan sos teriyaki manis, disajikan dengan nasi',
      category: 'main',
      cuisineType: 'japanese',
      price: 14.00,
      imageUrl: 'https://i.pinimg.com/1200x/5b/5d/25/5b5d25aeefe8333b7d6858e7482dbe2e.jpg',
      preparationTime: 15,
      servingSize: '1 plate',
      calories: 480,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: false,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Soy'], contains: 'YES', notes: 'Teriyaki sauce contains soy sauce' },
          { allergenId: allergenMap['Wheat'], contains: 'YES', notes: 'Wheat in teriyaki sauce' },
          { allergenId: allergenMap['Gluten'], contains: 'YES', notes: 'Contains gluten' },
          { allergenId: allergenMap['Sesame'], contains: 'MAY_CONTAIN', notes: 'May contain sesame oil' },
        ]
      }
    }
  })
  dishes.push(dish20)

  const dish21 = await prisma.dish.create({
    data: {
      vendorId: vendor5.id,
      nameEn: 'Miso Soup',
      nameMs: 'Sup Miso',
      descriptionEn: 'Traditional Japanese soup with tofu, seaweed, and miso paste',
      descriptionMs: 'Sup Jepun tradisional dengan tauhu, rumpai laut, dan pes miso',
      category: 'appetizer',
      cuisineType: 'japanese',
      price: 4.50,
      imageUrl: 'https://i.pinimg.com/1200x/5b/5d/25/5b5d25aeefe8333b7d6858e7482dbe2e.jpg',
      preparationTime: 5,
      servingSize: '1 bowl',
      calories: 80,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: true,
      isVegan: true,
      isHalal: false,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Soy'], contains: 'YES', notes: 'Miso paste is made from soybeans' },
          { allergenId: allergenMap['Fish'], contains: 'MAY_CONTAIN', notes: 'Dashi stock may contain fish' },
        ]
      }
    }
  })
  dishes.push(dish21)

  const dish22 = await prisma.dish.create({
    data: {
      vendorId: vendor5.id,
      nameEn: 'Green Tea Ice Cream',
      nameMs: 'Ais Krim Teh Hijau',
      descriptionEn: 'Creamy Japanese green tea flavored ice cream',
      descriptionMs: 'Ais krim berperisa teh hijau Jepun yang berkrim',
      category: 'dessert',
      cuisineType: 'japanese',
      price: 6.00,
      imageUrl: 'https://i.pinimg.com/1200x/eb/df/41/ebdf41e34e19a4577b66f2950c7a5d62.jpg',
      preparationTime: 2,
      servingSize: '2 scoops',
      calories: 180,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Cream and milk' },
          { allergenId: allergenMap['Eggs'], contains: 'MAY_CONTAIN', notes: 'May contain egg yolks' },
        ]
      }
    }
  })
  dishes.push(dish22)

  // Additional popular Malaysian dishes
  const dish23 = await prisma.dish.create({
    data: {
      vendorId: vendor1.id,
      nameEn: 'Satay Chicken',
      nameMs: 'Satay Ayam',
      descriptionEn: 'Grilled chicken skewers with peanut sauce, cucumber, and onions',
      descriptionMs: 'Ayam bakar pada lidi dengan kuah kacang, timun, dan bawang',
      category: 'appetizer',
      cuisineType: 'malay',
      price: 10.00,
      imageUrl: 'https://i.pinimg.com/1200x/1e/b5/9e/1eb59edef4ea9ba29846f04982287f2e.jpg',
      preparationTime: 20,
      servingSize: '10 sticks',
      calories: 380,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Peanuts'], contains: 'YES', notes: 'Peanut sauce' },
          { allergenId: allergenMap['Soy'], contains: 'YES', notes: 'Soy sauce in marinade' },
        ]
      }
    }
  })
  dishes.push(dish23)

  const dish24 = await prisma.dish.create({
    data: {
      vendorId: vendor1.id,
      nameEn: 'Laksa Penang',
      nameMs: 'Laksa Penang',
      descriptionEn: 'Spicy and sour fish-based noodle soup with mackerel, vegetables, and herbs',
      descriptionMs: 'Sup mi berasaskan ikan pedas masam dengan ikan kembung, sayuran, dan herba',
      category: 'main',
      cuisineType: 'malay',
      price: 9.00,
      imageUrl: 'https://i.pinimg.com/1200x/56/9a/b4/569ab4cb75b1966c24d64a5d89366416.jpg',
      preparationTime: 15,
      servingSize: '1 bowl',
      calories: 450,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Fish'], contains: 'YES', notes: 'Fish-based broth and mackerel' },
          { allergenId: allergenMap['Belacan'], contains: 'YES', notes: 'Contains belacan in paste' },
          { allergenId: allergenMap['Shellfish'], contains: 'MAY_CONTAIN', notes: 'May contain shrimp paste' },
        ]
      }
    }
  })
  dishes.push(dish24)

  const dish25 = await prisma.dish.create({
    data: {
      vendorId: vendor1.id,
      nameEn: 'Roti Canai',
      nameMs: 'Roti Canai',
      descriptionEn: 'Flaky flatbread served with curry dipping sauce',
      descriptionMs: 'Roti pipih lembut disajikan dengan kuah kari',
      category: 'main',
      cuisineType: 'mamak',
      price: 3.50,
      imageUrl: 'https://i.pinimg.com/736x/6a/fa/b9/6afab9d1aecc058f23a6ac4d91d9de7c.jpg',
      preparationTime: 10,
      servingSize: '2 pieces',
      calories: 320,
      status: 'APPROVED',
      allergenInfoComplete: true,
      isAvailable: true,
      isVegetarian: true,
      isVegan: false,
      isHalal: true,
      approvedBy: admin.id,
      approvedAt: new Date(),
      allergenMappings: {
        create: [
          { allergenId: allergenMap['Wheat'], contains: 'YES', notes: 'Wheat flour' },
          { allergenId: allergenMap['Gluten'], contains: 'YES', notes: 'Contains gluten' },
          { allergenId: allergenMap['Milk'], contains: 'YES', notes: 'Contains ghee/butter' },
          { allergenId: allergenMap['Eggs'], contains: 'MAY_CONTAIN', notes: 'Some versions contain eggs' },
        ]
      }
    }
  })
  dishes.push(dish25)

  console.log(`✓ ${dishes.length} dishes created and approved`)

  // ============================================
  // STEP 6: Create Favorites
  // ============================================
  console.log('\nCreating favorite dishes and vendors...')

  // Sarah's favorites (consumer1)
  await prisma.favoriteDish.upsert({
    where: { userId_dishId: { userId: consumer1.id, dishId: dish2.id } }, // Beef Rendang
    update: {},
    create: { userId: consumer1.id, dishId: dish2.id }
  })
  await prisma.favoriteDish.upsert({
    where: { userId_dishId: { userId: consumer1.id, dishId: dish9.id } }, // Chicken Biryani
    update: {},
    create: { userId: consumer1.id, dishId: dish9.id }
  })
  await prisma.favoriteDish.upsert({
    where: { userId_dishId: { userId: consumer1.id, dishId: dish10.id } }, // Butter Chicken
    update: {},
    create: { userId: consumer1.id, dishId: dish10.id }
  })
  await prisma.favoriteDish.upsert({
    where: { userId_dishId: { userId: consumer1.id, dishId: dish16.id } }, // Chocolate Lava Cake
    update: {},
    create: { userId: consumer1.id, dishId: dish16.id }
  })

  await prisma.favoriteVendor.upsert({
    where: { userId_vendorId: { userId: consumer1.id, vendorId: vendor1.id } },
    update: {},
    create: { userId: consumer1.id, vendorId: vendor1.id }
  })
  await prisma.favoriteVendor.upsert({
    where: { userId_vendorId: { userId: consumer1.id, vendorId: vendor3.id } },
    update: {},
    create: { userId: consumer1.id, vendorId: vendor3.id }
  })

  // John's favorites (consumer2)
  await prisma.favoriteDish.upsert({
    where: { userId_dishId: { userId: consumer2.id, dishId: dish18.id } }, // Salmon Sushi
    update: {},
    create: { userId: consumer2.id, dishId: dish18.id }
  })
  await prisma.favoriteDish.upsert({
    where: { userId_dishId: { userId: consumer2.id, dishId: dish20.id } }, // Chicken Teriyaki
    update: {},
    create: { userId: consumer2.id, dishId: dish20.id }
  })
  await prisma.favoriteDish.upsert({
    where: { userId_dishId: { userId: consumer2.id, dishId: dish14.id } }, // Classic Burger
    update: {},
    create: { userId: consumer2.id, dishId: dish14.id }
  })

  await prisma.favoriteVendor.upsert({
    where: { userId_vendorId: { userId: consumer2.id, vendorId: vendor5.id } },
    update: {},
    create: { userId: consumer2.id, vendorId: vendor5.id }
  })

  // Mei's favorites (consumer3)
  await prisma.favoriteDish.upsert({
    where: { userId_dishId: { userId: consumer3.id, dishId: dish2.id } }, // Beef Rendang (gluten-free)
    update: {},
    create: { userId: consumer3.id, dishId: dish2.id }
  })
  await prisma.favoriteDish.upsert({
    where: { userId_dishId: { userId: consumer3.id, dishId: dish11.id } }, // Palak Paneer
    update: {},
    create: { userId: consumer3.id, dishId: dish11.id }
  })
  await prisma.favoriteDish.upsert({
    where: { userId_dishId: { userId: consumer3.id, dishId: dish18.id } }, // Salmon Sushi (rice-based)
    update: {},
    create: { userId: consumer3.id, dishId: dish18.id }
  })

  await prisma.favoriteVendor.upsert({
    where: { userId_vendorId: { userId: consumer3.id, vendorId: vendor1.id } },
    update: {},
    create: { userId: consumer3.id, vendorId: vendor1.id }
  })
  await prisma.favoriteVendor.upsert({
    where: { userId_vendorId: { userId: consumer3.id, vendorId: vendor4.id } },
    update: {},
    create: { userId: consumer3.id, vendorId: vendor4.id }
  })

  console.log('✓ Favorite dishes and vendors created')

  // ============================================
  // STEP 7: Summary
  // ============================================
  console.log('\n✅ Seeding completed successfully!\n')
  console.log('📊 Database Summary:')
  console.log('┌─────────────────────────────────────────────────')
  console.log('│ 👥 Users:     1 Admin + 5 Vendors + 3 Consumers')
  console.log('│ 🏪 Vendors:   6 (5 approved, 1 pending)')
  console.log('│ 🍽️  Dishes:    ' + dishes.length + ' approved dishes')
  console.log('│ 🚨 Allergens: 14 (10 major, 4 regional)')
  console.log('│ ⭐ Favorites: Multiple dishes and vendors')
  console.log('└─────────────────────────────────────────────────\n')

  console.log('📝 Demo accounts created:')
  console.log('┌─────────────────────────────────────────────────')
  console.log('│ Admin:          admin@allergy.my')
  console.log('│ ')
  console.log('│ Vendors:')
  console.log('│   - ali@nasilemak.my    (Nasi Lemak Corner)')
  console.log('│   - wong@dimsum.my      (Golden Dragon Dim Sum)')
  console.log('│   - kumar@tandoori.my   (Tandoori Nights)')
  console.log('│   - emma@cafe.my        (The Cozy Cafe)')
  console.log('│   - yuki@sushi.my       (Sakura Sushi House)')
  console.log('│   - pending@vendor.my   (Pending Approval)')
  console.log('│ ')
  console.log('│ Consumers:')
  console.log('│   - sarah@demo.my       (Allergic: Peanuts, Shellfish)')
  console.log('│   - john@demo.my        (Allergic: Milk, Eggs)')
  console.log('│   - mei@demo.my         (Allergic: Gluten)')
  console.log('└─────────────────────────────────────────────────\n')

  console.log('💡 Tip: All accounts use the password format: [role]123')
  console.log('   Examples: admin123, vendor123, consumer123\n')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
