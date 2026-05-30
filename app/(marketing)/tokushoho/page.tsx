export const metadata = {
  title: "特定商取引法に基づく表記 — SheetsAPI",
};

export default function TokushohoPage() {
  return (
    <div className="container mx-auto px-6 max-w-3xl py-16">
      <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--ink)" }}>
        特定商取引法に基づく表記
      </h1>

      <table className="w-full text-sm border-collapse">
        <tbody>
          {[
            ["販売業者", "個人事業主 平川遥斗 (greymoth-jp)"],
            ["代表者", "平川遥斗"],
            ["所在地", "〒 — 請求があり次第、遅滞なく開示します"],
            ["連絡先", "m.hirakawa07@icloud.com"],
            ["販売価格", "各プランページに記載の金額 (税込)。Free: $0、Starter: $9/月、Dev: $19/月、Team: $49/月"],
            ["代金の支払時期", "クレジットカード即時決済 (Stripe)"],
            ["代金の支払方法", "クレジットカード (Visa / Mastercard / American Express / JCB)"],
            ["商品の引渡し時期", "決済完了後、即時にサービスへのアクセスが有効化されます"],
            ["返品・キャンセル", "デジタルサービスの性質上、原則として返金はお断りしています。ただし、法令に基づく返金請求はこの限りではありません。サブスクリプションは次回請求日の前にキャンセル可能です。"],
            ["動作環境", "最新版の Chrome / Safari / Firefox / Edge が必要です"],
            ["販売数量の制限", "Free プランは1ユーザー1プロジェクト。各プランの制限はPricingページを参照してください"],
          ].map(([label, value]) => (
            <tr
              key={label}
              className="border-b"
              style={{ borderColor: "var(--hairline)" }}
            >
              <td
                className="py-3 pr-6 align-top font-medium w-40 text-sm"
                style={{ color: "var(--ink-muted)" }}
              >
                {label}
              </td>
              <td className="py-3 text-sm" style={{ color: "var(--ink)" }}>
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-8 text-xs" style={{ color: "var(--ink-subtle)" }}>
        ※ 本表記は特定商取引に関する法律第11条に基づく表記です。<br />
        ※ 消費税は各価格に含まれます。
      </p>
    </div>
  );
}
