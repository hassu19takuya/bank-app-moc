import { AgentType, Transaction, AgentConfig } from './types';

// Mock BigQuery Data (Transaction History)
export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2024-05-01', description: 'スターバックス コーヒー', amount: -550, category: 'カフェ' },
  { id: 't2', date: '2024-05-02', description: 'Uber Trip', amount: -2400, category: '交通費' },
  { id: 't3', date: '2024-05-03', description: '給与振込', amount: 350000, category: '収入' },
  { id: 't4', date: '2024-05-05', description: 'Amazon Japan', amount: -12800, category: 'ショッピング' },
  { id: 't5', date: '2024-05-06', description: '東京電力', amount: -8500, category: '光熱費' },
  { id: 't6', date: '2024-05-10', description: 'Netflix 定額払い', amount: -1490, category: 'エンタメ' },
  { id: 't7', date: '2024-05-12', description: 'スーパー ライフ', amount: -4300, category: '食費' },
  { id: 't8', date: '2024-05-15', description: 'エニタイムフィットネス', amount: -8000, category: '健康' },
  { id: 't9', date: '2024-05-20', description: 'ユニクロ', amount: -5600, category: '被服費' },
  { id: 't10', date: '2024-05-25', description: 'Apple Services', amount: -1300, category: 'エンタメ' },
];

// Mock Cloud Storage Data (Support Documents)
export const MOCK_SUPPORT_DOCS = `
[GENESIS APP よくある質問]
Q: パスワードをリセットするにはどうすればよいですか？
A: 設定 > セキュリティ > パスワードリセット から行えます。確認メールが送信されます。

Q: 振込限度額はいくらですか？
A: 1日の振込限度額は50万円です。それ以上の額をご希望の場合は、支店窓口までお越しください。

Q: カードをロックするにはどうすればよいですか？
A: 「カード」タブから「ロック」アイコンをタップすることで、即座にカードを凍結できます。

Q: ローンは提供していますか？
A: はい、金利2.5%から最大300万円までの個人向けローンを提供しています。「ローン」タブからお申し込みください。

Q: 支店の営業時間は？
A: 平日の午前9時から午後3時まで営業しています。ATMは24時間365日ご利用いただけます。
`;

export const AGENTS: AgentConfig[] = [
  {
    id: AgentType.GENERAL,
    name: "総合コンシェルジュ",
    description: "Google検索を活用した汎用アシスタント",
    icon: "✨",
    color: "bg-red-500"
  },
  {
    id: AgentType.SUPPORT,
    name: "カスタマーサポート",
    description: "規定に基づいた正確なサポート",
    icon: "🛡️",
    color: "bg-emerald-500"
  },
  {
    id: AgentType.NEWS,
    name: "マーケットアナリスト",
    description: "金融ニュースの解説と記事作成",
    icon: "📰",
    color: "bg-indigo-500"
  },
  {
    id: AgentType.ANALYST,
    name: "家計アドバイザー",
    description: "取引データの分析とアドバイス",
    icon: "📊",
    color: "bg-amber-500"
  }
];

// User Profile Constants
export const AGE_GROUPS = [
  '10代', '20代', '30代', '40代', '50代', '60代', '70代', '80代以上'
];

export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

export const OCCUPATIONS = [
  '会社員', '公務員', '自営業', '役員', '学生', '主婦・主夫', 'パート・アルバイト', '退職・年金受給', 'その他'
];

export const INTERESTS = [
  '株式投資', '投資信託', '不動産', 'FX・暗号資産', '節約・貯金', 
  '旅行', 'グルメ', 'テクノロジー', 'ファッション', '健康・ヘルスケア', 
  'スポーツ', '映画・音楽'
];
