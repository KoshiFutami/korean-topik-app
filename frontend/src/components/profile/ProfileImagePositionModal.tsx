"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";

type Props = {
  imageUrl: string;
  initialOffsetX: number;
  initialOffsetY: number;
  onSave: (offsetX: number, offsetY: number) => Promise<void>;
  onClose: () => void;
};

export function ProfileImagePositionModal({
  imageUrl,
  initialOffsetX,
  initialOffsetY,
  onSave,
  onClose,
}: Props) {
  const [offsetX, setOffsetX] = useState(initialOffsetX);
  const [offsetY, setOffsetY] = useState(initialOffsetY);
  const [saving, setSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const clamp = (value: number) => Math.max(0, Math.min(100, value));

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !lastPos.current || !containerRef.current) return;
      e.preventDefault();

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();

      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };

      // Convert pixel delta to percentage (container size is used as reference)
      const deltaXPct = (dx / rect.width) * 100;
      const deltaYPct = (dy / rect.height) * 100;

      setOffsetX((prev) => clamp(prev - deltaXPct));
      setOffsetY((prev) => clamp(prev - deltaYPct));
    },
    []
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    lastPos.current = null;
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(offsetX, offsetY);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#0D0F2A] p-6 shadow-2xl">
        <h2 className="mb-1 text-base font-semibold text-[#F0F0FF]">
          画像の表示位置を調整
        </h2>
        <p className="mb-4 text-xs text-[#9499C4]">
          ドラッグして表示したい位置に合わせてください
        </p>

        {/* Preview: circular crop with draggable image */}
        <div className="mb-6 flex justify-center">
          <div
            ref={containerRef}
            className="relative h-48 w-48 cursor-grab overflow-hidden rounded-full border-2 border-[rgba(99,102,241,0.5)] shadow-[0_0_32px_rgba(99,102,241,0.4)] active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <Image
              src={imageUrl}
              alt="プロフィール画像"
              fill
              draggable={false}
              className="select-none object-cover"
              style={{ objectPosition: `${offsetX}% ${offsetY}%` }}
            />
          </div>
        </div>

        {/* Position sliders as a fallback / precise control */}
        <div className="mb-6 space-y-3">
          <div>
            <label className="mb-1 flex justify-between text-xs text-[#9499C4]">
              <span>水平位置</span>
              <span>{Math.round(offsetX)}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={offsetX}
              onChange={(e) => setOffsetX(Number(e.target.value))}
              className="w-full accent-[#6366f1]"
            />
          </div>
          <div>
            <label className="mb-1 flex justify-between text-xs text-[#9499C4]">
              <span>垂直位置</span>
              <span>{Math.round(offsetY)}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={offsetY}
              onChange={(e) => setOffsetY(Number(e.target.value))}
              className="w-full accent-[#6366f1]"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
          <Button variant="ghost" type="button" onClick={onClose}>
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  );
}
