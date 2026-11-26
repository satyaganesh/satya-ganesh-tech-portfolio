#!/usr/bin/env python3
"""
Build character frames from video files.
Extracts frames, removes backgrounds, and exports WebP sequences.
"""

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import os
import sys
import subprocess
from rembg import remove, new_session
from tqdm import tqdm

# Configuration
VIDEO_DIR = r"C:\Users\divya\Desktop\Portfolio with prompt"
OUTPUT_HD = r"C:\Users\divya\Desktop\Portfolio with prompt\portfolio-new\public\frames\hd"
OUTPUT_SD = r"C:\Users\divya\Desktop\Portfolio with prompt\portfolio-new\public\frames\sd"
FRAMES_JS = r"C:\Users\divya\Desktop\Portfolio with prompt\portfolio-new\src\lib\frames.js"

TARGET_HD = (640, 1080)
TARGET_SD = (384, 648)
ROT_CROP = (800, 1080)  # for rotc frames (uncut)

# Video files
VIDEOS = {
    'run': os.path.join(VIDEO_DIR, 'RUN_RIGHT.MP4.mp4'),
    'wave': os.path.join(VIDEO_DIR, 'WAVE.mp4'),
    'rot': os.path.join(VIDEO_DIR, 'TURN_360.MP4'),
}

# RemBG session with u2net_human_seg
session = new_session('u2net_human_seg')

def get_background_color(frame):
    """Get background color from frame corners."""
    h, w = frame.shape[:2]
    corners = [
        frame[0, 0], frame[0, w-1],
        frame[h-1, 0], frame[h-1, w-1]
    ]
    return np.mean(corners, axis=0).astype(np.uint8)

def find_torso_center(frame, mask):
    """Find character's horizontal center from torso region."""
    # Torso is roughly middle-third of body
    h, w = mask.shape
    torso_mask = mask[h//3:2*h//3, :]
    coords = np.where(torso_mask > 128)
    if len(coords[1]) > 0:
        return int(np.mean(coords[1]))
    return w // 2

def process_alpha(mask):
    """Process alpha: clip((mask-0.08)/0.84), MinFilter 9, GaussianBlur 1.1"""
    # Clip
    alpha = np.clip((mask.astype(np.float32) - 0.08 * 255) / (0.84 * 255), 0, 1)
    alpha = (alpha * 255).astype(np.uint8)
    
    # Convert to PIL for filters
    alpha_img = Image.fromarray(alpha, mode='L')
    
    # MinFilter 9
    alpha_img = alpha_img.filter(ImageFilter.MinFilter(9))
    
    # GaussianBlur 1.1
    alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(1.1))
    
    return np.array(alpha_img)

def remove_leg_gap(frame, alpha, bg_color, y_start=520, y_end=1000, threshold=20):
    """Remove pixels within threshold of background color between y_start and y_end."""
    h, w = frame.shape[:2]
    y_start = min(y_start, h)
    y_end = min(y_end, h)
    
    for y in range(y_start, y_end):
        for x in range(w):
            pixel = frame[y, x]
            diff = np.abs(pixel.astype(np.int16) - bg_color.astype(np.int16))
            if np.max(diff) < threshold:
                alpha[y, x] = 0
    return alpha

def unmix_background(frame, alpha, bg_color):
    """Un-mix background color from edge pixels: C = (I - (1-a)*bg) / a"""
    result = frame.copy().astype(np.float32)
    alpha_norm = alpha.astype(np.float32) / 255.0
    bg = bg_color.astype(np.float32)
    
    for c in range(3):
        result[:, :, c] = np.where(
            alpha_norm > 0,
            (frame[:, :, c] - (1 - alpha_norm) * bg[c]) / np.maximum(alpha_norm, 1e-6),
            frame[:, :, c]
        )
    
    return np.clip(result, 0, 255).astype(np.uint8)

def apply_unsharp_mask(image, radius=1.4, percent=70):
    """Apply UnsharpMask."""
    pil_img = Image.fromarray(image)
    enhancer = ImageEnhance.Sharpness(pil_img)
    # PIL's UnsharpMask is different, using sharpness enhancement
    pil_img = pil_img.filter(ImageFilter.UnsharpMask(radius=radius, percent=percent, threshold=3))
    return np.array(pil_img)

