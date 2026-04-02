"""
从带底色的原图中抠出圆形紫色徽标（仅用于浏览器标签 favicon），圈外透明 → public/favicon.png。
站内大 Logo 请单独使用 public/clan-logo.png（紫川水墨图），本脚本不再覆盖 clan-logo。
用法：在 frontend 目录执行  python scripts/extract-favicon.py
"""
from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

FRONTEND = Path(__file__).resolve().parent.parent
SRC = FRONTEND / "public" / "favicon-source.png"
OUT = FRONTEND / "public" / "favicon.png"


def main() -> int:
    if not SRC.exists():
        print(f"缺少源图: {SRC}", file=sys.stderr)
        return 1

    img = Image.open(SRC).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]

    # 以左上角像素为「背景」参考，从四边做 flood fill，去掉深蓝底
    ref = arr[0, 0, :3].astype(np.float32)
    tol = 48

    def similar(rgb: np.ndarray) -> bool:
        return float(np.linalg.norm(rgb.astype(np.float32) - ref)) < tol

    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        q.append((0, x))
        q.append((h - 1, x))
    for y in range(h):
        q.append((y, 0))
        q.append((y, w - 1))

    while q:
        y, x = q.popleft()
        if visited[y, x]:
            continue
        if not similar(arr[y, x, :3]):
            continue
        visited[y, x] = True
        for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                q.append((ny, nx))

    out = arr.copy()
    out[:, :, 3] = np.where(visited, 0, out[:, :, 3])

    pil = Image.fromarray(out)
    bbox = pil.getbbox()
    if not bbox:
        print("抠图结果为空，请调大 tol 或检查源图", file=sys.stderr)
        return 1

    pil = pil.crop(bbox)
    # 裁成正方形，徽标居中（favicon 常用）
    tw, th = pil.size
    side = max(tw, th)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(pil, ((side - tw) // 2, (side - th) // 2), pil)

    final = sq.resize((256, 256), Image.Resampling.LANCZOS)
    final.save(OUT, optimize=True)

    print(f"已写入: {OUT} (256x256)，未修改 clan-logo.png")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
