"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState<"spreadsheet" | "sheets" | "done">("spreadsheet");
  const [spreadsheets, setSpreadsheets] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedSsId, setSelectedSsId] = useState("");
  const [selectedSsName, setSelectedSsName] = useState("");
  const [sheets, setSheets] = useState<Array<{ title: string; sheetId: number }>>([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [preview, setPreview] = useState<Array<Record<string, string>>>([]);
  const [projectName, setProjectName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadSpreadsheets() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sheets/list");
      if (!res.ok) {
        const d = await res.json();
        if (d.code === "NO_GOOGLE_TOKEN") {
          setError("Google account not connected. Please connect in Settings first.");
        } else {
          setError(d.error ?? "Failed to load spreadsheets");
        }
        return;
      }
      const data = await res.json();
      setSpreadsheets(data.spreadsheets);
      setStep("spreadsheet");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function selectSpreadsheet(id: string, name: string) {
    setSelectedSsId(id);
    setSelectedSsName(name);
    setProjectName(name);
    setLoading(true);
    try {
      const res = await fetch(`/api/sheets/list?spreadsheetId=${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSheets(data.sheets);
      setStep("sheets");
    } catch {
      setError("Failed to load sheets");
    } finally {
      setLoading(false);
    }
  }

  async function selectSheet(sheetName: string) {
    setSelectedSheet(sheetName);
    setSlug(sheetName.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
    setLoading(true);
    try {
      const res = await fetch(
        `/api/sheets/preview?spreadsheetId=${selectedSsId}&sheet=${encodeURIComponent(sheetName)}`
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPreview(data.rows);
    } catch {
      setError("Failed to preview sheet");
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    if (!projectName.trim() || !slug.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: projectName,
          googleSpreadsheetId: selectedSsId,
          spreadsheetTitle: selectedSsName,
          sheetName: selectedSheet,
          slug,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Failed to create project");
        return;
      }
      const data = await res.json();
      router.push(`/projects/${data.projectId}`);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const columns = preview.length > 0 ? Object.keys(preview[0]).filter((k) => k !== "_row_id") : [];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--ink)" }}>
        New Project
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--ink-muted)" }}>
        Connect a Google Sheet to get a REST API endpoint in seconds.
      </p>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{ background: "color-mix(in srgb, var(--danger) 10%, transparent)", color: "var(--danger)" }}
        >
          {error}
        </div>
      )}

      {/* Step 1: Load Spreadsheets */}
      {spreadsheets.length === 0 && step === "spreadsheet" && (
        <div
          className="p-8 rounded-xl border text-center"
          style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
        >
          <p className="text-sm mb-6" style={{ color: "var(--ink-muted)" }}>
            Select a Google Spreadsheet from your Drive.
          </p>
          <button
            onClick={loadSpreadsheets}
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ background: "var(--focus-primary)", color: "#fff" }}
          >
            {loading ? "Loading..." : "Browse My Spreadsheets"}
          </button>
        </div>
      )}

      {/* Spreadsheet list */}
      {spreadsheets.length > 0 && step === "spreadsheet" && (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--hairline)" }}>
          {spreadsheets.map((ss) => (
            <button
              key={ss.id}
              onClick={() => selectSpreadsheet(ss.id, ss.name)}
              disabled={loading}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left text-sm border-b last:border-b-0 hover:opacity-80 transition-opacity"
              style={{
                background: "var(--surface-1)",
                borderColor: "var(--hairline)",
                color: "var(--ink)",
              }}
            >
              <span>{ss.name}</span>
              <span style={{ color: "var(--ink-subtle)" }}>→</span>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Select Sheet tab */}
      {step === "sheets" && (
        <div>
          <p className="text-sm mb-3" style={{ color: "var(--ink-muted)" }}>
            <strong style={{ color: "var(--ink)" }}>{selectedSsName}</strong> — select a sheet tab:
          </p>
          <div className="rounded-xl border overflow-hidden mb-6" style={{ borderColor: "var(--hairline)" }}>
            {sheets.map((s) => (
              <button
                key={s.sheetId}
                onClick={() => selectSheet(s.title)}
                disabled={loading}
                className="w-full flex items-center justify-between px-5 py-3.5 text-left text-sm border-b last:border-b-0 hover:opacity-80 transition-opacity"
                style={{
                  background: selectedSheet === s.title ? "var(--focus-deep)" : "var(--surface-1)",
                  borderColor: "var(--hairline)",
                  color: selectedSheet === s.title ? "var(--focus-glow)" : "var(--ink)",
                }}
              >
                {s.title}
              </button>
            ))}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mb-6">
              <p className="text-xs mb-2 font-mono" style={{ color: "var(--ink-subtle)" }}>
                Preview ({columns.join(", ")})
              </p>
              <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--hairline)" }}>
                <table className="text-xs w-full">
                  <thead>
                    <tr style={{ background: "var(--surface-2)" }}>
                      {columns.map((col) => (
                        <th
                          key={col}
                          className="px-3 py-2 text-left font-mono"
                          style={{ color: "var(--ink-muted)" }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 3).map((row, i) => (
                      <tr key={i} style={{ borderTop: "1px solid var(--hairline)" }}>
                        {columns.map((col) => (
                          <td
                            key={col}
                            className="px-3 py-2 font-mono truncate max-w-32"
                            style={{ color: "var(--ink-subtle)" }}
                          >
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Project config */}
          {selectedSheet && (
            <div
              className="p-5 rounded-xl border"
              style={{ background: "var(--surface-1)", borderColor: "var(--hairline)" }}
            >
              <div className="mb-4">
                <label className="text-xs mb-1.5 block" style={{ color: "var(--ink-muted)" }}>
                  Project name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--hairline)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </div>
              <div className="mb-4">
                <label className="text-xs mb-1.5 block" style={{ color: "var(--ink-muted)" }}>
                  Endpoint slug
                </label>
                <div className="flex items-center gap-0 rounded-lg overflow-hidden border" style={{ borderColor: "var(--hairline)" }}>
                  <span
                    className="px-3 py-2 text-xs font-mono"
                    style={{ background: "var(--surface-3)", color: "var(--ink-subtle)" }}
                  >
                    GET /api/v1/{"{project-id}"}/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                    className="flex-1 px-3 py-2 text-sm font-mono"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--ink)",
                      outline: "none",
                      border: "none",
                    }}
                  />
                </div>
              </div>
              <button
                onClick={createProject}
                disabled={loading || !projectName.trim() || !slug.trim()}
                className="w-full py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ background: "var(--focus-primary)", color: "#fff" }}
              >
                {loading ? "Creating..." : "Create Project & Get API Key"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
