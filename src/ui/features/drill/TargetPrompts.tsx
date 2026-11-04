/** @jsx h */
import { h } from "../../host/react";
import { PromptsTab } from "./prompts.js";

type Request = (payload: { op: string; [key: string]: unknown }) => Promise<unknown>;

/** 目标级角色提示词：保存后覆盖全局模板，恢复默认回落到全局/内置。 */
export function TargetPrompts({ engagement, refreshKey = 0, request }: {
  engagement?: string | null;
  refreshKey?: number;
  request?: Request;
}) {
  if (!engagement?.trim()) return null;
  return <section className="xsdsh-target-prompts" aria-label="当前靶标角色提示词">
    <div className="rt-card">
      <PromptsTab engagement={engagement} refreshKey={refreshKey} request={request} />
    </div>
  </section>;
}
