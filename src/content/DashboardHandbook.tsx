"use client";

import { DashboardCard } from "@/components/layout/DashboardCard";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 rounded-sm bg-stone-100 px-3 py-2 font-mono text-xs text-stone-900">
      {children}
    </p>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{children}</p>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 font-medium text-stone-900">{title}</h3>
      {children}
    </div>
  );
}

// ─── 各タブのコンテンツ ───────────────────────────────────────────

function PurchaseScoreTab() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-stone-800">
      <p className="text-muted-foreground">
        このページは、スコア画面に表示している数値が「どのデータを使って」「どの計算式で」出ているかをまとめたものです。
      </p>

      <Section title="仕入れ優先スコア（テーブルの 0〜100 の数字）">
        <p>
          テーブルの各行に表示している{" "}
          <code className="rounded bg-stone-100 px-1">score</code> は、
          バックエンドの API（
          <code className="rounded bg-stone-100 px-1">GET /admin/purchase-score</code>）が返した値をそのまま表示しています。
          このフロント画面では在庫数や粗利からスコアを再計算していません。
        </p>
        <Note>モック中は src/lib/mockData.ts に書かれた整数がそのまま入ります。</Note>
      </Section>

      <Section title="ヴィンテージ時計需要インデックス（画面上部の大きい数字）">
        <p>
          フィルター適用後の一覧の全行スコアを足して行数で割った平均に、1.15 をかけて四捨五入した値です。
        </p>
        <Formula>
          需要インデックス = round( 全行スコアの合計 ÷ 行数 × 1.15 )
        </Formula>
        <Note>
          行数が 0 のときは 0 を表示。係数 1.15 はモック用のダミーです。
          本番では API 側で定義される場合があります。
        </Note>
      </Section>

      <Section title="優先件数（スコア 80 以上）">
        <Formula>優先件数 = フィルター後の一覧のうち score ≥ 80 を満たす行の個数</Formula>
      </Section>

      <Section title="要確認件数（スコア 50 未満または保留）">
        <Formula>
          {"要確認件数 = （score < 50）または（推奨 = 保留）を満たす行の個数"}
        </Formula>
        <Note>推奨（action）は API が返す priority / normal / hold のいずれかです。</Note>
      </Section>

      <Section title="ブランドタブ">
        <p>
          タブをクリックするとそのブランドだけに絞り込みます。絞り込みはフィルター（価格帯・仕入区分）と
          組み合わせて適用されます。
        </p>
      </Section>

      <Section title="CSVエクスポート">
        <p>
          ボタン押下時点で画面に表示している行（フィルター＋タブ適用後の結果）をそのままCSVに書き出します。
        </p>
      </Section>
    </div>
  );
}

