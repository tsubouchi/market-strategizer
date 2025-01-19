# Market Strategizer (戦略分析支援ツール) - 戦略AIコンパス

AIと多段分析でビジネスの方向性を明確化。3C・4P・PESTを統合し、次なるアクションプランを見える化します。


## 主な機能

### 1. 分析機能
- 3C分析 (Company, Customer, Competitor)
- 4P分析 (Product, Price, Place, Promotion)
- PEST分析 (Politics, Economics, Society, Technology)

### 2. AI支援機能
- 入力内容の自動分析と要約
- 多段階分析による深い洞察の提供
- 具体的な改善提案の生成

### 3. コラボレーション機能
- 分析結果の共有
- コメント機能
- 公開/非公開設定

### 4. レポート機能
- PDFエクスポート
- 添付資料管理
- 参考URL管理

## 技術スタック

- フロントエンド
  - React.js
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - React Query

- バックエンド
  - Node.js
  - Express
  - PostgreSQL
  - Drizzle ORM

- AI/ML
  - OpenAI GPT-4

## ローカル開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/tsubouchi/market-strategizer.git
cd market-strategizer

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集し、必要な環境変数を設定

# データベースのセットアップ
npm run db:push

# 開発サーバーの起動
npm run dev
```

### 必要な環境変数

```
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
OPENAI_API_KEY=your-openai-api-key
```

## デプロイ

このプロジェクトはReplitでホストされています。

## ライセンス

MIT License

## 貢献について

プルリクエストやイシューの報告を歓迎します。大きな変更を加える場合は、まずイシューを作成して変更内容を議論してください。