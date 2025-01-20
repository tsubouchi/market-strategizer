ログイン（認証）機能が未実装の段階で、CRUDまわりを一通り開発するための簡易的な要件書サンプルです。

「開発デモ用」という位置づけのため、すべてのリソースを固定ユーザーID（仮に user_id=1）で扱うという前提で書いています。

デモ開発用 CRUD 要件書

1. 背景と目的
	•	背景
	•	ログイン・認証機能がまだ無い状態で、概念実証(Proof of Concept)またはUI/UX検証のために、分析や要件書・コンセプトなどのCRUD機能を先行実装したい。
	•	目的
	•	開発チームが画面遷移やデータ操作のフローをひと通り確認できるようにする。
	•	後日ログイン機能を実装した際にも大きくコードを変えずに済むよう、データモデルやAPIの形を先に整えておく。
	•	デモ用に「特定ユーザー（例: user_id=1）のデータ」を操作する形にし、認証が追加されたらマルチユーザー対応へ移行する予定。

2. スコープ
	•	対象CRUD
	1.	分析 (Analysis)
	•	3C, 4P, PESTなどの種類を持ち、ユーザーが入力した分析データをJSONで保存
	2.	商品コンセプト (Concept)
	•	分析データを統合し、AI等で生成したビジネスアイデア（コンセプト）を保存
	3.	要件書 (ProductRequirements)
	•	コンセプトをもとに作成されるアプリケーション要件書のCRUD
	4.	競合他社モニタリング (Competitor, CompetitorUpdates)
	•	競合企業情報を登録し、更新情報を取得・表示する機能
	•	除外範囲
	•	ユーザー認証（ログイン/ログアウト）機能
	•	権限管理（アドミン/一般ユーザー区別）
	•	シェア機能（他ユーザーに公開）
	•	高度なサードパーティAPI連携

3. 要件

3.1. 固定ユーザーIDの扱い
	•	すべてのAPIリクエストで user_id=1 と見なす
	•	実際のDB書き込み時や読み取り時に user_id=1 をハードコードでセット/チェック。
	•	ログイン機能が実装されたら、この部分を req.user.id の値で上書きする形にする。

3.2. 分析 (Analyses)
	•	エンドポイント
	1.	POST /api/analyses : 新規分析を作成
	•	Request Body: { analysis_type: "3C"|"4P"|"PEST", content: {...}, ... }
	•	DBでは analysis_type (テキスト) と content (JSON) を保存。
	•	user_id=1 を自動でセット。
	2.	GET /api/analyses : 登録済み分析の一覧を取得
	•	返却データは { id, analysis_type, content, created_at }[]
	•	user_id=1 のレコードのみ返す。
	3.	GET /api/analyses/:id : 分析詳細の取得
	4.	PUT /api/analyses/:id : 分析データの更新
	•	Request Body に分析内容を含む。
	•	DB更新対象は analysis_type, content, updated_at 等。
	5.	DELETE /api/analyses/:id : 分析データの削除

3.3. 商品コンセプト (Concepts)
	•	エンドポイント
	1.	POST /api/concepts/generate : 複数の分析IDを渡し、AIでコンセプトを生成→保存
	•	Request Body: { analysis_ids: string[], ... }
	•	生成結果をDBに title, value_proposition, target_customer, advantage, raw_data などで保存。
	•	user_id=1 をセット。
	2.	GET /api/concepts : コンセプトの一覧取得
	3.	GET /api/concepts/:id : コンセプト詳細取得
	4.	POST /api/concepts/:id/refine : コンセプトを再調整（AIで修正）
	5.	DELETE /api/concepts/:id : コンセプトの削除（デモ用でも実装するかは任意）

3.4. 要件書 (ProductRequirements)
	•	エンドポイント
	1.	POST /api/concepts/:id/requirements : AIを使って要件書生成
	•	生成された要件書を title, overview, target_users, features (JSON), ... 等で保存。
	•	user_id=1 をセット。
	2.	GET /api/requirements/:id : 要件書詳細の取得
	3.	PUT /api/requirements/:id : 要件書の更新
	4.	DELETE /api/requirements/:id : 要件書の削除
	5.	GET /api/requirements/:id/download : 要件書をMarkdownやPDFでダウンロード