function MatrixTab() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-stone-800">
      <p className="text-muted-foreground">
        散布図の座標・点の大きさ・4エリアの判定ロジックを説明します。
      </p>

      <Section title="データの出所">
        <p>
          各点は <code className="rounded bg-stone-100 px-1">GET /admin/matrix</code> の{" "}
          <code className="rounded bg-stone-100 px-1">items[]</code> の 1 行です。
          在庫回転月数・粗利率・バブルサイズは API の値をそのまま使います。
        </p>
      </Section>

      <Section title="横軸（回転スピードスコア）">
        <p>
          API の在庫回転月数（turnoverMonths）を「月数が短いほど右になる」スコアに変換しています。
        </p>
        <Formula>x = 120 ÷ max( turnoverMonths, 0.25 )</Formula>
        <Note>月数が 0.25 未満になっても最小値 0.25 で割るため極端な値にはなりません。</Note>
      </Section>

      <Section title="縦軸（粗利率）">
        <p>API の粗利率（%）をそのまま y にしています。加工なしです。</p>
      </Section>

      <Section title="点の大きさ">
        <p>API の bubble_size（整数）を b とすると、描画サイズは次式です。</p>
        <Formula>nodeSize = 10 + b × 5</Formula>
      </Section>

      <Section title="中央値（破線の位置）">
        <p>
          全点の x を昇順に並べた中央値が縦破線、全点の y を昇順に並べた中央値が横破線になります。
          要素数が偶数のときは隣接する 2 つの平均値を使います。
        </p>
      </Section>

      <Section title="4エリア（ゾーン）の判定">
        <p>中央値を M_x・M_y とし、ある点の座標を (x, y) とすると：</p>
        <table className="mt-3 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-stone-200 text-left">
              <th className="py-2 pr-2 font-medium text-stone-900">エリア名</th>
              <th className="py-2 font-medium text-stone-900">条件</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {[
              ["スター", "x ≥ M_x かつ y ≥ M_y"],
              ["金のなる木", "x < M_x かつ y ≥ M_y"],
              ["問題児", "x ≥ M_x かつ y < M_y"],
              ["負け犬", "x < M_x かつ y < M_y"],
            ].map(([name, cond]) => (
              <tr key={name} className="border-b border-stone-100">
                <td className="py-2 pr-2 text-foreground">{name}</td>
                <td className="py-2 font-mono text-[11px] text-stone-800">{cond}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

function BudgetTab() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-stone-800">
      <p className="text-muted-foreground">
        棒グラフ・スライダー・表示金額の計算ロジックです。
      </p>

      <Section title="チャネル別の棒グラフ">
        <p>
          API が返す各チャネルの現在比率（current_ratio）と推奨比率（suggested_ratio）を、
          そのまま棒の高さにしています。
        </p>
      </Section>

      <Section title="スライダー後の正規化（常に合計 100%）">
        <p>
          スライダーを動かすと各ブランドの生の値（r_1 … r_k）の合計 S を求め、
          全ブランドを S で割って 100 を掛けます。
          これにより何をどう動かしても合計が常に 100% になります。
        </p>
        <Formula>p_j = ( r_j ÷ S ) × 100　（S = 0 のときは S := 1）</Formula>
      </Section>

      <Section title="スライダー横に出る推奨額">
        <p>API の総予算（B = total_budget）とブランド j の割合（p_j）から算出します。</p>
        <Formula>金額_j = round( B × p_j ÷ 100 )</Formula>
      </Section>

      <Section title="RUN SIMULATION / PDF">
        <p>
          RUN SIMULATION は現状トースト表示のみでサーバー計算は行いません。
          SAVE EXPORT [PDF] はブラウザの印刷ダイアログを開き、印刷用 HTML を出力します。
        </p>
      </Section>
    </div>
  );
}

function MarketWatchTab() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-stone-800">
      <p className="text-muted-foreground">
        市場価格ウォッチ画面の数値がどのデータから出ているかを説明します。
      </p>

      <Section title="先月・今月の価格（画面の比較軸）">
        <p>
          本番環境では外部市場価格 API から取得します。
          現在はモックデータ（src/lib/mockData.ts の mockMarketWatchItems）の値を表示しています。
          画面上は「先月」「今月」の比較として説明しますが、データ上のフィールド名は
          <code className="rounded bg-stone-100 px-1">last_week_price</code>（先月末相当）、
          <code className="rounded bg-stone-100 px-1">this_week_price</code>（今月末相当）の参考価格（万円）です。
        </p>
      </Section>

      <Section title="変動額・変動率の計算">
        <p>
          変動額と変動率はモックデータに直接入力した値を表示しています。
          本番では API が返した先月・今月の価格から次の式で自動計算する予定です。
        </p>
        <Formula>変動額（万円） = 今月価格 − 先月価格</Formula>
        <Formula>変動率（%） = round( 変動額 ÷ 先月価格 × 100, 小数点1位 )</Formula>
      </Section>

      <Section title="傾向マーク（↑ / ↓ / →）">
        <p>変動額が 0 より大きければ ↑、小さければ ↓、0 なら → を表示します。</p>
      </Section>

      <Section title="サマリーカードの数値">
        <p>
          「仕入れ好機」は先月比で変動率が -2% 以下の銘柄数、「売り時アラート」は +3% 以上の銘柄数です。
          「市場トレンド」は全銘柄の変動率（%）を単純平均し、小数点 1 位で四捨五入しています。
        </p>
        <Formula>平均変動率 = round( 全銘柄の変動率の合計 ÷ 銘柄数, 1 )</Formula>
      </Section>
    </div>
  );
}

function UnrealizedGainTab() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-stone-800">
      <p className="text-muted-foreground">
        含み益トラッカー画面の計算ロジックを説明します。
      </p>

      <Section title="含み益（万円）の計算">
        <p>
          各銘柄について「今の市場価格」から「仕入れたときの価格」を引いた差が含み益です。
          プラスなら値上がり、マイナスなら値下がりしていることを意味します。
        </p>
        <Formula>含み益（万円） = 現在市場価格 − 仕入価格</Formula>
        <Note>
          本番では在庫管理システムの仕入価格と市場価格 API の最新値を掛け合わせて算出します。
          現在はモックデータの値を直接表示しています。
        </Note>
      </Section>

      <Section title="含み益率（%）の計算">
        <p>
          含み益が仕入価格に対して何%かを表します。含み益率が高いほど、仕入れてから価値が上がっています。
        </p>
        <Formula>含み益率（%） = 含み益 ÷ 仕入価格 × 100</Formula>
      </Section>

      <Section title="在庫総含み益・サマリーカード">
        <p>
          「在庫総含み益」は全銘柄の含み益の合計です。カード下の「平均 ○%」は、各銘柄の含み益率を単純平均した目安です。
        </p>
        <Formula>在庫総含み益 = 全銘柄の含み益の合計</Formula>
        <p className="mt-2">
          「今すぐ売却検討」は含み益率が +15% 以上の銘柄数、「要注意（含み損）」は含み益がマイナスの銘柄数です。
          保有期間は仕入日からの経過月数（概算）で、6ヶ月以上かつ含み損の銘柄はカード内で追加警告します。
        </p>
      </Section>

      <Section title="推奨アクション列">
        <p>
          含み益率や含み損・保有月数から、売却・保持・様子見・要対応を自動表示しています（モックのルールベース）。
        </p>
      </Section>

      <Section title="行の背景色">
        <p>含み益がプラスの行は薄い緑、マイナスの行は薄い赤で色分けしています。一覧をパッと見るだけで状況が把握できます。</p>
      </Section>
    </div>
  );
}

