# システム設計

## 1. 非機能要件

### パフォーマンス
- 多段推論のステップ間の待ち時間の最適化
- 同時10ユーザー程度の多段推論実行に対応

### 拡張性
- 他の分析フレームワーク（SWOT分析など）の追加容易性
- 多段推論ステップのカスタマイズ可能性

### セキュリティ
- LLM APIキーの秘匿管理
- HTTPS通信の徹底

### 操作性
- 多段推論プロセスの可視化
- ステップ進行の視覚的表示

### 可用性
- 分析内容や推論中間結果の自動保存
- ブラウザを閉じても再開可能

## 2. システム構成

### モジュール構成

1. 多段推論フロー制御モジュール
   - バックエンド（Node.js/Express）での実装
   - 各ステップに対応するAPIエンドポイント

2. AIアシスト・シークエンス管理
   - ステート管理によるステップごとのプロンプト設計
   - 前ステップ結果の次ステップへの引き継ぎ

### データベース設計

#### concepts テーブル
```sql
CREATE TABLE IF NOT EXISTS concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users (id) ON DELETE CASCADE,
  title varchar NOT NULL,               -- 商品コンセプトのタイトル
  value_proposition text,               -- 提供価値
  target_customer text,                 -- ターゲット顧客
  advantage text,                       -- 競合優位性・他社との差別化
  raw_data jsonb,                       -- 多段推論の中間結果など
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### レポート生成
- HTMLベースの総合レポート生成
- PDF変換機能
- Reactコンポーネントによるプレビュー画面
