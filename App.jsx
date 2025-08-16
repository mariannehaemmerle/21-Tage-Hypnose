import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Upload, Trash2, File as FileIcon, Download, PlayCircle, Save, Import, RefreshCw, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import * as idb from "idb-keyval";

const DAYS = 21;
const LS_KEY = "journal21:data:v1";
const LS_META = "journal21:filesMeta:v1";

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function extractYouTubeId(url) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.replace("/", "");
    }
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "shorts" || p === "embed");
    if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
    return "";
  } catch {
    return url.length >= 8 ? url : "";
  }
}

function prettyBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

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
      history: [],
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

// 🔑 Zugangscode-Schutz
function AccessGate({ children }) {
  const [ok, setOk] = React.useState(() => localStorage.getItem("journal21:access") === "yes");
  const [input, setInput] = React.useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (input.trim() === "2121") {
      localStorage.setItem("journal21:access", "yes");
      setOk(true);
    } else {
      alert("Falscher Zugangscode.");
    }
  }

  if (ok) return children;
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-6">
      <div className="max-w-md w-full bg-white/90 backdrop-blur border rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold">Geschützter Bereich</h2>
        <p className="text-sm text-zinc-600 mt-1">Bitte gib deinen Zugangscode ein:</p>
        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Zugangscode" />
          <Button type="submit">Öffnen</Button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useJournalState();
  const [filesMeta, setFilesMeta] = useFilesMeta();
  const [query, setQuery] = useState("");
  const fileInputRef = useRef(null);

  const completed = data.days.filter((d) => d.done).length;
  const progress = Math.round((completed / DAYS) * 100);

  return (
    <AccessGate>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-800 p-4 md:p-8">
        <h1 className="text-2xl md:text-4xl font-semibold">21-Tage-Journal</h1>
        <p className="text-sm text-zinc-600">YouTube einbetten · Fortschritt tracken · Dateien hochladen</p>
        <div className="mt-4">
          <Progress value={progress} className="h-3" />
          <p className="text-sm mt-1">{completed}/{DAYS} Tage erledigt</p>
        </div>
      </div>
    </AccessGate>
  );
}