function TurnoverAlertTab() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-stone-800">
      <p className="text-muted-foreground">
        回転率アラート画面の計算ロジックとアラート判定の仕組みを説明します。
      </p>

      <Section title="経過月数（elapsed_months）">
        <p>
          その銘柄を仕入れた日から今日まで何ヶ月経っているかを表します。
          本番では在庫管理システムの仕入日と現在日時から自動計算します。
        </p>
        <Formula>経過月数 = （今日の日付 − 仕入日）÷ 30.5日</Formula>
        <Note>現在はモックデータに直接入力した値を使っています。</Note>
      </Section>

      <Section title="想定回転月数（expected_months）">
        <p>
          そのブランド・モデルの過去の販売実績から算出した「平均的に何ヶ月で売れるか」の目安です。
          本番では仕入れ優先スコアの <code className="rounded bg-stone-100 px-1">turnover_months</code> と同じデータソースを使います。
        </p>
      </Section>

      <Section title="乖離（deviation）">
        <p>
          経過月数から想定回転月数を引いた値です。プラスであれば想定より売れるのが遅れていることを意味します。
        </p>
        <Formula>乖離 = 経過月数 − 想定回転月数</Formula>
      </Section>

      <Section title="緊急度（画面上のバッジ）">
        <p>乖離（経過 − 想定）に応じて 4 段階で表示します。</p>
        <table className="mt-3 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-stone-200 text-left">
              <th className="py-2 pr-2 font-medium text-stone-900">表示</th>
              <th className="py-2 font-medium text-stone-900">条件</th>
              <th className="py-2 font-medium text-stone-900">推奨アクション</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {[
              ["緊急", "乖離 ≥ +5ヶ月", "値下げ検討"],
              ["要注意", "+2ヶ月 ≤ 乖離 < +5ヶ月", "販促強化"],
              ["正常", "-1ヶ月 ≤ 乖離 < +2ヶ月", "現状維持"],
              ["優秀", "乖離 < -1ヶ月", "追加仕入れ検討"],
            ].map(([level, cond, desc]) => (
              <tr key={level} className="border-b border-stone-100">
                <td className="py-2 pr-2 text-foreground whitespace-nowrap">{level}</td>
                <td className="py-2 pr-2 font-mono text-[11px] text-stone-800 whitespace-nowrap">{cond}</td>
                <td className="py-2 text-[11px]">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2">
          <Note>
            モックデータの <code className="rounded bg-stone-100 px-1">alert_level</code> は互換のため残していますが、画面の緊急度は上表の乖離ルールで判定しています。
          </Note>
        </div>
      </Section>

      <Section title="推定機会損失額（サマリーカード）">
        <p>
          乖離がプラス（想定より遅い）の銘柄を「滞留」とみなし、それらの仕入価格（万円）を足したあと、平均粗利率 20% を掛けた仮の機会損失の目安です。
        </p>
        <Formula>推定機会損失（万円） = round( Σ(滞留銘柄の仕入価格) × 0.2, 小数1位 )</Formula>
      </Section>

      <Section title="サマリーカードの数値">
        <p>
          「要注意銘柄数」は乖離が +3ヶ月以上の行数、「最長滞留」は経過月数が最大の銘柄、「推定機会損失額」は上記の仮計算です。
        </p>
      </Section>
    </div>
  );
}

// ─── メインコンポーネント ─────────────────────────────────────────

const TABS = [
  { value: "purchase-score", label: "仕入れ優先スコア", Component: PurchaseScoreTab },
  { value: "matrix", label: "マトリクス分析", Component: MatrixTab },
  { value: "budget", label: "予算シミュレータ", Component: BudgetTab },
  { value: "market-watch", label: "市場価格ウォッチ", Component: MarketWatchTab },
  { value: "unrealized-gain", label: "含み益トラッカー", Component: UnrealizedGainTab },
  { value: "turnover-alert", label: "回転率アラート", Component: TurnoverAlertTab },
] as const;

export function DashboardHandbook() {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        各画面の数値が「どのデータを使って」「どの計算式で」出ているかを、コードと同じ前提でまとめたページです。
        タブで画面ごとに切り替えて確認できます。
      </p>

      <DashboardCard>
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-base">ロジック説明書</CardTitle>
          <CardDescription>画面を選んで計算ロジックを確認</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="purchase-score">
            <div className="overflow-x-auto pb-1">
              <TabsList className="mb-4 h-auto min-w-max gap-1 bg-stone-100 p-1">
                {TABS.map(({ value, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="whitespace-nowrap px-3 py-1.5 text-xs"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {TABS.map(({ value, Component }) => (
              <TabsContent key={value} value={value}>
                <Component />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </DashboardCard>
    </div>
  );
}
