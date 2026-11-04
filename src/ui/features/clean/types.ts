import type { Dispatch, SetStateAction, MutableRefObject } from "react";

export type Translate = (key: string, values?: Record<string, string | number>) => string;
export interface Notice { kind: "idle" | "ok" | "busy" | "error"; text: string }
export type JsonRecord = Record<string, unknown>;
export interface Patch { id: number; name: string; desc: string; layer: string; status: string; file?: string; applicable?: boolean; enabled?: boolean }
export interface CleanStatus extends JsonRecord {
  ok?: boolean; status_unknown?: boolean; status_error?: string;
  patch_status?: Record<string, string>; patches?: Patch[];
  ai_base?: string; surface?: string; plugin_version?: string;
  apply_running?: boolean; apply_phase?: string; restart_required?: boolean;
  boot_full_quit?: boolean; hooks_deny_state?: string; has_backup?: boolean;
  backup_count?: number | null;
  restart_mode?: "manual" | "automatic" | "auto" | null;
  scope?: "subset" | "full" | null;
  legacy_residue?: boolean; override_status?: string;
  apply_in_flight?: { since?: number; stale?: boolean };
  uninstall_leftover?: { count: number; path?: string };
}
/** Construct once in the legacy outer adapter; no module-global host bindings. */
export interface CleanRuntime {
  t: Translate;
  apiJson: (path: string, init?: RequestInit) => Promise<unknown>;
  statusApi?: () => Promise<unknown>;
  fetch?: typeof fetch;
  confirm: (message: string) => boolean;
  currentCwd?: () => string;
  glass?: {
    read(): boolean;
    /** Throw when persistence fails; the UI retains the last confirmed value. */
    save(on: boolean): void;
    apply(root: HTMLElement, on: boolean): void;
  };
  restart: (notice: Dispatch<SetStateAction<Notice>>, busy: Dispatch<SetStateAction<boolean>>, t: Translate, surface: string) => boolean;
  afterUninstall?: (surface: string) => void;
}
export interface CleanOperation {
  patchBusy: boolean; setPatchBusy: Dispatch<SetStateAction<boolean>>;
  askRestart: boolean; setAskRestart: Dispatch<SetStateAction<boolean>>;
  snoozeUntilRef: MutableRefObject<number>; actionTicketRef: MutableRefObject<number>;
  /** Independent from timed reminder snooze; survives tab changes in the dock. */
  manualRestartRef?: MutableRefObject<{ ticket: number } | null>;
}
export interface CleanPageProps { runtime: CleanRuntime; op?: CleanOperation }
