import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

// 本番環境での実行を禁止する（二重ガード）
if (process.env.NODE_ENV === 'production') {
  console.error('❌ seed スクリプトは本番環境では実行できません');
  process.exit(1);
}
const dbUrl = process.env.DATABASE_URL ?? '';
if (/prod(uction)?/i.test(dbUrl)) {
  console.error('❌ 本番データベースへのシード実行は禁止されています (DATABASE_URL)');
  process.exit(1);
}

const prisma = new PrismaClient();

// -----------------------------------------------------------------------
// 開発用パスワードハッシュ
// 全ユーザーの開発パスワード: "password123"
// NOTE: Issue #9 (bcrypt実装) 完了後、bcrypt.hashSync() に置き換えること
// -----------------------------------------------------------------------
// ⚠️ セキュリティ注意: SHA-256 はパスワードハッシュとして不適切です（ブルートフォース耐性なし）
// Issue #9 (bcrypt実装) 完了後、bcrypt.hashSync('password123', 12) に必ず置き換えること
const DEV_PASSWORD_HASH = crypto
  .createHash('sha256')
  .update('password123:dev-salt')
  .digest('hex');

// 過去 N 日の営業日（土日を除く）を取得するユーティリティ
function pastWorkingDay(daysAgo: number): Date {
  const date = new Date('2026-02-23');
  let counted = 0;
  while (counted < daysAgo) {
    date.setDate(date.getDate() - 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) counted++;
  }
  return date;
}

