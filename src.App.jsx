// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Progress } from "./components/ui/progress";
import * as idb from "idb-keyval";

// ---------- Konstante & Keys ----------
const DAYS = 21;
const LS_KEY = "journal21:data:v1";
const LS_META = "journal21:filesMeta:v1"; // { [dayNumber]: FileMeta[] }

// ---------- Hilfsfunktionen ----------
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function extractYouTubeId(urlOrId) {
  if (!urlOrId) return "";
  try {
    const u = new URL(urlOrId);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "shorts" || p === "embed");
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    return "";
  } catch {
    // evtl. hat der Nutzer nur die ID eingegeben
    return urlOrId.length >= 8 ? urlOrId : "";
  }
}
function prettyBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

// ---------- State Hooks ----------
function useJournalState() {
  const [data, setData] = useState(() =>
    loadJSON(LS_KEY, {
      days: Array.from({ length: DAYS }, (_, i) => ({
        day: i + 1,
        videoUrl: "",
        notes: "",
        done: false,
        updatedAt: Date.now(),
      })),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  );
  useEffect(() => {
    saveJSON(LS_KEY, data);
  }, [data]);
  return [data, setData];
}
function useFilesMeta() {
  const [meta, setMeta] = useState(() => loadJSON(LS_META, {}));
  useEffect(() => saveJSON(LS_META, meta), [meta]);
  return [meta, setMeta];
}

// ---------- Zugangsschutz (Code: 2121) ----------
function Gate({ children }) {
  const [ok, setOk] = useState(localStorage.getItem("journal21:access") === "yes");
  const [code, setCode] = useState("");

  function submit(e) {
    e.preventDefault();
    if (code.trim() === "2121") {
      localStorage.setItem("journal21:access", "yes");
      setOk(true);
    } else {
      alert("Falscher Code.");
    }
  }

  if (ok) return children;

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24,
                  background: "linear-gradient(135deg,#f3f3f3,#ffffff,#efefef)" }}>
      <div style={{
        width: "100%", maxWidth: 420, padding: 20,
        background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
        border: "1px solid rgba(234,179,8,0.35)", borderRadius: 16,
        boxShadow: "0 12px 30px rgba(0,0,0,0.08)"
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <img src="/logo.svg" alt="Logo" width="72" height="72"
               style={{ filter: "drop-shadow(0 4px 10px rgba(183,134,42,0.35))" }} />
        </div>
        <h2 style={{ margin: "0 0 8px", textAlign: "center", color: "#a16207" }}>Geschützter Bereich</h2>
        <p style={{ margin: "0 0 12px", color: "#555", textAlign: "center" }}>
          Bitte gib deinen Zugangscode ein (2121).
        </p>
        <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
          <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code" />
          <Button type="submit">Öffnen</Button>
        </form>
      </div>
    </div>
  );
}

// ---------- Haupt-App ----------
export default function App() {
  const [data, setData] = useJournalState();
  const [filesMeta, setFilesMeta] = useFilesMeta();
  const [query, setQuery] = useState("");

  const completed = data.days.filter((d) => d.done).length;
  const progress = Math.round((completed / DAYS) * 100);

  const filteredDays = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.days;
    return data.days.filter(
      (d) =>
        (d.notes || "").toLowerCase().includes(q) ||
        (d.videoUrl || "").toLowerCase().includes(q) ||
        `tag ${d.day}`.includes(q)
    );
  }, [data.days, query]);

  function updateDay(index, patch) {
    setData((prev) => {
      const next = { ...prev, days: [...prev.days] };
      next.days[index] = { ...next.days[index], ...patch, updatedAt: Date.now() };
      next.updatedAt = Date.now();
      return next;
    });
  }

  async function handleFileUpload(dayIndex, files) {
    if (!files || !files.length) return;
    const now = Date.now();
    const dayNumber = dayIndex + 1;
    const metas = [...(filesMeta[dayNumber] || [])];

    for (const f of Array.from(files)) {
      const id = `${now}-${Math.random().toString(36).slice(2, 8)}`;
      await idb.set(`file:${id}`, f);
      metas.push({ id, name: f.name, size: f.size, type: f.type, ts: now });
    }
    setFilesMeta((prev) => ({ ...prev, [dayNumber]: metas }));
  }

  async function handleFileOpen(id) {
    const blob = await idb.get(`file:${id}`);
    if (!blob) return alert("Datei nicht gefunden (evtl. schon gelöscht).");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ""; // Browser zeigt Speichern/Öffnen
    a.target = "_blank";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function handleFileDelete(dayIndex, id) {
    await idb.del(`file:${id}`);
    const dayNumber = dayIndex + 1;
    setFilesMeta((prev) => ({
      ...prev,
      [dayNumber]: (prev[dayNumber] || []).filter((m) => m.id !== id),
    }));
  }

  function resetAll() {
    if (!confirm("Wirklich alles zurücksetzen? (Texte & Dateiverweise)")) return;
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_META);
    location.reload();
  }

  return (
    <Gate>
      <div style={{
        minHeight: "100vh", padding: 24,
        background: "linear-gradient(135deg,#f3f3f3,#ffffff,#efefef)"
      }}>
        {/* Header-Karte */}
        <div style={{
          maxWidth: 1100, margin: "0 auto 16px", padding: 16,
          background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)",
          border: "1px solid rgba(234,179,8,0.3)", borderRadius: 16
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/logo.svg" alt="Logo" width="56" height="56"
                   style={{ filter: "drop-shadow(0 4px 10px rgba(183,134,42,0.35))" }} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#a16207" }}>21-Tage-Journal</div>
                <div style={{ fontSize: 13, color: "#555" }}>YouTube · Notizen · Fortschritt · Datei-Uploads (lokal)</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="secondary" onClick={() => alert("Export folgt in einer späteren Version.")}>Export</Button>
              <Button variant="destructive" onClick={resetAll}>Reset</Button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#555" }}>
              <span>Fortschritt: {completed}/{DAYS} Tage</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <div style={{ marginTop: 12 }}>
            <Input
              placeholder="Suche in Notizen & Links…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid der 21 Tage */}
        <div style={{
          maxWidth: 1100, margin: "0 auto", display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: 16, paddingBottom: 40
        }}>
          {filteredDays.map((d) => {
            const idx = d.day - 1;
            const ytid = extractYouTubeId(d.videoUrl);
            const fmeta = filesMeta[d.day] || [];

            return (
              <div key={d.day} style={{
                background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 12
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontWeight: 600 }}>Tag {d.day}</div>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#444" }}>
                    <input
                      type="checkbox"
                      checked={d.done}
                      onChange={(e) => updateDay(idx, { done: e.target.checked })}
                    />
                    Erledigt
                  </label>
                </div>

                {/* YouTube */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>YouTube-URL oder Video-ID</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Input
                      value={d.videoUrl}
                      onChange={(e) => updateDay(idx, { videoUrl: e.target.value })}
                      placeholder="https://youtu.be/… oder ID"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!d.videoUrl) return;
                        const id = extractYouTubeId(d.videoUrl);
                        if (!id) return alert("Konnte keine Video-ID finden.");
                        updateDay(idx, { videoUrl: `https://www.youtube.com/watch?v=${id}` });
                      }}
                    >
                      Bereinigen
                    </Button>
                  </div>

                  {ytid ? (
                    <div style={{
                      marginTop: 8, width: "100%", aspectRatio: "16/9",
                      borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb"
                    }}>
                      <iframe
                        title={`Tag ${d.day} Video`}
                        src={`https://www.youtube.com/embed/${ytid}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{ width: "100%", height: "100%", border: "0" }}
                      />
                    </div>
                  ) : null}
                </div>

                {/* Notizen */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Notizen</div>
                  <Textarea
                    value={d.notes}
                    onChange={(e) => updateDay(idx, { notes: e.target.value })}
                    placeholder="Erkenntnisse, Aufgaben, Affirmationen…"
                  />
                </div>

                {/* Dateien */}
                <div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>Dateien hochladen</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      id={`file-${d.day}`}
                      type="file"
                      multiple
                      style={{ display: "none" }}
                      onChange={(e) => handleFileUpload(idx, e.target.files)}
                    />
                    <label htmlFor={`file-${d.day}`}>
                      <
