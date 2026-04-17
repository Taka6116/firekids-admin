/** amplify-config.ts と同じプレースホルダー（未設定検出用） */
const PLACEHOLDER_USER_POOL_ID = "ap-northeast-1_PLACEHOLDER";
const PLACEHOLDER_USER_POOL_CLIENT_ID =
  "placeholderClientId012345678901234567890";

/**
 * ブラウザで使えるのは `NEXT_PUBLIC_*` のみ。未設定だとビルド用プレースホルダーが埋まり、Cognito がエラーになる。
 */
export function isCognitoMisconfigured(): boolean {
  const pool = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID?.trim();
  const client = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID?.trim();

  if (!pool || !client) {
    return true;
  }
  if (pool === PLACEHOLDER_USER_POOL_ID || client === PLACEHOLDER_USER_POOL_CLIENT_ID) {
    return true;
  }
  // .env.example のままコピーした場合
  if (pool.includes("XXXXXXXX") || client.includes("XXXXXXXX")) {
    return true;
  }
  return false;
}
