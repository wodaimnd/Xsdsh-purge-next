import { React } from "../../host/react";
import { PurgeSelect } from "../../components/PurgeSelect";
import type { CleanController } from "./useCleanController";
import type { CleanStatus, Patch } from "./types";
import { bucket, bucketLabels, buckets, filterRows, patchRows, selectedIds, tally } from "./patch-model";
import type { Bucket } from "./patch-model";
import { NoticeView } from "./primitives";
import { backupLabel } from "./revert-model";
import { RevertDetails } from "./RevertDetails";

const FILTER_OPTIONS = [{ value: "all", label: "全部状态" }, ...buckets.map(key => ({ value: key, label: bucketLabels[key] }))];
/* 只改界面显示名，后端 layer 与快照保持原样。 */
const LAYER_LABELS: Record<string, string> = { "0.1.5 兼容": "DSH 0.1.5 兼容组", "0.2.0 兼容": "DSH 0.2.0 兼容组" };
const layerLabel = (layer: string) => LAYER_LABELS[layer] ?? layer;
const LAYER_NOTE = "按 DSH 该代结构/接入点分组的补丁，用于追版；新版本仍可能命中。";

export function PatchCounts({ rows, known }: { rows: Patch[]; known: boolean }) {
  const counts = tally(rows);
  return <><div className="clean9-counts">{buckets.map(key => <span key={key} className={"is-" + key}><b>{known ? counts[key] : "—"}</b><span>{bucketLabels[key]}</span></span>)}</div>
    <div className="clean9-progress" aria-hidden="true">{known && counts.total > 0 && buckets.map(key => <span key={key} className={"is-" + key} style={{ width: (counts[key] / counts.total * 100) + "%" }} />)}</div></>;
}
export function PatchHealth({ status }: { status: CleanStatus | null }) {
  const known = status?.ok === true && !status.status_unknown;
  return <div className="clean9-health">
    <span><b>shim</b> {known ? ["cmd", "ps1", "bin"].map(key => `${key}: ${String(status?.["shim_" + key] || "未知")}`).join(" · ") : "未知"}</span>
    <span title="仅统计普通宿主补丁文件的可读非空备份；不含 shim、归档和快通道记录。快通道数量未知。"><b>备份</b> {backupLabel(status)}</span>
    <span><b>落点</b> {known ? status?.ai_base || (status?.apply_running ? "正在定位" : "未定位") : "未知"}</span>
  </div>;
}
export function PatchPanel({ controller }: { controller: CleanController }) {
  const c = controller;
  const rows = patchRows(c.catalogue, c.status);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<Bucket | "all">("all");
  const [selection, setSelection] = React.useState<Set<number>>(new Set());
  const [expanded, setExpanded] = React.useState(false);
  const visible = filterRows(rows, search, filter);
  const ids = selectedIds(rows, selection);
  const layers = Array.from(new Set(rows.map(row => row.layer)));
  const pending = rows.filter(row => row.status === "pending").map(row => row.id);
  const counts = tally(rows);
  const known = c.catalogueReady && c.status !== null;
  /* 应用按钮按状态出现：能应用的只有待应用/未匹配；全部到位后不再留一个灰按钮。 */
  const applicable = (row: Patch) => { const state = bucket(row.status); return state === "pending" || state === "unmatched"; };
  const remaining = rows.filter(row => (["pending", "unmatched", "missing", "unknown"] as Bucket[]).includes(bucket(row.status))).length;
  const toggle = (id: number) => setSelection(previous => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return <section>
    <PatchCounts rows={rows} known={known} />
    <PatchHealth status={c.status} />
    {c.status?.status_unknown && <p role="alert">状态未知，当前显示最后已知状态。{c.status.status_error}</p>}
    {c.catalogueError && <p role="alert">补丁目录读取失败：{c.catalogueError}</p>}
    <details className="clean9-diagnostics"><summary>运行诊断</summary>
      <p>备份：{backupLabel(c.status)}。仅计普通宿主补丁文件的可读非空备份，按文件去重；不含 shim、归档及快通道记录，不能等同于全部可恢复项目数。</p>
      <p>宿主：{String(c.status?.surface || "未知")} · 插件：{String(c.status?.plugin_version || "未知")}</p>
      <p>提示词注入：{String(c.status?.override_status || "未知")}</p>
      <p>上次回退原因：{c.status?.status_unknown ? "未知" : String(c.status?.fastpath_last_error || "未报告")}</p>
      <p>应用阶段：{String(c.status?.apply_phase || "未报告")}</p>
      <p>旧路残留：{c.status?.status_unknown || !c.status ? "未知" : c.status.legacy_residue === true ? "存在" : c.status.legacy_residue === false ? "未发现" : "未报告"}</p>
    </details>
    <div className="clean9-toolbar">
      <input type="search" aria-label="搜索补丁" placeholder="搜索 ID / 名称 / 文件 / 说明" value={search} onChange={event => setSearch(event.target.value)} />
      <PurgeSelect aria-label="筛选补丁状态" value={filter} onChange={value => setFilter(value as Bucket | "all")} options={FILTER_OPTIONS} />
      <button type="button" disabled={!visible.length} onClick={() => setSelection(previous => new Set([...previous, ...visible.map(row => row.id)]))}>全选可见</button>
      <button type="button" disabled={!ids.length} onClick={() => setSelection(new Set())}>清空选择</button>
      {ids.length > 0 && <button type="button" disabled={c.busy || !c.catalogueReady} onClick={() => {
        const targets = ids;
        void Promise.resolve(c.action("apply", targets)).then(ok => { if (ok) setSelection(new Set()); });
      }}>应用选中 {ids.length}</button>}
    </div>
    <div className="clean9-filters"><button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>全部 {counts.total}</button>{buckets.map(key => <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>{bucketLabels[key]} {counts[key]}</button>)}<button type="button" onClick={() => setExpanded(value => !value)}>{expanded ? "全部收起" : "全部展开"}</button></div>
    <p className="clean9-muted">「应用全部」是完整清洗：解包/换 asar、装 shim、修 CLI、写入提示词覆盖，完成后会提示重启；「应用选中」只写本次所选补丁，需要你完全退出 DSH 后重新打开才生效。重启完成前不代表宿主行为已改变。</p>
    {layers.map(layer => {
      const full = rows.filter(row => row.layer === layer);
      const shown = visible.filter(row => row.layer === layer);
      const totals = tally(full);
      if (!shown.length) return null;
      return <details className="clean9-layer" key={layer + String(expanded)} open={expanded}><summary><strong>{layerLabel(layer)}</strong><span>{totals.total} 条 · {buckets.map(key => `${totals[key]} ${bucketLabels[key]}`).join(" / ")}</span></summary>
        {LAYER_LABELS[layer] && <p className="clean9-layer-note">{LAYER_NOTE}</p>}
        {shown.map(row => <div className="clean9-patch-row" key={row.id}>
          <input type="checkbox" aria-label={`选择补丁 #${row.id}`} checked={selection.has(row.id)} onChange={() => toggle(row.id)} />
          <details><summary><span>#{row.id} {row.name}</span><span className={"clean9-status is-" + bucket(row.status)}>{bucketLabels[bucket(row.status)]}</span></summary><p>{row.desc || "后端未提供说明"}</p>{row.file && <p>{row.file}</p>}<p>原始状态：{row.status} · {row.applicable === false ? "本端不适用" : "本端适用"} · {row.enabled === false ? "设置已关闭" : "设置已启用"}</p></details>
          {applicable(row) && <button type="button" disabled={c.busy || !c.catalogueReady} onClick={() => { void c.action("apply", [row.id]); }} aria-label={`应用补丁 #${row.id}`}>应用</button>}
        </div>)}
      </details>;
    })}
    {!visible.length && <p>{c.catalogueReady ? "没有匹配的补丁。" : "正在读取补丁目录…"}</p>}
    <footer className="clean9-actions"><span>显示 {visible.length} / {rows.length} 条</span>
      {pending.length > 0 && <button type="button" disabled={c.busy || c.status?.status_unknown === true} onClick={() => { void c.action("apply", pending); }}>应用 {pending.length} 项待应用</button>}
      {remaining > 0
        ? <button type="button" title="全量清洗：解包/换 asar、装 shim、修 CLI、写入提示词覆盖，完成后提示重启" disabled={c.busy || !rows.length} onClick={() => { void c.action("apply"); }}>应用全部 {rows.length} 项</button>
        : <span className="clean9-muted">{rows.length ? "全部已应用" : ""}</span>}
      <button type="button" disabled={c.busy} onClick={() => { void c.action("revert"); }}>还原</button>
      {c.status?.legacy_residue === true && !c.status.status_unknown && <button type="button" disabled={c.busy} onClick={() => { void c.action("cleanup-residue"); }}>清理旧路残留</button>}
      <button type="button" onClick={() => { void c.refresh(); void c.refreshCatalogue(); }}>重新检测状态</button>
    </footer>
    {c.busy && <p role="status">正在处理，已等待 {c.waitSeconds} 秒{c.status?.status_unknown ? " · 后端状态未知" : ""}</p>}
    <NoticeView notice={c.notice} />
    <RevertDetails result={c.revertResult} />
  </section>;
}
