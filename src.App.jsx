// src/App.jsx
import React, { useState } from "react";
import { Button } from "./components/ui.buttons";
import { Input } from "./components/ui.input";
import { Textarea } from "./components/ui.textarea";
import { Progress } from "./components/ui.progress";

export default function App() {
  const [progress, setProgress] = useState(40);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 space-y-6">
      <h1 className="text-2xl font-bold text-zinc-800">Meine Synapsen App</h1>

      {/* Input-Feld */}
      <Input placeholder="Gib etwas ein..." />

      {/* Textarea */}
      <Textarea placeholder="Längere Texte hier..." />

      {/* Button */}
      <Button onClick={() => setProgress((p) => (p >= 100 ? 0 : p + 10))}>
        Fortschritt erhöhen
      </Button>

      {/* Fortschrittsanzeige */}
      <Progress value={progress} className="w-64" />
    </div>
  );
}
