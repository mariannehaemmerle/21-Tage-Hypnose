import React, { useState } from "react";
import { Button } from "./components/ui/button.jsx";
import { Input } from "./components/ui/input.jsx";
import { Textarea } from "./components/ui/textarea.jsx";
import { Progress } from "./components/ui/progress.jsx";

export default function App() {
  const [text, setText] = useState("");
  const [progress, setProgress] = useState(0);

  return (
    <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:520,background:"#fff",border:"1px solid #eee",borderRadius:16,padding:16}}>
        <h1 style={{marginTop:0}}>21-Tage App</h1>
        <Input placeholder="Dein Name" value={text} onChange={e=>setText(e.target.value)} />
        <Textarea placeholder="Notiz…" className="mt-2" value={text} onChange={e=>setText(e.target.value)} />
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <Button onClick={()=>setProgress(p=>Math.min(p+20,100))}>Fortschritt +20%</Button>
          <Button variant="secondary" onClick={()=>setProgress(0)}>Reset</Button>
        </div>
        <div style={{marginTop:12}}>
          <Progress value={progress} />
          <div style={{fontSize:12,color:"#666",marginTop:6}}>Fortschritt: {progress}%</div>
        </div>
      </div>
    </div>
  );
}
