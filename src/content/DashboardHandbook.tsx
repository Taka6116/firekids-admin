import { DashboardCard } from "@/components/layout/DashboardCard";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * 説明書ページ本文。数式はフロント実装（hooks・コンポーネント・lib）と一致させる。
 */
export function DashboardHandbook() {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        このページは、画面上の数値が「どのデータから」「どの式で」出ているかを、コードと同じ前提でまとめたものです。API
        が返す項目のうち、本番の算出をバックエンドだけが行うものは、その旨を明記します。
      </p>

      <DashboardCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">仕入れ優先スコア画面</CardTitle>
          <CardDescription>スコア・インデックス・件数の定義</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-relaxed text-stone-800">
          <div>
            <h3 className="mb-2 font-medium text-stone-900">
              仕入れ優先スコア（各行の 0〜100）
            </h3>
            <p>
              テーブルに表示する各行の <code className="rounded bg-stone-100 px-1">score</code> は、
              <strong className="font-medium">API のレスポンス</strong>（
              <code className="rounded bg-stone-100 px-1">GET /admin/purchase-score</code> が返す{" "}
              <code className="rounded bg-stone-100 px-1">scores[]</code> 各要素の{" "}
              <code className="rounded bg-stone-100 px-1">score</code>
              フィールド）をそのまま表示しています。このフロントでは在庫本数や粗利からスコアを再計算していません。
            </p>
            <p className="mt-2 text-muted-foreground">
              本番でスコアが「何の指標をどう重み付けした結果か」はバックエンドの仕様書を参照してください。モック時は{" "}
              <code className="rounded bg-stone-100 px-1">src/lib/mockData.ts</code> に書かれた整数が入ります。
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">
              ヴィンテージ時計需要インデックス（画面上部の大きい数字）
            </h3>
            <p>
              フィルター適用後の一覧を行番号{" "}
              <code className="rounded bg-stone-100 px-1">i = 1 … n</code> とし、各行のスコアを{" "}
              <code className="rounded bg-stone-100 px-1">score_i</code> とします（
              <code className="rounded bg-stone-100 px-1">n = 0</code> のときは{" "}
              <code className="rounded bg-stone-100 px-1">0</code> を表示）。
            </p>
            <p className="mt-2 rounded-sm bg-stone-100 px-3 py-2 font-mono text-xs text-stone-900">
              需要インデックス = round( (score_1 + score_2 + … + score_n) / n × 1.15 )
            </p>
            <p className="mt-2 text-muted-foreground">
              <code className="rounded bg-stone-100 px-1">round</code> は四捨五入（JavaScript の{" "}
              <code className="rounded bg-stone-100 px-1">Math.round</code> と同じ）。係数{" "}
              <code className="rounded bg-stone-100 px-1">1.15</code> はこの画面専用のモック用です。本番の定義は API
              側になる場合があります。
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">優先件数（スコア 80 以上）</h3>
            <p className="rounded-sm bg-stone-100 px-3 py-2 font-mono text-xs text-stone-900">
              優先件数 = （フィルター後の一覧のうち）score_i ≥ 80 を満たす行 i の個数
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">
              要確認件数（スコア 50 未満または保留）
            </h3>
            <p className="rounded-sm bg-stone-100 px-3 py-2 font-mono text-xs text-stone-900">
              {
                "要確認件数 = （フィルター後の一覧のうち）(score_i < 50) または (action_i = \"hold\") を満たす行 i の個数"
              }
            </p>
            <p className="mt-2 text-muted-foreground">
              <code className="rounded bg-stone-100 px-1">action_i</code> は API が返す{" "}
              <code className="rounded bg-stone-100 px-1">priority</code> /{" "}
              <code className="rounded bg-stone-100 px-1">normal</code> /{" "}
              <code className="rounded bg-stone-100 px-1">hold</code> のいずれかです。
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">CSV エクスポート</h3>
            <p>
              ボタン押下時点で画面上に表示している行（フィルター適用後の{" "}
              <code className="rounded bg-stone-100 px-1">scores[]</code> と同じ集合）を、その列のまま CSV
              に書き出します。
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">フィルター</h3>
            <p className="text-muted-foreground">
              ブランド・価格帯・仕入区分は、API へクエリパラメータとして渡り、返却された{" "}
              <code className="rounded bg-stone-100 px-1">scores[]</code> がその条件で絞られた結果です（モック時はクライアント側で同じ条件にフィルタ）。
            </p>
          </div>
        </CardContent>
      </DashboardCard>

      <DashboardCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">マトリクス分析画面</CardTitle>
          <CardDescription>散布図の座標・点の大きさ・4 エリア</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-relaxed text-stone-800">
          <div>
            <h3 className="mb-2 font-medium text-stone-900">データの出所</h3>
            <p>
              各点は <code className="rounded bg-stone-100 px-1">GET /admin/matrix</code> の{" "}
              <code className="rounded bg-stone-100 px-1">items[]</code> の 1 行です。在庫回転（月）・粗利率（%）・バブル用の{" "}
              <code className="rounded bg-stone-100 px-1">bubble_size</code> は API の値を使います。
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">横軸の数値（回転スピード）</h3>
            <p>
              API の在庫回転月数を <code className="rounded bg-stone-100 px-1">turnoverMonths</code> とすると、横座標{" "}
              <code className="rounded bg-stone-100 px-1">x</code> は次式です（
              <code className="rounded bg-stone-100 px-1">src/lib/matrixPlot.ts</code> の{" "}
              <code className="rounded bg-stone-100 px-1">turnoverSpeedScore</code>）。
            </p>
            <p className="mt-2 rounded-sm bg-stone-100 px-3 py-2 font-mono text-xs text-stone-900">
              x = 120 ÷ max(turnoverMonths, 0.25)
            </p>
            <p className="mt-2 text-muted-foreground">
              月数が小さいほど <code className="rounded bg-stone-100 px-1">x</code> は大きくなり、グラフ上では右に寄ります。
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">縦軸</h3>
            <p>
              API の粗利率（%）をそのまま <code className="rounded bg-stone-100 px-1">y</code> にしています。
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">点の大きさ（ピクセル目安）</h3>
            <p>
              API の <code className="rounded bg-stone-100 px-1">bubble_size</code> を{" "}
              <code className="rounded bg-stone-100 px-1">b</code> とすると、散布図の直径に近いサイズは次式です（
              <code className="rounded bg-stone-100 px-1">MatrixScatterPlot</code> 内）。
            </p>
            <p className="mt-2 rounded-sm bg-stone-100 px-3 py-2 font-mono text-xs text-stone-900">
              nodeSize = 10 + b × 5
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">中央値（破線の位置）</h3>
            <p>
              表示中の全点について、上記の <code className="rounded bg-stone-100 px-1">x</code> を昇順に並べた配列を{" "}
              <code className="rounded bg-stone-100 px-1">X</code>、<code className="rounded bg-stone-100 px-1">y</code>{" "}
              を昇順に並べた配列を <code className="rounded bg-stone-100 px-1">Y</code> とします。要素数を{" "}
              <code className="rounded bg-stone-100 px-1">n</code>、中央の添字を{" "}
              <code className="rounded bg-stone-100 px-1">m = floor(n / 2)</code> とします。
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-muted-foreground">
              <li>
                <code className="rounded bg-stone-100 px-1">n</code> が奇数: 横破線の{" "}
                <code className="rounded bg-stone-100 px-1">x</code> = <code className="rounded bg-stone-100 px-1">X[m]</code>、縦破線の{" "}
                <code className="rounded bg-stone-100 px-1">y</code> = <code className="rounded bg-stone-100 px-1">Y[m]</code>
              </li>
              <li>
                <code className="rounded bg-stone-100 px-1">n</code> が偶数: 横は{" "}
                <code className="rounded bg-stone-100 px-1">(X[m-1] + X[m]) / 2</code>、縦は{" "}
                <code className="rounded bg-stone-100 px-1">(Y[m-1] + Y[m]) / 2</code>
              </li>
            </ul>
            <p className="mt-2 text-muted-foreground">
              点が 1 つもない場合は中央値は <code className="rounded bg-stone-100 px-1">0</code> 扱いになります。
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">4 エリア（ゾーン）の判定</h3>
            <p>
              上で求めた横方向の中央値を <code className="rounded bg-stone-100 px-1">M_x</code>、縦方向を{" "}
              <code className="rounded bg-stone-100 px-1">M_y</code> と書きます。ある点の座標を{" "}
              <code className="rounded bg-stone-100 px-1">(x, y)</code> とすると、次のとおりです。
            </p>
            <table className="mt-3 w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-left">
                  <th className="py-2 pr-2 font-medium text-stone-900">表示名</th>
                  <th className="py-2 font-medium text-stone-900">条件（コードと同じ）</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-stone-100">
                  <td className="py-2 pr-2 text-foreground">スター</td>
                  <td className="py-2 font-mono text-[11px] text-stone-800">x ≥ M_x かつ y ≥ M_y</td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-2 pr-2 text-foreground">金のなる木</td>
                  <td className="py-2 font-mono text-[11px] text-stone-800">
                    {"x < M_x かつ y ≥ M_y"}
                  </td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-2 pr-2 text-foreground">問題児</td>
                  <td className="py-2 font-mono text-[11px] text-stone-800">
                    {"x ≥ M_x かつ y < M_y"}
                  </td>
                </tr>
                <tr className="border-b border-stone-100">
                  <td className="py-2 pr-2 text-foreground">負け犬</td>
                  <td className="py-2 font-mono text-[11px] text-stone-800">
                    {"x < M_x かつ y < M_y"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </DashboardCard>

      <DashboardCard>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">予算シミュレータ画面</CardTitle>
          <CardDescription>棒グラフ・スライダー・表示金額</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 text-sm leading-relaxed text-stone-800">
          <div>
            <h3 className="mb-2 font-medium text-stone-900">チャネル別の棒グラフ</h3>
            <p>
              <code className="rounded bg-stone-100 px-1">GET /admin/budget-simulation</code> が返す各チャネルの{" "}
              <code className="rounded bg-stone-100 px-1">current_ratio</code>（現在比率・%）と{" "}
              <code className="rounded bg-stone-100 px-1">suggested_ratio</code>（推奨比率・%）を、そのまま棒の高さにしています。
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">
              Manual Adjustment（スライダー直後の正規化）
            </h3>
            <p>
              ブランド数を <code className="rounded bg-stone-100 px-1">k</code>、スライダー直後の生の値を{" "}
              <code className="rounded bg-stone-100 px-1">r_1 … r_k</code> とします。合計{" "}
              <code className="rounded bg-stone-100 px-1">S = r_1 + … + r_k</code> としたとき、画面上に保持する割合{" "}
              <code className="rounded bg-stone-100 px-1">p_j</code> は次式です（
              <code className="rounded bg-stone-100 px-1">S = 0</code> のときは分母を{" "}
              <code className="rounded bg-stone-100 px-1">1</code> に置き換え）。
            </p>
            <p className="mt-2 rounded-sm bg-stone-100 px-3 py-2 font-mono text-xs text-stone-900">
              p_j = (r_j / S) × 100 （ただし S = 0 なら S := 1）
            </p>
            <p className="mt-2 text-muted-foreground">
              常に <code className="rounded bg-stone-100 px-1">p_1 + … + p_k = 100</code> になります。
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">スライダー横に出る推奨額</h3>
            <p>
              API の総予算を <code className="rounded bg-stone-100 px-1">B</code>（
              <code className="rounded bg-stone-100 px-1">total_budget</code>）とし、ブランド{" "}
              <code className="rounded bg-stone-100 px-1">j</code> の正規化後の割合を{" "}
              <code className="rounded bg-stone-100 px-1">p_j</code> とすると、表示金額は次式です。
            </p>
            <p className="mt-2 rounded-sm bg-stone-100 px-3 py-2 font-mono text-xs text-stone-900">
              金額_j = round( B × (p_j / 100) )
            </p>
            <p className="mt-2 text-muted-foreground">
              <code className="rounded bg-stone-100 px-1">round</code> は{" "}
              <code className="rounded bg-stone-100 px-1">Math.round</code> と同じ四捨五入です。
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-stone-900">RUN SIMULATION / PDF</h3>
            <p>
              RUN SIMULATION は現状、トースト表示のみでサーバー計算は行いません。SAVE EXPORT [PDF] はブラウザの印刷ダイアログを開き、印刷用の HTML
              を出力します。
            </p>
          </div>
        </CardContent>
      </DashboardCard>
    </div>
  );
}
