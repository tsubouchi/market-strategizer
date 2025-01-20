# 画面設計

## 1. 統合分析スタート画面

### 機能
- 「3C・4P・PESTの統合分析を開始」ボタン
- 多段推論の第一ステップ（要約）開始機能

### デザイン仕様
- メインタイトル「戦略AIコンパス」: 白色テキスト (text-white)
- アクセントカラー: 紫色 (hsl(265 98% 61%))
- システムテーマ対応: light/darkモード自動切り替え
- 角丸設定: radius 0.75

## 2. 多段推論ステップ画面

### ステップ1: 既存分析の要点要約
- 要約内容の表示
- ユーザーコメント追加機能
- 再要約機能

### ステップ2: 関連性分析
- 3C、4P、PESTの関連性表示
- ユーザーコメント・編集機能

### ステップ3: コンセプト候補の生成
- 複数コンセプト案の表示
- 絞り込み基準・要望の入力機能

### ステップ4: 最終コンセプト絞り込み
- コンセプト案の最終決定
- データベース保存機能

## 3. コンセプト編集・確認画面

### 機能
- 保存コンセプトの編集
- AIへの再問い合わせ機能

## 4. 総合レポートプレビュー画面

### 機能
- 多段推論履歴の表示
- 最終コンセプトのレイアウト表示
- PDF出力機能

## 5. レイアウト・ナビゲーション設計指針

### サイドバー設計
- デスクトップ表示
  - 幅: 16rem (--sidebar-width)
  - 背景: 不透明な背景色（bg-sidebar）
  - ヘッダー下配置: pt-14でヘッダーとの重なりを防止
  - ナビゲーション: Link コンポーネントによる SPA ルーティング
  - アクティブ状態表示: isActive プロパティによるハイライト

- モバイル表示（ハンバーガーメニュー）
  - 幅: 画面幅の85%（最大400px）
  - 左サイドからのスライドイン
  - collapsible="offcanvas" による収納機能
  - SidebarTrigger による開閉制御

### メインコンテンツエリア
- ヘッダー固定: sticky top-0
- コンテンツ領域: 
  - フレックスレイアウト
  - ヘッダー高さを考慮したmin-height計算
  - スクロール可能なオーバーフロー設定

### レスポンシブデザイン原則
- ブレークポイント
  - モバイル: デフォルト
  - デスクトップ: md (768px) 以上
- コンテンツの配置
  - モバイル: サイドバーは左からスライドイン
  - デスクトップ: 常時表示のサイドバー（オプションで折りたたみ可能）

### アクセシビリティ考慮事項
- コントラスト: 背景色と前景色のコントラスト比を確保
- タッチターゲット: モバイルでの操作性を考慮した十分なサイズ
- キーボードナビゲーション: フォーカス可能な要素の視認性確保
- スクリーンリーダー対応: 適切なaria属性とラベルの提供

## 6. 新規ページ作成のガイドライン

### 基本レイアウト構造
```tsx
export default function NewPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      {/* ヘッダー領域 */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold">ページタイトル</h1>
          <p className="text-muted-foreground">
            ページの説明文
          </p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="space-y-6">
        {/* コンテンツをここに配置 */}
      </div>
    </div>
  );
}
```

### コンテナとマージン規則
1. ページコンテナ
   - 最大幅: max-w-7xl
   - 水平パディング: px-4 md:px-6 lg:px-8
   - 垂直パディング: py-8

2. カード間のスペーシング
   - 基本間隔: space-y-6
   - グリッドギャップ: gap-6 (グリッドレイアウトの場合)

3. セクション間のマージン
   - 大きなセクション: mb-8
   - 小さなセクション: mb-4

### コンポーネントの配置規則
1. ヘッダー部分
   - 戻るボタン + タイトル: flex items-center gap-4
   - アクションボタン: ml-auto (右寄せ)

2. グリッドレイアウト
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* カードコンポーネント */}
</div>
```

3. フォーム要素
```tsx
<div className="space-y-2">
  <Label>ラベル</Label>
  <Input />
  <p className="text-sm text-muted-foreground">
    ヘルプテキスト
  </p>
</div>
```

### アクションとインタラクション
1. ボタン配置
   - プライマリーアクション: 右寄せまたは幅いっぱい
   - セカンダリーアクション: プライマリーの左側

2. ローディング状態
```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  アクション
</Button>
```

### エラー処理とフィードバック
1. エラーメッセージ
   - フォーム内: form.formState.errors経由
   - トースト: useToast()フックを使用

2. 確認ダイアログ
   - 危険な操作: AlertDialogを使用
   - 通常の確認: Dialogを使用

### レスポンシブデザインの実装
1. コンテナの幅
```tsx
<div className="w-full max-w-4xl mx-auto">
  {/* コンテンツ */}
</div>
```

2. グリッドレイアウト
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* グリッドアイテム */}
</div>
```

3. フォントサイズ
- ヘッダー: text-4xl
- サブヘッダー: text-2xl
- 本文: text-base

### 共通コンポーネントの使用
1. カード
```tsx
<Card>
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
    <CardDescription>説明</CardDescription>
  </CardHeader>
  <CardContent>
    {/* コンテンツ */}
  </CardContent>
</Card>
```

2. フォーム
```tsx
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {},
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    {/* フォームフィールド */}
  </form>
</Form>
```

### テーマとカラー
1. テキストカラー
- 主要テキスト: text-foreground
- 補足テキスト: text-muted-foreground
- アクセント: text-primary

2. 背景色
- メイン: bg-background
- カード: bg-card
- アクセント: bg-primary/10

### 実装時の注意点
1. レイアウトコンポーネント
   - 必ずLayoutコンポーネントでラップする
   - App.tsxのRouterコンポーネント内で実装

2. ナビゲーション
   - useLocation フックを使用
   - 直接のwindow.location操作は避ける

3. データフェッチ
   - react-queryを使用
   - ローディング状態を適切に処理

4. エラー処理
   - try-catch内でtoastを使用
   - ユーザーフレンドリーなエラーメッセージ

これらのガイドラインに従うことで、一貫性のある使いやすいUIを実現できます。

## ユーザーストーリー

1. コンセプト作成ユーザー
   - 統合分析開始からステップバイステップな推論結果の確認
   - 最終的な商品コンセプトの確定

2. 複数コンセプト比較ユーザー
   - 複数案の一覧確認
   - 条件指定による再提案

3. プレゼンテーション用途ユーザー
   - 総合レポートのPDF出力
   - 分析プロセスの裏付け提示