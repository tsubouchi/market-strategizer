# CRUD機能開発指針

## 1. 概要

本ドキュメントは、認証機能が未実装の段階でのCRUD機能開発における指針をまとめたものです。特に、外部キー制約のある関連テーブル間でのデータ操作における注意点と、フロントエンドのUI/UX実装のガイドラインを提供します。

## 2. デモ環境でのユーザー認証

### 2.1 ユーザーID固定

デモ環境では、以下の方針でユーザー認証を扱います：

```typescript
// バックエンド
const userId = 1; // デモユーザーとしてID=1を使用

// データベースクエリ例
const userRecords = await db
  .select()
  .from(table)
  .where(eq(table.user_id, userId));
```

### 2.2 認証チェックの実装

```typescript
// デモ環境での実装
if (record.user_id !== 1) {
  return res.status(403).send("Access denied");
}
```

## 3. 外部キー制約を考慮したCRUD操作

### 3.1 削除操作の実装パターン

関連テーブル間での削除は、以下の順序で実装します：

```typescript
// 例：コンセプトの削除
await db.transaction(async (tx) => {
  // 1. 最も深い依存関係から削除
  await tx
    .delete(requirement_analyses)
    .where(eq(requirement_analyses.requirement_id, reqId));

  // 2. 中間の依存関係を削除
  await tx
    .delete(product_requirements)
    .where(eq(product_requirements.concept_id, conceptId));

  // 3. 主テーブルの関連を削除
  await tx
    .delete(concept_analyses)
    .where(eq(concept_analyses.concept_id, conceptId));

  // 4. 最後に主テーブルのレコードを削除
  await tx
    .delete(concepts)
    .where(eq(concepts.id, conceptId));
});
```

### 3.2 トランザクション処理の重要性

- 複数テーブルの操作は必ずトランザクションで囲む
- エラー発生時は自動でロールバック
- データの整合性を保証

## 4. フロントエンドの実装指針

### 4.1 削除UIのデザインパターン

```typescript
// 削除ボタンのスタイリング例
<Button 
  variant="outline" 
  size="icon" 
  className="hover:bg-destructive/10 hover:text-destructive"
>
  <Trash2 className="h-4 w-4" />
</Button>
```

### 4.2 確認ダイアログの実装

```typescript
<AlertDialog>
  <AlertDialogTrigger />
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>削除の確認</AlertDialogTitle>
      <AlertDialogDescription>
        この操作は取り消せません。
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>キャンセル</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDelete}
        className="bg-destructive/90 hover:bg-destructive"
      >
        削除
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 4.3 ローディング状態の表示

```typescript
{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
```

## 5. エラーハンドリング

### 5.1 バックエンドでのエラー処理

```typescript
try {
  // CRUD操作
} catch (error) {
  console.error("Operation error:", error);
  next(error); // Express エラーハンドラーに委譲
}
```

### 5.2 フロントエンドでのエラー表示

```typescript
const handleDelete = async (id: string) => {
  try {
    await deleteMutation.mutateAsync(id);
    toast({
      title: "削除完了",
      description: "正常に削除されました",
    });
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "エラー",
      description: error.message || "操作中にエラーが発生しました",
    });
  }
};
```

## 6. データ更新後の画面更新

### 6.1 React Query の活用

```typescript
// Mutation の実装例
return useMutation({
  mutationFn: async (id) => {
    const res = await fetch(`/api/${resource}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  onSuccess: () => {
    // キャッシュの更新
    queryClient.invalidateQueries({ queryKey: [`/api/${resource}`] });
  },
});
```

## 7. データベーススキーマ設計の指針

### 7.1 必須フィールドの追加

新しい必須フィールドを追加する際は、以下の手順で実装します：

1. 一時的にNULLを許容する形で追加
```typescript
title: text("title"), // 一時的にnullable
```

2. 既存レコードにデフォルト値を設定
```sql
UPDATE table_name 
SET new_field = 'デフォルト値' 
WHERE new_field IS NULL;
```

3. NOT NULL制約を追加
```typescript
title: text("title").notNull(), // 必須フィールドに変更
```

### 7.2 スキーマ定義例

```typescript
export const analyses = pgTable("analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: serial("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  analysis_type: text("analysis_type").notNull(),
  content: jsonb("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
```

## 8. フロントエンドのデータ表示パターン

### 8.1 カード表示のベストプラクティス

```typescript
<Card className="hover:shadow-lg transition-shadow relative group">
  <CardHeader>
    <CardTitle className="flex justify-between items-start">
      <div>
        <div className="text-xl">{analysis.title}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {analysis.analysis_type}分析
        </div>
      </div>
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground line-clamp-3">
      {/* コンテンツの表示 */}
    </p>
  </CardContent>
</Card>
```

### 8.2 削除ボタンの配置

```typescript
<div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button 
        variant="outline" 
        size="icon"
        className="hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </AlertDialogTrigger>
    {/* 確認ダイアログの内容 */}
  </AlertDialog>
</div>
```

## 9. APIエンドポイントの設計パターン

### 9.1 削除エンドポイントの実装

```typescript
app.delete("/api/:resource/:id", async (req, res, next) => {
  try {
    const [record] = await db
      .select()
      .from(targetTable)
      .where(eq(targetTable.id, req.params.id))
      .limit(1);

    if (!record) {
      return res.status(404).send("Record not found");
    }

    // デモ環境での認証チェック
    if (record.user_id !== 1) {
      return res.status(403).send("Access denied");
    }

    await db
      .delete(targetTable)
      .where(eq(targetTable.id, req.params.id));

    res.json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
});
```

## 10. 本番環境への移行準備

1. ユーザー認証の実装
   - デモ環境の固定user_idを実際の認証システムに置き換え
   - セッション管理の追加
   - 適切なアクセス制御の実装

2. データ整合性の確保
   - 必須フィールドの確認と適切なデフォルト値の設定
   - 関連テーブル間の整合性チェック

3. エラーハンドリングの強化
   - より詳細なエラーメッセージ
   - エラーログの強化
   - ユーザーフレンドリーなエラー表示