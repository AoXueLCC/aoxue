# -*- coding: utf-8 -*-
"""压缩冷藏车视频:540p h264 CRF31, 音频48k mono, 目标每个 ~3-4MB。用法: python scripts/compress_videos.py"""
import os, subprocess, sys, imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
SRC = r"C:\Users\win10\Desktop\冷藏车数据\视频"
DST = r"C:\Users\win10\Desktop\reefer-quote-vue\public\data\videos"

# 文件名 -> 车型id（江铃E福顺VAN.mp4 与 江铃VAN面包.mp4 为同一文件，用户决定不用）
mapping = {
    "E路达宽体加强版.mp4": "t09",
    "吉利远程F1E.mp4": "t11",
    "吉利远程H8E.mp4": "t13",
    "吉利远程T9E.mp4": "t17",
    "吉利远程V8E.mp4": "t15",
    "奇瑞零米尊享版.mp4": "t18",
    "江铃VAN卡.mp4": "t05",
    "江铃VAN面包.mp4": "t07",
    "福田奥铃M卡.mp4": "t01",
}

os.makedirs(DST, exist_ok=True)
total = 0
for fname, tid in mapping.items():
    src = os.path.join(SRC, fname)
    if not os.path.exists(src):
        print(f"MISSING: {fname}")
        continue
    dst = os.path.join(DST, tid + ".mp4")
    cmd = [
        FFMPEG, "-y", "-i", src,
        "-vf", "scale='min(960,iw)':-2",
        "-c:v", "libx264", "-preset", "medium", "-crf", "31",
        "-c:a", "aac", "-b:a", "48k", "-ac", "1",
        "-movflags", "+faststart",
        dst,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, errors="replace")
    if r.returncode != 0:
        print(f"FAIL {fname}: {r.stderr[-300:]}")
        continue
    kb = os.path.getsize(dst) / 1024
    total += kb
    print(f"{tid} {fname} -> {os.path.basename(dst)} {kb/1024:.2f}MB")

print(f"\n总计: {total/1024:.1f}MB")
