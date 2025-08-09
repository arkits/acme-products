import { useCallback, useState } from "react";

export default function FileDropzone({ onTextLoaded, accept = ".json,.avsc,.yaml,.yml" }: { onTextLoaded: (text: string) => void; accept?: string }) {
  const [isDragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result);
        onTextLoaded(text);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Failed to read file");
      }
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
  }, [onTextLoaded]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); onFiles(e.dataTransfer.files); }}
      className={`rounded-lg p-4 text-sm text-zinc-400 glass ${isDragging ? "ring-2 ring-sky-500/40" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-zinc-300">Upload schema file</div>
          <div className="text-xs">Drag & drop or click to select ({accept})</div>
          {error && <div className="mt-2 text-xs text-rose-400">{error}</div>}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 btn-ghost">
          <input type="file" className="hidden" accept={accept} onChange={(e) => onFiles(e.target.files)} />
          Browse...
        </label>
      </div>
    </div>
  );
}