def save_webp(frame, alpha, path, quality=88, alpha_quality=90):
    """Save frame as WebP with alpha."""
    # Combine RGB and alpha
    rgba = np.dstack([frame, alpha])
    pil_img = Image.fromarray(rgba, 'RGBA')
    pil_img.save(path, 'WEBP', quality=quality, alpha_quality=alpha_quality, method=6)

def save_webp_rgb(frame, path, quality=90):
    """Save RGB frame as WebP."""
    pil_img = Image.fromarray(frame, 'RGB')
    pil_img.save(path, 'WEBP', quality=quality, method=6)

def extract_frames(video_path, target_size, name_prefix, cutout=True, leg_gap=False, rot_crop=False):
    """Extract and process frames from video."""
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open {video_path}")
        return []
    
    frames_data = []
    frame_idx = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Resize to 1920x1080 first
        frame = cv2.resize(frame, (1920, 1080), interpolation=cv2.INTER_LANCZOS4)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        if cutout:
            # Get background color
            bg_color = get_background_color(frame_rgb)
            
            # Remove background with rembg
            pil_frame = Image.fromarray(frame_rgb)
            result = remove(pil_frame, session=session, alpha_matting=True)
            result_arr = np.array(result)
            
            # Extract alpha and RGB
            alpha = result_arr[:, :, 3]
            rgb = result_arr[:, :, :3]
            
            # Process alpha
            alpha = process_alpha(alpha)
            
            # Remove leg gap for wave and rot
            if leg_gap:
                alpha = remove_leg_gap(rgb, alpha, bg_color)
            
            # Un-mix background
            rgb = unmix_background(rgb, alpha, bg_color)
            
            # Unsharp mask
            rgb = apply_unsharp_mask(rgb)
            
            # Find torso center for alignment
            center_x = find_torso_center(rgb, alpha)
            
            # Crop to target size centered on torso
            target_w, target_h = target_size
            left = max(0, min(center_x - target_w // 2, 1920 - target_w))
            cropped_rgb = rgb[:, left:left+target_w]
            cropped_alpha = alpha[:, left:left+target_w]
            
            # Resize to final target
            pil_rgb = Image.fromarray(cropped_rgb).resize(target_size, Image.LANCZOS)
            pil_alpha = Image.fromarray(cropped_alpha).resize(target_size, Image.LANCZOS)
            
            frames_data.append({
                'rgb': np.array(pil_rgb),
                'alpha': np.array(pil_alpha),
                'center_x': center_x,
                'bg_color': bg_color
            })
        else:
            # rotc frames - crop 800x1080 keeping original background
            if rot_crop:
                frame_rgb = frame_rgb[:, 560:1360]  # Center crop 800x1080
            
            # Resize to target
            pil_rgb = Image.fromarray(frame_rgb).resize(target_size, Image.LANCZOS)
            frames_data.append({
                'rgb': np.array(pil_rgb),
                'alpha': None,
                'center_x': 960,
                'bg_color': get_background_color(frame_rgb)
            })
        
        frame_idx += 1
    
    cap.release()
    return frames_data

def find_run_start(frames):
    """Find first frame that differs from frame 0."""
    if len(frames) < 2:
        return 0
    frame0 = frames[0]['rgb']
    for i in range(1, len(frames)):
        diff = np.mean(np.abs(frames[i]['rgb'].astype(np.float32) - frame0.astype(np.float32)))
        if diff > 5.0:  # Threshold for difference
            return i
    return 0

def find_seamless_loop(frames, start_idx, min_len=12, max_len=36):
    """Find pair of frames (a,b) with b-a between min_len and max_len that look most alike."""
    best_score = float('inf')
    best_pair = (start_idx, start_idx + min_len)
    
    for a in range(start_idx, min(start_idx + 10, len(frames) - max_len)):
        for b in range(a + min_len, min(a + max_len + 1, len(frames))):
            diff = np.mean(np.abs(frames[a]['rgb'].astype(np.float32) - frames[b]['rgb'].astype(np.float32)))
            if diff < best_score:
                best_score = diff
                best_pair = (a, b)
    
    return best_pair

def find_loop_entry(frames, start_idx, loop_from):
    """Find frame where start blends into loop."""
    # Simple: return frame just before loop_from
    return max(0, loop_from - 1)

def find_side_profiles(rot_frames, run_frame):
    """Find two side-profile frames of 360 (narrowest torso in each half)."""
    # Split into two halves
    mid = len(rot_frames) // 2
    first_half = rot_frames[:mid]
    second_half = rot_frames[mid:]
    
    def find_narrowest(frames_list):
        min_width = float('inf')
        best_idx = 0
        for i, f in enumerate(frames_list):
            alpha = f['alpha']
            if alpha is not None:
                cols = np.where(alpha > 128)[1]
                if len(cols) > 0:
                    width = cols.max() - cols.min()
                    if width < min_width:
                        min_width = width
                        best_idx = i
        return best_idx
    
    left_idx = find_narrowest(first_half)
    right_idx = find_narrowest(second_half) + mid
    
    # Determine which faces right by comparing with run frame
    run_alpha = run_frame['alpha']
    run_cols = np.where(run_alpha > 128)[1]
    run_center = np.mean(run_cols) if len(run_cols) > 0 else 320
    
    left_alpha = rot_frames[left_idx]['alpha']
    right_alpha = rot_frames[right_idx]['alpha']
    
    left_center = np.mean(np.where(left_alpha > 128)[1]) if np.any(left_alpha > 128) else 0
    right_center = np.mean(np.where(right_alpha > 128)[1]) if np.any(right_alpha > 128) else 0
    
    # The one with center closer to run_center faces right
    if abs(right_center - run_center) < abs(left_center - run_center):
        return {'left': left_idx, 'right': right_idx}
    else:
        return {'left': right_idx, 'right': left_idx}

def scale_run_to_wave(run_frames, wave_frames):
    """Scale run frames so standing height matches wave video."""
    # Find standing height in wave (frame 0)
    wave_alpha = wave_frames[0]['alpha']
    wave_rows = np.where(wave_alpha > 128)[0]
    if len(wave_rows) > 0:
        wave_height = wave_rows.max() - wave_rows.min()
    else:
        wave_height = 1080
    
    # Find standing height in run (first frame)
    run_alpha = run_frames[0]['alpha']
    run_rows = np.where(run_alpha > 128)[0]
    if len(run_rows) > 0:
        run_height = run_rows.max() - run_rows.min()
    else:
        run_height = 1080
    
    scale = wave_height / run_height if run_height > 0 else 1.0
    return scale

def main():
    print("Extracting frames from videos...")
    
    # Extract all frames
    print("Processing RUN_RIGHT...")
    run_frames = extract_frames(VIDEOS['run'], TARGET_HD, 'run', cutout=True, leg_gap=False)
    
    print("Processing WAVE...")
    wave_frames = extract_frames(VIDEOS['wave'], TARGET_HD, 'wave', cutout=True, leg_gap=True)
    
    print("Processing TURN_360 (cutout)...")
    rot_frames = extract_frames(VIDEOS['rot'], TARGET_HD, 'rot', cutout=True, leg_gap=True)
    
    print("Processing TURN_360 (uncut rotc)...")
    rotc_frames = extract_frames(VIDEOS['rot'], TARGET_HD, 'rotc', cutout=False, rot_crop=True)
    
    # Find key frames
    print("Analyzing run sequence...")
    run_start = find_run_start(run_frames)
    loop_from, loop_to = find_seamless_loop(run_frames, run_start)
    loop_len = loop_to - loop_from
    loop_entry = find_loop_entry(run_frames, run_start, loop_from)
    stand_frame = 0  # Frame 0 is standing
    
    print(f"Run start: {run_start}, Loop: {loop_from}-{loop_to} (len={loop_len}), Entry: {loop_entry}")
    
    print("Analyzing rotation sequence...")
    side_profiles = find_side_profiles(rot_frames, run_frames[0])
    front_frame = 0
    end_frame = len(rot_frames) - 1
    
    print(f"Side profiles: left={side_profiles['left']}, right={side_profiles['right']}")
    print(f"Front: {front_frame}, End: {end_frame}")
    
    # Scale run frames to match wave height
    scale = scale_run_to_wave(run_frames, wave_frames)
    print(f"Run scale factor: {scale:.3f}")
    
    # Save HD frames
    print("Saving HD frames...")
    for i, f in enumerate(tqdm(run_frames, desc="RUN HD")):
        save_webp(f['rgb'], f['alpha'], os.path.join(OUTPUT_HD, f'run_{i:03d}.webp'))
    
    for i, f in enumerate(tqdm(wave_frames, desc="WAVE HD")):
        save_webp(f['rgb'], f['alpha'], os.path.join(OUTPUT_HD, f'wave_{i:03d}.webp'))
    
    for i, f in enumerate(tqdm(rot_frames, desc="ROT HD")):
        save_webp(f['rgb'], f['alpha'], os.path.join(OUTPUT_HD, f'rot_{i:03d}.webp'))
    
    for i, f in enumerate(tqdm(rotc_frames, desc="ROTC HD")):
        save_webp_rgb(f['rgb'], os.path.join(OUTPUT_HD, f'rotc_{i:03d}.webp'), quality=90)
    
    # Save SD frames (half size)
    print("Saving SD frames...")
    sd_size = TARGET_SD
    for i, f in enumerate(tqdm(run_frames, desc="RUN SD")):
        pil_rgb = Image.fromarray(f['rgb']).resize(sd_size, Image.LANCZOS)
        pil_alpha = Image.fromarray(f['alpha']).resize(sd_size, Image.LANCZOS)
        save_webp(np.array(pil_rgb), np.array(pil_alpha), os.path.join(OUTPUT_SD, f'run_{i:03d}.webp'))
    
    for i, f in enumerate(tqdm(wave_frames, desc="WAVE SD")):
        pil_rgb = Image.fromarray(f['rgb']).resize(sd_size, Image.LANCZOS)
        pil_alpha = Image.fromarray(f['alpha']).resize(sd_size, Image.LANCZOS)
        save_webp(np.array(pil_rgb), np.array(pil_alpha), os.path.join(OUTPUT_SD, f'wave_{i:03d}.webp'))
    
    for i, f in enumerate(tqdm(rot_frames, desc="ROT SD")):
        pil_rgb = Image.fromarray(f['rgb']).resize(sd_size, Image.LANCZOS)
        pil_alpha = Image.fromarray(f['alpha']).resize(sd_size, Image.LANCZOS)
        save_webp(np.array(pil_rgb), np.array(pil_alpha), os.path.join(OUTPUT_SD, f'rot_{i:03d}.webp'))
    
    for i, f in enumerate(tqdm(rotc_frames, desc="ROTC SD")):
        pil_rgb = Image.fromarray(f['rgb']).resize(sd_size, Image.LANCZOS)
        save_webp_rgb(np.array(pil_rgb), os.path.join(OUTPUT_SD, f'rotc_{i:03d}.webp'), quality=90)
    
    # Get background color (from first rotc frame)
    bg_color = rotc_frames[0]['bg_color'].tolist() if rotc_frames else [255, 255, 255]
    
    # Write frames.js
    print("Writing frames.js...")
    js_content = f"""// Auto-generated by build_frames.py
export const FRAMES = {{
  SEQ: {{
    run: {len(run_frames)},
    wave: {len(wave_frames)},
    rot: {len(rot_frames)},
    rotc: {len(rotc_frames)},
  }},
  RUN: {{
    stand: {stand_frame},
    startFrom: {run_start},
    startTo: {loop_from - 1},
    loopFrom: {loop_from},
    loopLen: {loop_len},
    loopEntry: {loop_entry},
    scale: {scale:.4f},
  }},
  ROT: {{
    front: {front_frame},
    end: {end_frame},
    left: {side_profiles['left']},
    right: {side_profiles['right']},
  }},
  BG: {bg_color},
}};
"""
    with open(FRAMES_JS, 'w') as f:
        f.write(js_content)
    
    print("Done!")
    print(f"Frames saved to {OUTPUT_HD} and {OUTPUT_SD}")
    print(f"Frame data written to {FRAMES_JS}")

if __name__ == '__main__':
    main()