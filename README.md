# FIRE KIDS 仕入れ補助（社内向けフロント）

Next.js 14（App Router）+ TypeScript + Tailwind + shadcn/ui。認証は Cognito、データは `NEXT_PUBLIC_USE_MOCK` でモック切替。

## 開発

```bash
npm install
npm run dev
```

`.env.local` は [`.env.example`](./.env.example) を参照。

## バックエンド結合テスト（Step 7）

バックエンド（別リポジトリ）が返す JSON が、このリポジトリの Zod スキーマと一致するかを CLI で確認します。

1. `.env.local` に `NEXT_PUBLIC_API_BASE_URL` を実環境に合わせ、`NEXT_PUBLIC_USE_MOCK=false` にする（アプリからの手動確認用）。
2. Cognito でサインインしたあと、**idToken**（JWT 文字列）を取得する。
3. 次のいずれかでトークンを渡して実行する（`web` ディレクトリで）。

```bash
# 環境変数で一時指定（シェル履歴に残るので注意）
INTEGRATION_ID_TOKEN="eyJ..." npm run verify:api
```

または `.env.local` に `INTEGRATION_ID_TOKEN=...` を書き（Git に含めない）、`npm run verify:api` だけ実行。

成功すると `/admin/purchase-score`・`/admin/matrix`・`/admin/budget-simulation` の 3 本が Zod でパースできた旨が表示されます。失敗時は HTTP エラーまたは Zod の検証内容が表示され、終了コード 1 になります。

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
