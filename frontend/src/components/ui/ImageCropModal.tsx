"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

interface Props {
  file: File;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
}

const CROP_SIZE = 280;
const OUTPUT_SIZE = 400;
const MAX_SCALE = 3;

export function ImageCropModal({ file, onConfirm, onCancel }: Props) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  // Load image as ImageBitmap, respecting EXIF orientation so that
  // bitmap.width/height reflect the visually-displayed dimensions.
  useEffect(() => {
    let bmp: ImageBitmap | null = null;
    const load = async () => {
      try {
        bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      } catch {
        bmp = await createImageBitmap(file);
      }
      const minSc = Math.max(CROP_SIZE / bmp.width, CROP_SIZE / bmp.height);
      setBitmap(bmp);
      setScale(minSc);
      setOffset({ x: 0, y: 0 });
    };
    load().catch(() => undefined);
    return () => {
      bmp?.close();
    };
  }, [file]);

  const clampOffset = useCallback(
    (ox: number, oy: number, sc: number, w: number, h: number) => {
      const maxX = Math.max(0, (w * sc - CROP_SIZE) / 2);
      const maxY = Math.max(0, (h * sc - CROP_SIZE) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, ox)),
        y: Math.max(-maxY, Math.min(maxY, oy)),
      };
    },
    [],
  );

  // Redraw the circular preview canvas whenever bitmap/scale/offset change.
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !bitmap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const displayW = bitmap.width * scale;
    const displayH = bitmap.height * scale;
    const drawX = CROP_SIZE / 2 + offset.x - displayW / 2;
    const drawY = CROP_SIZE / 2 + offset.y - displayH / 2;

    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);
    ctx.save();
    ctx.beginPath();
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(bitmap, drawX, drawY, displayW, displayH);
    ctx.restore();
  }, [bitmap, scale, offset]);

  const startDrag = (mx: number, my: number) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = { mx, my, ox: offset.x, oy: offset.y };
  };

  const moveDrag = useCallback(
    (mx: number, my: number) => {
      if (!isDraggingRef.current || !dragStartRef.current || !bitmap) return;
      const dx = mx - dragStartRef.current.mx;
      const dy = my - dragStartRef.current.my;
      setOffset(
        clampOffset(
          dragStartRef.current.ox + dx,
          dragStartRef.current.oy + dy,
          scale,
          bitmap.width,
          bitmap.height,
        ),
      );
    },
    [scale, bitmap, clampOffset],
  );

  const endDrag = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    };

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", endDrag);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", endDrag);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", endDrag);
    };
  }, [isDragging, moveDrag, endDrag]);

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    if (!bitmap) return;
    setScale(newScale);
    setOffset((prev) =>
      clampOffset(prev.x, prev.y, newScale, bitmap.width, bitmap.height),
    );
  };

  const handleConfirm = () => {
    if (!bitmap) return;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();

    const ratio = OUTPUT_SIZE / CROP_SIZE;
    const drawW = bitmap.width * scale * ratio;
    const drawH = bitmap.height * scale * ratio;
    const drawX = (CROP_SIZE / 2 + offset.x - (bitmap.width * scale) / 2) * ratio;
    const drawY = (CROP_SIZE / 2 + offset.y - (bitmap.height * scale) / 2) * ratio;

    ctx.drawImage(bitmap, drawX, drawY, drawW, drawH);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File(
          [blob],
          file.name.replace(/\.[^.]+$/, ".jpg"),
          { type: "image/jpeg", lastModified: Date.now() },
        );
        onConfirm(croppedFile);
      },
      "image/jpeg",
      0.9,
    );
  };

  const minScale = bitmap
    ? Math.max(CROP_SIZE / bitmap.width, CROP_SIZE / bitmap.height)
    : 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#0f1024] p-6 shadow-2xl">
        <h2 id="crop-modal-title" className="mb-1 text-lg font-bold text-[#F0F0FF]">
          プロフィール画像の調整
        </h2>
        <p className="mb-4 text-xs text-[#9499C4]">
          ドラッグして位置を調整し、スライダーで拡大縮小できます
        </p>

        {/* Circular crop preview rendered via canvas */}
        <div className="mb-4 flex justify-center">
          <canvas
            ref={previewCanvasRef}
            width={CROP_SIZE}
            height={CROP_SIZE}
            style={{
              borderRadius: "50%",
              cursor: isDragging ? "grabbing" : "grab",
              boxShadow: "0 0 0 4px rgba(99,102,241,0.5)",
              background: "#1a1b2e",
              display: "block",
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        </div>

        {/* Zoom slider */}
        <div className="mb-5 flex items-center gap-3">
          <span aria-hidden="true" className="text-sm text-[#9499C4]">A</span>
          <input
            type="range"
            min={minScale}
            max={MAX_SCALE}
            step={0.01}
            value={scale}
            onChange={handleScaleChange}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-[rgba(255,255,255,0.1)] accent-indigo-500"
            aria-label="ズーム（拡大縮小）"
          />
          <span aria-hidden="true" className="text-lg text-[#9499C4]">A</span>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!bitmap}>
            適用
          </Button>
        </div>
      </div>
    </div>
  );
}
