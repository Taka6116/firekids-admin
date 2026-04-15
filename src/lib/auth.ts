import { fetchAuthSession, signOut } from "@aws-amplify/auth";

export async function getJwtToken(): Promise<string> {
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  if (!token) {
    throw new Error("認証セッションが無効です");
  }
  return token;
}

/** Cognito からサインアウト（グローバル）。ヘッダー等から呼び出し用 */
export async function signOutUser(): Promise<void> {
  await signOut({ global: true });
}
