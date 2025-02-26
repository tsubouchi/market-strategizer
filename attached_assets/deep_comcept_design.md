商品コンセプト深掘り＆具体要件抽出機能 仕様

1. 機能概要
	•	目的
	•	既存の3C分析、4P分析、PEST分析の結果を踏まえ、AIがステップバイステップで「商品コンセプトを深掘り」し、最終的にはWebアプリの具体的な要件書（機能一覧、優先度、UI/UX要件など）を自動生成・編集サポートする。
	•	ユーザーが持つ「ビジネスアイデア」や「市場背景情報」をさらに引き出し、抜け漏れの少ない要件定義をスピーディに行えるようにする。
	•	想定ユーザー
	•	新規事業の企画担当、エンジニア、プロダクトマネージャー、スタートアップ創業者、など。
	•	具体的な「Webアプリを作りたいが、要件定義に時間がかかる」「分析結果をうまくまとめられない」という課題を感じている人。

商品コンセプト深掘り＆具体要件抽出機能 仕様

1. 機能概要
	•	目的
	•	既存の3C分析、4P分析、PEST分析の結果を踏まえ、AIがステップバイステップで「商品コンセプトを深掘り」し、最終的にはWebアプリの具体的な要件書（機能一覧、優先度、UI/UX要件など）を自動生成・編集サポートする。
	•	ユーザーが持つ「ビジネスアイデア」や「市場背景情報」をさらに引き出し、抜け漏れの少ない要件定義をスピーディに行えるようにする。
	•	想定ユーザー
	•	新規事業の企画担当、エンジニア、プロダクトマネージャー、スタートアップ創業者、など。
	•	具体的な「Webアプリを作りたいが、要件定義に時間がかかる」「分析結果をうまくまとめられない」という課題を感じている人。

2. 前提条件・連携範囲
	1.	既存分析機能との連携
	•	3C・4P・PESTの分析結果がデータベースに保存されている。
	•	ユーザーは必要なときに、各分析の結果を参照可能（APIや内部関数で取得）。
	2.	AI連携
	•	OpenAIなどのLLM APIを利用し、分析内容を要約・補完していく。
	•	多段推論(Chain of Thought) で段階的に要件を固める。
	3.	ユーザー入力
	•	必ずユーザーがビジネスアイデア・ゴールなどを手動で追加入力できるUIを用意し、AIの出力と組み合わせて最終案を確定する。

以下の内容を統合し、Webアプリの具体的な商品コンセプトを提案してください。
- 3C分析: {…}
- 4P分析: {…}
- PEST分析: {…}
- ユーザー要望: {…}
まずはターゲット顧客、主要機能、ビジネスモデル案を3つ挙げてください。

	2.	多段推論
	•	初期ドラフト → ユーザーコメントを再プロンプト → 深掘り → 要件定義 と順番にLLMに指示を送り、各段階で必要情報を付加していく。
	3.	トークン制御・要約処理
	•	分析結果が大量になる場合に備え、システムが適度に要約・抽出してLLMに渡す。
	•	過去ステップの履歴も参照できるように、LangChainのようなフレームワークを使うことも検討。

4.4. データベース構造（例・拡張）
	•	要件書の保存テーブル: product_requirements		

CREATE TABLE IF NOT EXISTS product_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  concept_title text,            -- コンセプト名
  requirement_doc jsonb,         -- 要件書本体をJSON形式で管理
  status varchar(50),            -- 'draft', 'final', etc.
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

	•	requirement_doc 内には以下の要素を含む構造を想定：

{
  "overview": "...",
  "targetUsers": "...",
  "features": [
    {"name": "必須機能A", "priority": "high", ...},
    {"name": "必須機能B", "priority": "medium", ...}
  ],
  "techStack": "React + Node + ...",
  "schedule": {...},
  "comments": []
}

4.5. エラーハンドリング・制限
	•	AI呼び出しエラー
	•	タイムアウトやAPIエラー時にリトライ処理。
	•	ユーザー画面上に適切なエラーメッセージ表示。
	•	過剰なトークン使用
	•	分析データが長大な場合、要約を挟む。
	•	適度にセッションを区切るなどの制御を行う。

7. まとめ
	•	狙い: 3C/4P/PEST分析結果から「商品コンセプト」を深掘りし、具体的なWebアプリ要件書をスピーディに作る機能。
	•	大きな特徴: AIを段階的に活用し、ユーザーのアイデアや追加要望を取り入れながら要件をブラッシュアップ。
	•	導入効果: 要件定義の抜け漏れ防止、迅速な意思決定、チーム間の認識合わせをサポート。

上記仕様を土台に、実際のUI/UX設計や開発スケジュールにあわせて調整いただければ、充実した商品コンセプト深掘り＆要件化機能が実現できます。				