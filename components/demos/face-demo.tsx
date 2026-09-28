"use client";

import { useEffect, useRef, useState } from "react";
import type { FaceDetector } from "@mediapipe/tasks-vision";
import { DemoShell, ErrorNote, LoadButton } from "@/components/demos/demo-shell";

// Keep in sync with the @mediapipe/tasks-vision version in package.json.
const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

type Stats = { faces: number; ms: number; fps: number };

export function FaceDemo() {
  const [status, setStatus] = useState<"idle" | "loading" | "running" | "stopped" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [delegate, setDelegate] = useState<"GPU" | "CPU">("GPU");
  const [stats, setStats] = useState<Stats>({ faces: 0, ms: 0, fps: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<FaceDetector | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);

  function stopStream() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  useEffect(
    () => () => {
      stopStream();
      detectorRef.current?.close();
    },
    [],
  );

  async function createDetector() {
    const { FilesetResolver, FaceDetector } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
    for (const d of ["GPU", "CPU"] as const) {
      try {
        const detector = await FaceDetector.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: d },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.5,
        });
        setDelegate(d);
        return detector;
      } catch (err) {
        if (d === "CPU") throw err;
      }
    }
    throw new Error("Could not create face detector");
  }

  async function start() {
    setStatus("loading");
    setError(null);
    try {
      detectorRef.current ??= await createDetector();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      setStatus("running");
      loop();
    } catch (err) {
      stopStream();
      const name = err instanceof DOMException ? err.name : "";
      setError(
        name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access in your browser to try the demo."
          : name === "NotFoundError"
            ? "No camera was found on this device."
            : err instanceof Error
              ? err.message
              : String(err),
      );
      setStatus("error");
    }
  }

  function stop() {
    stopStream();
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setStatus("stopped");
  }

  function loop() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const detector = detectorRef.current;
    if (!video || !canvas || !detector) return;
    const ctx = canvas.getContext("2d")!;
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#a78bfa";

    let lastVideoTime = -1;
    let frames = 0;
    let fpsWindowStart = performance.now();
    let msAvg = 0;

    const tick = () => {
      if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (canvas.width !== w) canvas.width = w;
        if (canvas.height !== h) canvas.height = h;

        const t0 = performance.now();
        const { detections } = detector.detectForVideo(video, t0);
        const ms = performance.now() - t0;
        msAvg = msAvg ? msAvg * 0.9 + ms * 0.1 : ms;

        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = accent;
        ctx.fillStyle = accent;
        ctx.lineWidth = 3;
        ctx.font = "500 14px ui-monospace, monospace";
        for (const det of detections) {
          const box = det.boundingBox;
          if (!box) continue;
          // The video is mirrored with CSS; mirror coordinates instead of the canvas so text stays readable.
          const x = w - box.originX - box.width;
          const y = box.originY;
          const bw = box.width;
          const bh = box.height;
          const c = Math.min(bw, bh) * 0.22;
          ctx.beginPath();
          for (const [px, py, dx, dy] of [
            [x, y, 1, 1],
            [x + bw, y, -1, 1],
            [x, y + bh, 1, -1],
            [x + bw, y + bh, -1, -1],
          ]) {
            ctx.moveTo(px + dx * c, py);
            ctx.lineTo(px, py);
            ctx.lineTo(px, py + dy * c);
          }
          ctx.stroke();
          const score = det.categories[0]?.score ?? 0;
          ctx.fillText(`face ${(score * 100).toFixed(0)}%`, x, Math.max(16, y - 10));
          for (const kp of det.keypoints) {
            ctx.beginPath();
            ctx.arc(w - kp.x * w, kp.y * h, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        frames++;
        const now = performance.now();
        if (now - fpsWindowStart >= 500) {
          setStats({ faces: detections.length, ms: msAvg, fps: (frames * 1000) / (now - fpsWindowStart) });
          frames = 0;
          fpsWindowStart = now;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  const running = status === "running";

  return (
    <DemoShell
      id="demo-face"
      title="Real-time face detection"
      description="The detection stage of my attendance system, rebuilt for the browser. It finds faces and landmarks in your webcam feed. It does not identify anyone."
      card={{ model: "BlazeFace (short range)", size: "~230 KB", runtime: `MediaPipe · ${delegate}` }}
    >
      <div className="relative mx-auto aspect-[4/3] max-w-2xl overflow-hidden rounded-xl border border-border bg-bg">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 h-full w-full -scale-x-100 object-cover transition-opacity ${running ? "opacity-100" : "opacity-0"}`}
        />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" aria-hidden />
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <p className="max-w-sm text-sm text-muted">
              Uses your camera locally. Frames are processed on your device and never uploaded or stored.
            </p>
            <LoadButton onClick={start}>{status === "loading" ? "Starting…" : "Start camera"}</LoadButton>
            {error && <ErrorNote message={error} />}
          </div>
        )}
      </div>
      <div className="mx-auto mt-4 flex max-w-2xl items-center justify-between gap-4">
        <dl className="flex gap-6 font-mono text-xs">
          <div>
            <dt className="text-muted">Faces</dt>
            <dd className="text-base text-fg">{running ? stats.faces : "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">Inference</dt>
            <dd className="text-base text-fg">{running ? `${stats.ms.toFixed(1)} ms` : "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">FPS</dt>
            <dd className="text-base text-fg">{running ? stats.fps.toFixed(0) : "—"}</dd>
          </div>
        </dl>
        {running && (
          <button
            type="button"
            onClick={stop}
            className="rounded-full border border-border px-4 py-1.5 text-sm text-muted hover:border-accent hover:text-accent"
          >
            Stop camera
          </button>
        )}
      </div>
    </DemoShell>
  );
}
