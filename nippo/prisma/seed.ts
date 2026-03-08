import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // パスワードハッシュ（実際はbcryptなどでハッシュ化が必要）
  const passwordHash = 'hashed_password_123'; // TODO: 実際のハッシュ化を実装

  // 営業マスタのシード
  console.log('Creating sales users...');
  const supervisor = await prisma.sales.upsert({
    where: { email: 'yamada@example.com' },
    update: {},
    create: {
      name: '山田太郎',
      email: 'yamada@example.com',
      passwordHash,
      isSupervisor: true,
      supervisorId: null,
      department: '営業部',
      status: 'active',
    },
  });

  const sales1 = await prisma.sales.upsert({
    where: { email: 'sato@example.com' },
    update: {},
    create: {
      name: '佐藤花子',
      email: 'sato@example.com',
      passwordHash,
      isSupervisor: false,
      supervisorId: supervisor.id,
      department: '営業部',
      status: 'active',
    },
  });

  const sales2 = await prisma.sales.upsert({
    where: { email: 'suzuki@example.com' },
    update: {},
    create: {
      name: '鈴木一郎',
      email: 'suzuki@example.com',
      passwordHash,
      isSupervisor: false,
      supervisorId: supervisor.id,
      department: '営業部',
      status: 'active',
    },
  });

  // 顧客マスタのシード
  console.log('Creating customers...');
  const customer1 = await prisma.customer.upsert({
    where: { id: 1 },
    update: {},
    create: {
      customerName: '株式会社ABC',
      address: '東京都千代田区〇〇1-2-3',
      phone: '03-1234-5678',
      assignedSalesId: sales1.id,
      industry: '製造業',
      status: 'active',
    },
  });

  const customer2 = await prisma.customer.upsert({
    where: { id: 2 },
    update: {},
    create: {
      customerName: '有限会社XYZ',
      address: '東京都港区〇〇4-5-6',
      phone: '03-8765-4321',
      assignedSalesId: sales2.id,
      industry: 'サービス業',
      status: 'active',
    },
  });

  // サンプル日報のシード
  console.log('Creating sample daily reports...');
  const report = await prisma.dailyReport.create({
    data: {
      salesId: sales1.id,
      reportDate: new Date('2026-02-21'),
      status: 'submitted',
      problem: '新規顧客の開拓方法について',
      plan: 'ABC社との契約条件の詰め\nXYZ社への契約書持参',
      submittedAt: new Date('2026-02-21T18:30:00+09:00'),
      visitRecords: {
        create: [
          {
            customerId: customer1.id,
            visitContent: '新商品の提案を実施。好感触を得た。',
            visitTime: '14:00',
            displayOrder: 1,
          },
          {
            customerId: customer2.id,
            visitContent: '既存契約の更新について打ち合わせ。',
            visitTime: '16:30',
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // 上長コメントのシード
  console.log('Creating supervisor comments...');
  await prisma.supervisorComment.createMany({
    data: [
      {
        reportId: report.id,
        supervisorId: supervisor.id,
        commentType: 'problem',
        commentText: '新規開拓は既存顧客からの紹介も有効です',
      },
      {
        reportId: report.id,
        supervisorId: supervisor.id,
        commentType: 'plan',
        commentText: '契約条件は事前に法務と相談してください',
      },
    ],
  });

  console.log('✅ Seeding completed!');
  console.log(`Created:
  - 3 sales users (1 supervisor, 2 sales)
  - 2 customers
  - 1 daily report with 2 visit records
  - 2 supervisor comments`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
