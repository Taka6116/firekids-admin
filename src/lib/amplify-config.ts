import type { ResourcesConfig } from "aws-amplify";

const PLACEHOLDER_USER_POOL_ID = "ap-northeast-1_PLACEHOLDER";
const PLACEHOLDER_USER_POOL_CLIENT_ID =
  "placeholderClientId012345678901234567890";

/**
 * Cognito（User Pool + アプリクライアント）の Amplify 設定。
 * 未設定の場合はビルド通過用のプレースホルダーを返す（本番ログイン前に .env.local を埋めること）。
 */
export function getAmplifyResourcesConfig(): ResourcesConfig {
  return {
    Auth: {
      Cognito: {
        userPoolId:
          process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ??
          PLACEHOLDER_USER_POOL_ID,
        userPoolClientId:
          process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ??
          PLACEHOLDER_USER_POOL_CLIENT_ID,
      },
    },
  };
}