async function main() {
  console.log('🌱 Seeding database...');

  // -----------------------------------------------------------------------
  // 既存データを削除（依存順に逆順で）
  // -----------------------------------------------------------------------
  console.log('🗑️  Clearing existing data...');
  await prisma.supervisorComment.deleteMany();
  await prisma.visitRecord.deleteMany();
  await prisma.dailyReport.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.sales.deleteMany();

  // -----------------------------------------------------------------------
  // 営業マスタ (10名: 部長1・課長2・営業7)
  // -----------------------------------------------------------------------
  console.log('👤 Creating sales users...');

  // 部長
  const director = await prisma.sales.create({
    data: {
      name: '田中 部長',
      email: 'tanaka@nippo.example.com',
      passwordHash: DEV_PASSWORD_HASH,
      isSupervisor: true,
      supervisorId: null,
      department: '営業本部',
      status: 'active',
    },
  });

  // 課長 (チーム1・チーム2)
  const manager1 = await prisma.sales.create({
    data: {
      name: '山田 一課長',
      email: 'yamada@nippo.example.com',
      passwordHash: DEV_PASSWORD_HASH,
      isSupervisor: true,
      supervisorId: director.id,
      department: '営業1部',
      status: 'active',
    },
  });

  const manager2 = await prisma.sales.create({
    data: {
      name: '佐々木 二課長',
      email: 'sasaki@nippo.example.com',
      passwordHash: DEV_PASSWORD_HASH,
      isSupervisor: true,
      supervisorId: director.id,
      department: '営業2部',
      status: 'active',
    },
  });

  // 営業担当者 (チーム1: 3名)
  const [sato, suzuki, takahashi] = await Promise.all([
    prisma.sales.create({
      data: {
        name: '佐藤 花子',
        email: 'sato@nippo.example.com',
        passwordHash: DEV_PASSWORD_HASH,
        isSupervisor: false,
        supervisorId: manager1.id,
        department: '営業1部',
        status: 'active',
      },
    }),
    prisma.sales.create({
      data: {
        name: '鈴木 一郎',
        email: 'suzuki@nippo.example.com',
        passwordHash: DEV_PASSWORD_HASH,
        isSupervisor: false,
        supervisorId: manager1.id,
        department: '営業1部',
        status: 'active',
      },
    }),
    prisma.sales.create({
      data: {
        name: '高橋 誠',
        email: 'takahashi@nippo.example.com',
        passwordHash: DEV_PASSWORD_HASH,
        isSupervisor: false,
        supervisorId: manager1.id,
        department: '営業1部',
        status: 'active',
      },
    }),
  ]);

  // 営業担当者 (チーム2: 4名)
  const [ito, watanabe, nakamura, kobayashi] = await Promise.all([
    prisma.sales.create({
      data: {
        name: '伊藤 美咲',
        email: 'ito@nippo.example.com',
        passwordHash: DEV_PASSWORD_HASH,
        isSupervisor: false,
        supervisorId: manager2.id,
        department: '営業2部',
        status: 'active',
      },
    }),
    prisma.sales.create({
      data: {
        name: '渡辺 健',
        email: 'watanabe@nippo.example.com',
        passwordHash: DEV_PASSWORD_HASH,
        isSupervisor: false,
        supervisorId: manager2.id,
        department: '営業2部',
        status: 'active',
      },
    }),
    prisma.sales.create({
      data: {
        name: '中村 遥',
        email: 'nakamura@nippo.example.com',
        passwordHash: DEV_PASSWORD_HASH,
        isSupervisor: false,
        supervisorId: manager2.id,
        department: '営業2部',
        status: 'active',
      },
    }),
    prisma.sales.create({
      data: {
        name: '小林 大輔',
        email: 'kobayashi@nippo.example.com',
        passwordHash: DEV_PASSWORD_HASH,
        isSupervisor: false,
        supervisorId: manager2.id,
        department: '営業2部',
        status: 'inactive', // 退職者サンプル
      },
    }),
  ]);

  console.log(`  ✓ ${10} sales users created`);

  // -----------------------------------------------------------------------
  // 顧客マスタ (20社)
  // -----------------------------------------------------------------------
  console.log('🏢 Creating customers...');

  const customersData = [
    // 佐藤担当 (3社)
    { customerName: 'トヨタ工業株式会社', address: '愛知県豊田市〇〇1-1', phone: '0565-11-1111', assignedSalesId: sato.id, industry: '製造業', status: 'active' },
    { customerName: '大阪機械工業株式会社', address: '大阪府大阪市〇〇2-2', phone: '06-1234-5678', assignedSalesId: sato.id, industry: '製造業', status: 'active' },
    { customerName: 'デジタルソリューションズ株式会社', address: '東京都渋谷区〇〇3-3', phone: '03-2222-3333', assignedSalesId: sato.id, industry: 'IT', status: 'active' },
    // 鈴木担当 (3社)
    { customerName: 'スマートテック株式会社', address: '東京都新宿区〇〇4-4', phone: '03-3333-4444', assignedSalesId: suzuki.id, industry: 'IT', status: 'active' },
    { customerName: '東京フィナンシャル株式会社', address: '東京都千代田区〇〇5-5', phone: '03-4444-5555', assignedSalesId: suzuki.id, industry: '金融業', status: 'active' },
    { customerName: 'コンサルティングX株式会社', address: '東京都港区〇〇6-6', phone: '03-5555-6666', assignedSalesId: suzuki.id, industry: 'サービス業', status: 'active' },
    // 高橋担当 (3社)
    { customerName: 'テクノロジーズジャパン株式会社', address: '神奈川県横浜市〇〇7-7', phone: '045-1111-2222', assignedSalesId: takahashi.id, industry: 'IT', status: 'active' },
    { customerName: '大阪証券株式会社', address: '大阪府大阪市〇〇8-8', phone: '06-2222-3333', assignedSalesId: takahashi.id, industry: '金融業', status: 'active' },
    { customerName: 'ビジネスサポート合同会社', address: '東京都品川区〇〇9-9', phone: '03-6666-7777', assignedSalesId: takahashi.id, industry: 'サービス業', status: 'potential' },
    // 伊藤担当 (3社)
    { customerName: 'サイバーシステム株式会社', address: '福岡県福岡市〇〇1-10', phone: '092-1111-2222', assignedSalesId: ito.id, industry: 'IT', status: 'active' },
    { customerName: 'ロジスティクス山田株式会社', address: '埼玉県さいたま市〇〇2-10', phone: '048-1111-2222', assignedSalesId: ito.id, industry: 'サービス業', status: 'active' },
    { customerName: 'フレッシュマーケット株式会社', address: '千葉県千葉市〇〇3-10', phone: '043-1111-2222', assignedSalesId: ito.id, industry: '小売業', status: 'active' },
    // 渡辺担当 (3社)
    { customerName: 'クラウドワークス株式会社', address: '東京都渋谷区〇〇4-10', phone: '03-7777-8888', assignedSalesId: watanabe.id, industry: 'IT', status: 'active' },
    { customerName: '東北製造株式会社', address: '宮城県仙台市〇〇5-10', phone: '022-1111-2222', assignedSalesId: watanabe.id, industry: '製造業', status: 'active' },
    { customerName: 'アパレルY株式会社', address: '東京都渋谷区〇〇6-10', phone: '03-8888-9999', assignedSalesId: watanabe.id, industry: '小売業', status: 'potential' },
    // 中村担当 (3社)
    { customerName: 'AIイノベーション株式会社', address: '東京都文京区〇〇7-10', phone: '03-9999-0000', assignedSalesId: nakamura.id, industry: 'IT', status: 'active' },
    { customerName: '九州テクノ株式会社', address: '熊本県熊本市〇〇8-10', phone: '096-1111-2222', assignedSalesId: nakamura.id, industry: '製造業', status: 'active' },
    { customerName: 'オンラインショップX株式会社', address: '東京都台東区〇〇9-10', phone: '03-0000-1111', assignedSalesId: nakamura.id, industry: '小売業', status: 'active' },
    // 小林担当 (2社, 退職者のためpotentialのみ)
    { customerName: 'ホームセンターZ株式会社', address: '北海道札幌市〇〇10-10', phone: '011-1111-2222', assignedSalesId: kobayashi.id, industry: '小売業', status: 'potential' },
    { customerName: '電器量販店株式会社', address: '東京都秋葉原〇〇11-10', phone: '03-1111-2222', assignedSalesId: kobayashi.id, industry: '小売業', status: 'potential' },
  ];

  const customers = await prisma.$transaction(
    customersData.map((c) => prisma.customer.create({ data: c }))
  );

  console.log(`  ✓ ${customers.length} customers created`);

  // 顧客を担当者別にグループ化
  const satoCustomers = customers.slice(0, 3);
  const suzukiCustomers = customers.slice(3, 6);
  const takahashiCustomers = customers.slice(6, 9);
  const itoCustomers = customers.slice(9, 12);
  const watanabeCustomers = customers.slice(12, 15);
  const nakamuraCustomers = customers.slice(15, 18);

  // -----------------------------------------------------------------------
  // 日報 (過去10営業日分 × 複数担当者)
  // ステータスのバリエーション: draft, submitted, approved, rejected
  // -----------------------------------------------------------------------
  console.log('📝 Creating daily reports...');

  // 佐藤の日報 (approved × 2, submitted × 1, draft × 1)
  const satoReport1 = await prisma.dailyReport.create({
    data: {
      salesId: sato.id,
      reportDate: pastWorkingDay(4),
      status: 'approved',
      problem: 'トヨタ工業との価格交渉が難航している。競合他社と比較して割高との指摘あり。',
      plan: '来週の再提案に向けて、コスト削減案を準備する。\n上長に値引き可能額の確認を取る。',
      submittedAt: new Date(pastWorkingDay(4).getTime() + 18 * 3600000),
      approvedAt: new Date(pastWorkingDay(3).getTime() + 10 * 3600000),
      approvedBy: manager1.id,
      visitRecords: {
        create: [
          { customerId: satoCustomers[0].id, visitContent: '価格交渉の打ち合わせ。競合他社との比較表を提示された。次回までに対応策を検討する。', visitTime: '10:00', displayOrder: 1 },
          { customerId: satoCustomers[1].id, visitContent: '新製品ラインの提案実施。技術部門の担当者にプレゼン。好評で継続検討となった。', visitTime: '14:00', displayOrder: 2 },
          { customerId: satoCustomers[2].id, visitContent: 'DX推進プロジェクトへの参画提案。IT部門責任者と面談。来月中に正式回答予定。', visitTime: '16:30', displayOrder: 3 },
        ],
      },
    },
  });

  const satoReport2 = await prisma.dailyReport.create({
    data: {
      salesId: sato.id,
      reportDate: pastWorkingDay(2),
      status: 'approved',
      problem: 'デジタルソリューションズの担当者が異動。引き継ぎが不十分で関係構築が必要。',
      plan: '新担当者との関係強化のため、来週ランチミーティングを設定する。',
      submittedAt: new Date(pastWorkingDay(2).getTime() + 18 * 3600000),
      approvedAt: new Date(pastWorkingDay(1).getTime() + 9 * 3600000),
      approvedBy: manager1.id,
      visitRecords: {
        create: [
          { customerId: satoCustomers[2].id, visitContent: '新担当者 田村氏と初対面。前任者からの引き継ぎ資料を確認。関係構築から再スタート。', visitTime: '11:00', displayOrder: 1 },
          { customerId: satoCustomers[0].id, visitContent: '価格見直し提案書を持参。担当者は前向きに検討すると回答。来週正式回答予定。', visitTime: '15:00', displayOrder: 2 },
        ],
      },
    },
  });

  const satoReport3 = await prisma.dailyReport.create({
    data: {
      salesId: sato.id,
      reportDate: pastWorkingDay(1),
      status: 'submitted',
      problem: 'トヨタ工業から競合A社の見積もりが出てきた。価格差10%の改善を求められた。',
      plan: '明日の社内会議で値引き承認を取り付ける。担当課長に事前に相談する。',
      submittedAt: new Date(pastWorkingDay(1).getTime() + 18 * 3600000),
      visitRecords: {
        create: [
          { customerId: satoCustomers[0].id, visitContent: '競合見積もりを提示された。価格差の詳細を確認。社内調整の時間を1週間もらった。', visitTime: '13:00', displayOrder: 1 },
        ],
      },
    },
  });

  const satoReport4 = await prisma.dailyReport.create({
    data: {
      salesId: sato.id,
      reportDate: pastWorkingDay(0),
      status: 'draft',
      problem: '',
      plan: '',
      visitRecords: {
        create: [
          { customerId: satoCustomers[1].id, visitContent: '月次定例ミーティング参加。来期の調達計画を確認。', visitTime: '10:30', displayOrder: 1 },
        ],
      },
    },
  });

  // 鈴木の日報 (approved × 1, rejected × 1, submitted × 1)
  const suzukiReport1 = await prisma.dailyReport.create({
    data: {
      salesId: suzuki.id,
      reportDate: pastWorkingDay(3),
      status: 'approved',
      problem: 'スマートテックの予算が削減され、提案規模の縮小を求められた。',
      plan: 'フェーズ分けの提案書を作成し、まず小規模から始める案を提示する。',
      submittedAt: new Date(pastWorkingDay(3).getTime() + 19 * 3600000),
      approvedAt: new Date(pastWorkingDay(2).getTime() + 10 * 3600000),
      approvedBy: manager1.id,
      visitRecords: {
        create: [
          { customerId: suzukiCustomers[0].id, visitContent: '予算制約の話を聞き、フェーズ分け提案を即時提案。前向きな反応あり。', visitTime: '10:00', displayOrder: 1 },
          { customerId: suzukiCustomers[1].id, visitContent: '年間契約更新の確認。特段の問題なく、来月更新予定。', visitTime: '14:30', displayOrder: 2 },
        ],
      },
    },
  });

  const suzukiReport2 = await prisma.dailyReport.create({
    data: {
      salesId: suzuki.id,
      reportDate: pastWorkingDay(1),
      status: 'rejected',
      problem: '記載が不十分。',
      plan: '明日再提出する。',
      submittedAt: new Date(pastWorkingDay(1).getTime() + 20 * 3600000),
      visitRecords: {
        create: [
          { customerId: suzukiCustomers[2].id, visitContent: '訪問', visitTime: '10:00', displayOrder: 1 },
        ],
      },
    },
  });

  const suzukiReport3 = await prisma.dailyReport.create({
    data: {
      salesId: suzuki.id,
      reportDate: pastWorkingDay(0),
      status: 'submitted',
      problem: 'コンサルティングXの競合状況が激化。差別化が必要。',
      plan: '弊社のサポート体制の強みを前面に出した資料を作成する。',
      submittedAt: new Date(pastWorkingDay(0).getTime() + 18 * 3600000),
      visitRecords: {
        create: [
          { customerId: suzukiCustomers[2].id, visitContent: '昨日の差し戻しを受け、訪問内容を詳細に記載。コンサルの担当者と自社サービスの差別化点について議論。', visitTime: '13:00', displayOrder: 1 },
          { customerId: suzukiCustomers[0].id, visitContent: 'フェーズ1の正式発注書を受領。来月から開始予定。', visitTime: '16:00', displayOrder: 2 },
        ],
      },
    },
  });

  // 高橋の日報 (submitted × 2)
  const takahashiReport1 = await prisma.dailyReport.create({
    data: {
      salesId: takahashi.id,
      reportDate: pastWorkingDay(2),
      status: 'submitted',
      problem: 'テクノロジーズジャパンへの新製品提案を準備中だが、技術仕様の理解が不十分。',
      plan: '社内の技術者に同行してもらい、技術的な質問に答えてもらう体制を整える。',
      submittedAt: new Date(pastWorkingDay(2).getTime() + 18 * 3600000),
      visitRecords: {
        create: [
          { customerId: takahashiCustomers[0].id, visitContent: '新製品の概要説明を実施。技術的な深掘り質問に苦慮した。次回は技術者同行を依頼する。', visitTime: '11:00', displayOrder: 1 },
          { customerId: takahashiCustomers[1].id, visitContent: '定期フォロー訪問。先月の課題だったレポート機能の改善提案書を持参。評価中とのこと。', visitTime: '15:00', displayOrder: 2 },
        ],
      },
    },
  });

  const takahashiReport2 = await prisma.dailyReport.create({
    data: {
      salesId: takahashi.id,
      reportDate: pastWorkingDay(0),
      status: 'submitted',
      problem: 'ビジネスサポートへのアプローチ方法の検討。まだ取引実績がないため、信頼醸成が課題。',
      plan: '事例集と導入実績レポートを作成して、次回訪問で提示する。',
      submittedAt: new Date(pastWorkingDay(0).getTime() + 17 * 3600000),
      visitRecords: {
        create: [
          { customerId: takahashiCustomers[2].id, visitContent: '新規開拓訪問（2回目）。担当者の関心が高まってきた。具体的な導入事例の提示を求められた。', visitTime: '10:00', displayOrder: 1 },
          { customerId: takahashiCustomers[0].id, visitContent: '技術者同行での再訪問。詳細な技術質問に回答でき、評価が高まった。来週正式見積もり依頼予定。', visitTime: '14:00', displayOrder: 2 },
        ],
      },
    },
  });

  // 伊藤の日報 (approved × 1, submitted × 1)
  const itoReport1 = await prisma.dailyReport.create({
    data: {
      salesId: ito.id,
      reportDate: pastWorkingDay(3),
      status: 'approved',
      problem: 'フレッシュマーケットの繁忙期に重なり、面談時間が確保しにくい状況。',
      plan: '繁忙期を避けて訪問スケジュールを組む。メール・電話でのフォローを強化。',
      submittedAt: new Date(pastWorkingDay(3).getTime() + 18 * 3600000),
      approvedAt: new Date(pastWorkingDay(2).getTime() + 9 * 3600000),
      approvedBy: manager2.id,
      visitRecords: {
        create: [
          { customerId: itoCustomers[2].id, visitContent: '短時間で面談。繁忙期の状況を確認。来月に詳細な打ち合わせをセット。', visitTime: '09:30', displayOrder: 1 },
          { customerId: itoCustomers[0].id, visitContent: '新システム導入の初回デモを実施。IT部門の反応は良好。', visitTime: '14:00', displayOrder: 2 },
          { customerId: itoCustomers[1].id, visitContent: '配送管理の効率化提案。現状のペイン・ポイントをヒアリング。', visitTime: '16:30', displayOrder: 3 },
        ],
      },
    },
  });

  const itoReport2 = await prisma.dailyReport.create({
    data: {
      salesId: ito.id,
      reportDate: pastWorkingDay(0),
      status: 'submitted',
      problem: 'ロジスティクス山田の意思決定者が社長のみで、アポイントが取りにくい。',
      plan: '紹介経路を通じた接触を試みる。既存の社長との関係が深い取引先を経由する。',
      submittedAt: new Date(pastWorkingDay(0).getTime() + 18 * 3600000),
      visitRecords: {
        create: [
          { customerId: itoCustomers[1].id, visitContent: '社長不在のため担当者と面談。内部での推薦を依頼した。', visitTime: '10:00', displayOrder: 1 },
          { customerId: itoCustomers[0].id, visitContent: 'デモ後のフォロー訪問。追加の機能確認を実施。IT部門が購買部に推薦する方向。', visitTime: '15:00', displayOrder: 2 },
        ],
      },
    },
  });

  // 渡辺の日報 (submitted × 2)
  const watanabeReport1 = await prisma.dailyReport.create({
    data: {
      salesId: watanabe.id,
      reportDate: pastWorkingDay(2),
      status: 'submitted',
      problem: '東北製造との遠距離商談が非効率。交通費・時間コストが課題。',
      plan: 'オンライン商談を提案し、月1回の訪問に集約する。',
      submittedAt: new Date(pastWorkingDay(2).getTime() + 18 * 3600000),
      visitRecords: {
        create: [
          { customerId: watanabeCustomers[1].id, visitContent: '仙台出張。工場見覧後に提案実施。地方特有の課題を把握。オンライン対応の提案をした。', visitTime: '10:00', displayOrder: 1 },
        ],
      },
    },
  });

  const watanabeReport2 = await prisma.dailyReport.create({
    data: {
      salesId: watanabe.id,
      reportDate: pastWorkingDay(0),
      status: 'submitted',
      problem: 'アパレルYが新ブランド立ち上げで多忙。担当窓口が定まらない。',
      plan: '組織図を入手し、意思決定ラインを把握する。',
      submittedAt: new Date(pastWorkingDay(0).getTime() + 19 * 3600000),
      visitRecords: {
        create: [
          { customerId: watanabeCustomers[0].id, visitContent: 'クラウドワークスの年間レビュー。満足度は高い。追加オプションの提案をした。', visitTime: '11:00', displayOrder: 1 },
          { customerId: watanabeCustomers[2].id, visitContent: '新ブランド担当と初面談。立ち上げ支援でのニーズを確認。月末に再訪問予定。', visitTime: '15:00', displayOrder: 2 },
        ],
      },
    },
  });

  // 中村の日報 (approved × 1)
  const nakamuraReport1 = await prisma.dailyReport.create({
    data: {
      salesId: nakamura.id,
      reportDate: pastWorkingDay(2),
      status: 'approved',
      problem: 'AIイノベーションとの契約条件の詰め。法務レビューに時間がかかっている。',
      plan: '自社法務と連携して回答期限を設ける。来週中に合意を目指す。',
      submittedAt: new Date(pastWorkingDay(2).getTime() + 18 * 3600000),
      approvedAt: new Date(pastWorkingDay(1).getTime() + 10 * 3600000),
      approvedBy: manager2.id,
      visitRecords: {
        create: [
          { customerId: nakamuraCustomers[0].id, visitContent: '契約条件について法務担当を交えた三者会議。修正点を確認し、来週再提出予定。', visitTime: '10:00', displayOrder: 1 },
          { customerId: nakamuraCustomers[2].id, visitContent: 'ECサイトの物流改善提案を実施。具体的なKPIの確認を求められた。', visitTime: '14:00', displayOrder: 2 },
        ],
      },
    },
  });

  const allReports = [
    satoReport1, satoReport2, satoReport3, satoReport4,
    suzukiReport1, suzukiReport2, suzukiReport3,
    takahashiReport1, takahashiReport2,
    itoReport1, itoReport2,
    watanabeReport1, watanabeReport2,
    nakamuraReport1,
  ];

  console.log(`  ✓ ${allReports.length} daily reports created`);

  // -----------------------------------------------------------------------
  // 上長コメント (承認・差し戻し済み日報に付与)
  // -----------------------------------------------------------------------
  console.log('💬 Creating supervisor comments...');

  await prisma.supervisorComment.createMany({
    data: [
      // 佐藤 report1 (approved by manager1)
      { reportId: satoReport1.id, supervisorId: manager1.id, commentType: 'problem', commentText: '価格交渉は戦略的に進めること。競合比較表を入手できたのは良い情報。次回提案前に私に見せてください。' },
      { reportId: satoReport1.id, supervisorId: manager1.id, commentType: 'plan', commentText: '値引き額については来週月曜の朝会で相談しましょう。上限の目線を共有します。' },
      { reportId: satoReport1.id, supervisorId: manager1.id, commentType: 'general', commentText: '3社を効率よく回れています。継続してください。' },
      // 佐藤 report2 (approved by manager1)
      { reportId: satoReport2.id, supervisorId: manager1.id, commentType: 'problem', commentText: 'キーマン変更は必ずチャンスでもあります。新担当者のニーズをしっかりヒアリングしてください。' },
      { reportId: satoReport2.id, supervisorId: manager1.id, commentType: 'plan', commentText: 'ランチミーティングの設定、良い判断です。費用は経費精算してOKです。' },
      // 鈴木 report1 (approved by manager1)
      { reportId: suzukiReport1.id, supervisorId: manager1.id, commentType: 'problem', commentText: 'フェーズ分けの提案は良い対応です。柔軟に顧客ニーズに応えられています。' },
      { reportId: suzukiReport1.id, supervisorId: manager1.id, commentType: 'general', commentText: 'スマートテック、フェーズ1発注おめでとうございます！' },
      // 鈴木 report2 (rejected)
      { reportId: suzukiReport2.id, supervisorId: manager1.id, commentType: 'problem', commentText: '【差し戻し理由】課題の記載が「記載が不十分」のみで、具体的な内容が書かれていません。何が課題なのか明確に記載してください。' },
      { reportId: suzukiReport2.id, supervisorId: manager1.id, commentType: 'general', commentText: '訪問記録も「訪問」のみで内容が不明です。再提出してください。' },
      // 伊藤 report1 (approved by manager2)
      { reportId: itoReport1.id, supervisorId: manager2.id, commentType: 'problem', commentText: '繁忙期のタイミング把握ができていますね。顧客の都合に合わせた柔軟な対応が大切です。' },
      { reportId: itoReport1.id, supervisorId: manager2.id, commentType: 'plan', commentText: 'メール・電話でのフォロー強化は良い方針です。月次でサマリーを送ると効果的です。' },
      // 中村 report1 (approved by manager2)
      { reportId: nakamuraReport1.id, supervisorId: manager2.id, commentType: 'problem', commentText: '法務レビューの遅延は相手側の問題です。期限設定のアプローチは正しい。強く推進してください。' },
      { reportId: nakamuraReport1.id, supervisorId: manager2.id, commentType: 'plan', commentText: '来週中の合意目標、達成できるよう必要であれば私も同席します。' },
    ],
  });

  console.log('  ✓ Supervisor comments created');

  // -----------------------------------------------------------------------
  // サマリー出力
  // -----------------------------------------------------------------------
  const counts = {
    sales: await prisma.sales.count(),
    customers: await prisma.customer.count(),
    reports: await prisma.dailyReport.count(),
    visitRecords: await prisma.visitRecord.count(),
    comments: await prisma.supervisorComment.count(),
  };

  console.log('\n✅ Seeding completed!');
  console.log('📊 Summary:');
  console.log(`  - Sales users  : ${counts.sales}  (部長1, 課長2, 営業7)`);
  console.log(`  - Customers    : ${counts.customers}`);
  console.log(`  - Daily reports: ${counts.reports}  (approved: 5, submitted: 6, rejected: 1, draft: 1)`);
  console.log(`  - Visit records: ${counts.visitRecords}`);
  console.log(`  - Comments     : ${counts.comments}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
