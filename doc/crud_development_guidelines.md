# CRUD機能開発指針

## 1. 概要

本ドキュメントは、認証機能が未実装の段階でのCRUD機能開発における指針をまとめたものです。特に、外部キー制約のある関連テーブル間でのデータ操作における注意点と、フロントエンドのUI/UX実装のガイドラインを提供します。

## 2. デモ環境でのユーザー認証

### 2.1 ユーザーID固定

デモ環境では、以下の方針でユーザー認証を扱います：

```typescript
// バックエンド
const userId = req.user?.id || 1; // デモユーザーとしてID=1を使用

// データベースクエリ例
const userRecords = await db
  .select()
  .from(table)
  .where(eq(table.user_id, userId));
```

### 2.2 認証チェックの実装

```typescript
// 本番環境での実装を見据えた条件分岐
if (record.user_id !== (req.user?.id || 1)) {
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

## 7. 本番環境への移行準備

1. ユーザー認証の実装
   - `req.user?.id || 1` の箇所を `req.user.id` に置き換え
   - 認証ミドルウェアの追加

2. アクセス制御の強化
   - ロールベースのアクセス制御
   - より厳密な所有者チェック

3. エラーメッセージの調整
   - デバッグ情報の制限
   - ユーザーフレンドリーなエラーメッセージ

## 8. パフォーマンス最適化

1. N+1問題の回避
   - 関連データの一括取得
   - 必要なフィールドのみの選択

2. インデックスの活用
   - 頻繁に検索される列へのインデックス付与
   - 複合インデックスの検討

## 9. テスト戦略

1. 単体テスト
   - CRUD操作の基本機能テスト
   - エラーケースの検証

2. 統合テスト
   - 関連テーブル間の整合性確認
   - トランザクションの動作確認

3. E2Eテスト
   - UI操作を含めた一連の流れの確認
   - エラー時のUX検証