3.5. 競合他社モニタリング (Competitors, CompetitorUpdates)
	•	エンドポイント
	1.	POST /api/competitors : 競合他社の新規登録（社名、URL、キーワード等）
	2.	GET /api/competitors : 登録済み競合一覧の取得
	3.	POST /api/competitors/:id/refresh : 深層検索API等で最新情報を取得し、Updatesに書き込む
	4.	GET /api/competitors/:id : 個別の競合情報取得（詳細画面用）
	5.	PUT /api/competitors/:id/keywords : 監視キーワードの更新
	6.	（任意）DELETE /api/competitors/:id : 競合情報の削除

3.6. 所有権/アクセス制御
	•	今回のデモでは
	•	すべてのデータは user_id=1 を所有者として扱う。
	•	削除・更新時には if (record.user_id !== 1) return 403; のような簡易チェックのみ実装し、基本的には問題なく操作可能にしておく。

	今後ログイン機能が追加される際
		•	(req.user?.id || 1) の箇所を実際の req.user.id に置き換え
	•	API呼び出し時、JWTなどのトークンを検証→ req.user をセット
	•	これに伴い、各レコードの user_id が実際のユーザーIDと照合される設計に切り替える

4. データモデル

4.1. 全体ER図（概念）			

User (今回デモでは user_id=1 のみ使用)
└─── Analyses (analysis_type, content, ...)
└─── Concepts (title, value_proposition, target_customer, ...)
└─── ProductRequirements (title, overview, features, ...)
└─── Competitors (company_name, website_url, monitoring_keywords, ...)
      └─── CompetitorUpdates (update_type, content, ...)

4.2. 項目例：ProductRequirements      

フィールド名	型	説明
id	UUID	プライマリキー
user_id	INT	所有者ユーザーID (デモでは1固定)
concept_id	UUID	紐づくコンセプトID
title	TEXT	要件書タイトル
overview	TEXT	プロジェクト概要
target_users	TEXT	想定ユーザー・ペルソナ
features	JSON	機能一覧や優先度の配列
tech_stack	JSON	技術スタック (React, Nodeなど)
ui_ux_requirements	JSON	UI/UX要件
schedule	JSON	簡易的なスケジュール情報
status	TEXT	‘draft’
created_at	TIMESTAMP	作成日時
updated_at	TIMESTAMP	更新日時

5. ユーザーストーリー例（デモ用）
	1.	ユーザー(=ID=1)が分析データを作成
	•	/api/analyses に POST して 3C分析を登録する
	2.	複数の分析を選択してコンセプト生成
	•	/api/concepts/generate に analysis_ids を渡し、AIからコンセプト候補を生成
	3.	コンセプトを選択し、要件書を自動作成
	•	/api/concepts/:id/requirements に対して POST すると、要件書レコードが作成される
	4.	生成された要件書をダウンロード（Markdown）
	•	/api/requirements/:id/download でDLし、初期の画面遷移や体験を確認
	5.	競合他社を1件登録し、モニタリング
	•	/api/competitors → IDを取得 → /api/competitors/:id/refresh で更新情報を取得し、UI表示を確認

	6. 非機能要件（デモ開発の範囲）
	1.	パフォーマンス
	•	本番レベルの負荷を想定せず、ローカル or 単一サーバーで動くことを前提とする。
	2.	セキュリティ
	•	ユーザー認証を実装しないため、デモ用ではCSRF, XSS, etc. 大きな対策は行わない。（本番移行時に強化する）
	3.	拡張性
	•	将来的には複数ユーザー対応を想定し、DBスキーマ上 user_id を必須にしておく。
	4.	ログ
	•	エラー時や重要イベント（作成/更新/削除）にはロガーを出力してデバッグしやすくする。

7. 実装ガイド
	1.	ユーザーIDのマッピング
	•	コントローラ（ルート）レベルで const userId = 1; と固定し、CRUD操作時に where user_id = userId を付ける。
	•	削除や更新のときも同様に if (record.user_id !== userId) { return 403; } のように書く。
	2.	認証機能との結合を容易に
	•	将来 req.user?.id がセットされるようになったら、同じロジックを user_id = req.user.id に置き換えるだけで良いように実装。
	3.	フロントエンド
	•	ボタン押下で /api/xxx に対し fetch する実装。
	•	全データがユーザーID=1に属している想定なので、画面上で「ログイン」要素は不要。	

8. 今後の発展
	•	ログイン・認証
	•	JWTやOAuthを導入して複数ユーザーに対応する。
	•	(req.user.id) をセッションから取り、DBの user_id と突合する形へ改修。
	•	共有・コラボ機能
	•	ほかユーザーと共同編集や閲覧権限を設定できるようにする。
	•	通知機能
	•	競合更新や要件書更新などを通知する仕組みを導入。	