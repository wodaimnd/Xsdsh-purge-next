import { React } from "../../host/react";
import type { JsonRecord } from "./types";
import { revertReport } from "./revert-model";

export function RevertDetails({ result }: { result: JsonRecord | null }) {
  if (!result) return null;
  const report = revertReport(result);
  const count = (value: number | null) => value === null ? "未提供" : String(value);
  return <section className="clean9-revert-results" aria-label="本次还原结果">
    <h3>本次还原结果</h3>
    <p>已还原 {count(report.counts.reverted)} · 无备份 {count(report.counts.noBackup)} · 已是原版 {count(report.counts.alreadyOriginal)} · 错误 {count(report.counts.errors)}</p>
    {typeof result.message === "string" && <p>{result.message}</p>}
    {typeof result.note === "string" && <p>{result.note}</p>}
    {!report.available && <p>当前服务未提供补丁逐文件明细，不能从汇总数量推断文件结果。</p>}
    {report.unpacked && <div className="clean9-revert-fast">
      <p>快通道元数据：撤销 {count(report.unpacked.restored)} 项，已是原始状态 {count(report.unpacked.alreadyRestored)} 项。后端未提供这两项计数对应的逐项路径。</p>
      {report.unpacked.asar && <p>归档：{report.unpacked.asar}</p>}
      {report.unpacked.root && <p>解包目录：{report.unpacked.root}</p>}
      {report.unpacked.error && <p role="alert">{report.unpacked.error}</p>}
    </div>}
    {report.rows.length > 0 ? <div className="clean9-revert-table"><table>
      <thead><tr><th scope="col">文件 / 路径</th><th scope="col">结果</th><th scope="col">说明</th></tr></thead>
      <tbody>{report.rows.map((row, index) => <tr key={index}><td>{row.path}</td><td>{row.outcome}</td><td>{row.detail || "—"}</td></tr>)}</tbody>
    </table></div> : <p>{report.available ? "本次返回的文件明细为空。" : "没有可展示的逐文件结果。"}</p>}
  </section>;
}
