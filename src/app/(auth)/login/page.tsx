"use client";

import {
  confirmSignIn,
  getCurrentUser,
  signIn,
  signOut,
  type SignInOutput,
  type UserAttributeKey,
} from "@aws-amplify/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { isCognitoMisconfigured } from "@/lib/cognito-env";

const COGNITO_CONFIG_SHORT =
  "Cognito の User Pool ID とアプリクライアント ID（環境変数）を確認してください。";

const DEV_AUTO_LOGIN_KEY = "fk-dev-auto-login-attempted";
const DEV_AUTO_LOGIN_PENDING = "fk-dev-auto-login-pending";

const ATTRIBUTE_LABELS: Partial<Record<UserAttributeKey, string>> = {
  email: "メールアドレス",
  phone_number: "電話番号（例: +819012345678）",
  name: "氏名",
  preferred_username: "表示ユーザー名",
  nickname: "ニックネーム",
};

function formatAuthError(err: unknown): string {
  const raw =
    err instanceof Error ? err.message : "ログインに失敗しました";
  return raw.includes("placeholder") || raw.includes("does not exist")
    ? `${raw}\n\n${COGNITO_CONFIG_SHORT}`
    : raw;
}

function unhandledSignInMessage(nextStep: SignInOutput["nextStep"]): string {
  const step = nextStep.signInStep;
  if (step === "CONFIRM_SIGN_UP") {
    return "サインアップの確認が必要です。メールの確認コードで登録を完了してください。";
  }
  if (step === "RESET_PASSWORD") {
    return "パスワードリセットが必要です。パスワード忘れの手順を利用してください。";
  }
  return `追加の認証手順が必要です（${step}）。MFA 等が有効な場合は管理者に確認してください。`;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [missingAttributes, setMissingAttributes] = useState<
    UserAttributeKey[]
  >([]);
  const [requiredAttributeValues, setRequiredAttributeValues] = useState<
    Partial<Record<UserAttributeKey, string>>
  >({});
  const [authPhase, setAuthPhase] = useState<"credentials" | "newPassword">(
    "credentials",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [devLoginMessage, setDevLoginMessage] = useState<string | null>(null);
  const devLoginStarted = useRef(false);

  const resetNewPasswordForm = useCallback(() => {
    setNewPassword("");
    setNewPasswordConfirm("");
    setMissingAttributes([]);
    setRequiredAttributeValues({});
    setAuthPhase("credentials");
  }, []);

  const handleSignInResult = useCallback(
    async (result: SignInOutput): Promise<boolean> => {
      if (result.isSignedIn) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(DEV_AUTO_LOGIN_PENDING);
          sessionStorage.setItem(DEV_AUTO_LOGIN_KEY, "1");
        }
        setDevLoginMessage(null);
        resetNewPasswordForm();
        router.push("/purchase-score");
        router.refresh();
        return true;
      }

      if (
        result.nextStep.signInStep ===
        "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        const missing = result.nextStep.missingAttributes ?? [];
        setMissingAttributes(missing);
        const initial: Partial<Record<UserAttributeKey, string>> = {};
        for (const key of missing) {
          initial[key] = "";
        }
        setRequiredAttributeValues(initial);
        setNewPassword("");
        setNewPasswordConfirm("");
        setAuthPhase("newPassword");
        setErrorMessage(null);
        return false;
      }

      setErrorMessage(unhandledSignInMessage(result.nextStep));
      return false;
    },
    [resetNewPasswordForm, router],
  );

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then(() => {
        if (!cancelled) {
          router.replace("/purchase-score");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsCheckingSession(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (isCheckingSession) {
      return;
    }
    if (isCognitoMisconfigured()) {
      return;
    }
    if (devLoginStarted.current) {
      return;
    }
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem(DEV_AUTO_LOGIN_KEY)) {
        return;
      }
      if (sessionStorage.getItem(DEV_AUTO_LOGIN_PENDING)) {
        return;
      }
      sessionStorage.setItem(DEV_AUTO_LOGIN_PENDING, "1");
    }

    devLoginStarted.current = true;

    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/dev/login-credentials", {
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) {
          devLoginStarted.current = false;
          sessionStorage.removeItem(DEV_AUTO_LOGIN_PENDING);
          return;
        }
        const body = (await res.json()) as {
          email?: string;
          password?: string;
        };
        if (!body.email || !body.password || cancelled) {
          devLoginStarted.current = false;
          sessionStorage.removeItem(DEV_AUTO_LOGIN_PENDING);
          return;
        }

        setUsername(body.email);
        setPassword(body.password);
        setDevLoginMessage("開発環境: .env の認証情報でログインしています…");
        setIsSubmitting(true);
        setErrorMessage(null);

        const result = await signIn({
          username: body.email,
          password: body.password,
        });

        if (cancelled) {
          return;
        }

        const done = await handleSignInResult(result);
        if (done) {
          return;
        }

        if (
          result.nextStep.signInStep ===
          "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
        ) {
          setDevLoginMessage(
            "初回ログインのため、メールで届いた一時パスワードの次に、新しいパスワードを設定してください。",
          );
          sessionStorage.removeItem(DEV_AUTO_LOGIN_PENDING);
        } else {
          setDevLoginMessage(null);
          sessionStorage.removeItem(DEV_AUTO_LOGIN_PENDING);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setErrorMessage(formatAuthError(err));
          setDevLoginMessage(null);
        }
        sessionStorage.removeItem(DEV_AUTO_LOGIN_PENDING);
      } finally {
        if (!cancelled) {
          setIsSubmitting(false);
        }
        if (
          typeof window !== "undefined" &&
          !sessionStorage.getItem(DEV_AUTO_LOGIN_KEY)
        ) {
          devLoginStarted.current = false;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handleSignInResult, isCheckingSession, router]);

  async function handleSubmitCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    if (isCognitoMisconfigured()) {
      setErrorMessage(COGNITO_CONFIG_SHORT);
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await signIn({ username, password });
      await handleSignInResult(result);
    } catch (err: unknown) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitNewPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 8) {
      setErrorMessage("新しいパスワードは 8 文字以上にしてください。");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setErrorMessage("新しいパスワードと確認用が一致しません。");
      return;
    }

    for (const key of missingAttributes) {
      const v = requiredAttributeValues[key]?.trim();
      if (!v) {
        setErrorMessage(
          `${ATTRIBUTE_LABELS[key] ?? key} を入力してください。`,
        );
        return;
      }
    }

    const userAttributes: Partial<Record<UserAttributeKey, string>> = {};
    for (const key of missingAttributes) {
      const v = requiredAttributeValues[key]?.trim();
      if (v) {
        userAttributes[key] = v;
      }
    }

    setIsSubmitting(true);
    try {
      const result = await confirmSignIn({
        challengeResponse: newPassword,
        options:
          Object.keys(userAttributes).length > 0
            ? { userAttributes }
            : undefined,
      });
      const done = await handleSignInResult(result);
      if (!done && !result.isSignedIn) {
        setErrorMessage(unhandledSignInMessage(result.nextStep));
      }
    } catch (err: unknown) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAbandonNewPassword() {
    setErrorMessage(null);
    setDevLoginMessage(null);
    try {
      await signOut();
    } catch {
      /* 未完了サインインでは失敗することがある */
    }
    resetNewPasswordForm();
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(DEV_AUTO_LOGIN_PENDING);
      sessionStorage.removeItem(DEV_AUTO_LOGIN_KEY);
    }
    devLoginStarted.current = false;
  }

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6">
        <p className="text-sm text-stone-500">確認中…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-6 py-14 sm:px-10">
      <div className="w-full max-w-[420px]">
        <header className="text-center">
          <p className="font-brand text-[calc(0.8125rem*1.5)] font-semibold uppercase tracking-[0.28em] text-[#8B0000]">
            Fire Kids
          </p>
          <h1 className="font-display mt-4 text-[2rem] font-semibold leading-tight tracking-tight text-stone-900 sm:text-[2.35rem]">
            ログイン
          </h1>
        </header>

        {devLoginMessage ? (
          <p className="mt-4 text-center text-sm text-stone-600">
            {devLoginMessage}
          </p>
        ) : null}

        {authPhase === "credentials" ? (
          <form
            className="mt-10 flex flex-col gap-6"
            onSubmit={handleSubmitCredentials}
          >
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-medium uppercase tracking-wider text-stone-500"
                htmlFor="username"
              >
                ユーザー名
              </label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                className="rounded-sm border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-900 shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-stone-400 focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/35"
                placeholder="例: tanaka@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-medium uppercase tracking-wider text-stone-500"
                htmlFor="password"
              >
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="rounded-sm border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-900 shadow-sm outline-none transition-[border-color,box-shadow] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/35"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {errorMessage ? (
              <p
                className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm whitespace-pre-line text-red-800"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-sm bg-[#8B0000] px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6d0000] disabled:pointer-events-none disabled:opacity-60"
              >
                {isSubmitting ? "送信中…" : "ログイン"}
              </button>
              <Link
                href="/"
                className="inline-flex h-11 flex-none items-center justify-center rounded-sm border border-[#8B0000] bg-transparent px-5 text-sm font-medium text-[#8B0000] transition-colors hover:bg-[#8B0000]/[0.06]"
              >
                トップへ
              </Link>
            </div>
          </form>
        ) : (
          <form
            className="mt-10 flex flex-col gap-6"
            onSubmit={handleSubmitNewPassword}
          >
            <div className="rounded-sm border border-stone-200 bg-stone-50 px-3.5 py-3 text-sm text-stone-700">
              <p className="font-medium text-stone-900">新しいパスワードの設定</p>
              <p className="mt-2 leading-relaxed">
                Cognito の初回サインインのため、メールで届いた一時パスワードのあとに使う
                <strong className="font-medium">新しいパスワード</strong>
                を決めてください（8 文字以上）。
              </p>
              <p className="mt-2 text-xs text-stone-500">
                ユーザー:{" "}
                <span className="font-mono text-stone-700">{username}</span>
              </p>
            </div>

            {missingAttributes.map((key) => (
              <div key={key} className="flex flex-col gap-2">
                <label
                  className="text-xs font-medium uppercase tracking-wider text-stone-500"
                  htmlFor={`attr-${key}`}
                >
                  {ATTRIBUTE_LABELS[key] ?? key}
                  <span className="text-red-700">（必須）</span>
                </label>
                <input
                  id={`attr-${key}`}
                  name={`attr-${key}`}
                  type="text"
                  autoComplete="off"
                  className="rounded-sm border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-900 shadow-sm outline-none transition-[border-color,box-shadow] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/35"
                  value={requiredAttributeValues[key] ?? ""}
                  onChange={(e) =>
                    setRequiredAttributeValues((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-medium uppercase tracking-wider text-stone-500"
                htmlFor="new-password"
              >
                新しいパスワード
              </label>
              <input
                id="new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                className="rounded-sm border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-900 shadow-sm outline-none transition-[border-color,box-shadow] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/35"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-medium uppercase tracking-wider text-stone-500"
                htmlFor="new-password-confirm"
              >
                新しいパスワード（確認）
              </label>
              <input
                id="new-password-confirm"
                name="newPasswordConfirm"
                type="password"
                autoComplete="new-password"
                className="rounded-sm border border-stone-200 bg-white px-3.5 py-3 text-sm text-stone-900 shadow-sm outline-none transition-[border-color,box-shadow] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/35"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                required
                minLength={8}
              />
            </div>

            {errorMessage ? (
              <p
                className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm whitespace-pre-line text-red-800"
                role="alert"
              >
                {errorMessage}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-sm bg-[#8B0000] px-6 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#6d0000] disabled:pointer-events-none disabled:opacity-60"
              >
                {isSubmitting ? "設定中…" : "パスワードを設定してログイン"}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleAbandonNewPassword()}
                className="inline-flex h-11 flex-none items-center justify-center rounded-sm border border-stone-300 bg-white px-5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:pointer-events-none disabled:opacity-60"
              >
                ログインに戻る
              </button>
              <Link
                href="/"
                className="inline-flex h-11 flex-none items-center justify-center rounded-sm border border-[#8B0000] bg-transparent px-5 text-sm font-medium text-[#8B0000] transition-colors hover:bg-[#8B0000]/[0.06]"
              >
                トップへ
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
