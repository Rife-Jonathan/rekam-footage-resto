"""Server kursor OS: baca perintah per baris dari stdin, balas 'ok'. Satu proses → tanpa jeda start Python.
   move x y dur | click x y dur | scroll n | roda n"""
import sys
import pyautogui as p

p.FAILSAFE = False
p.PAUSE = 0
for line in sys.stdin:
    a = line.split()
    if not a:
        continue
    cmd = a[0]
    if cmd in ("move", "click"):
        x, y, dur = int(a[1]), int(a[2]), float(a[3])
        p.moveTo(x, y, duration=dur, tween=p.easeInOutQuad)
        if cmd == "click":
            p.click()
    elif cmd == "scroll":
        p.scroll(int(a[1]))
    elif cmd == "roda":  # n notch roda mouse (1 notch = 120 delta Windows ≈ 100 px di Chrome); scroll lama = delta mentah
        for _ in range(abs(int(a[1]))):
            p.scroll(120 if int(a[1]) > 0 else -120)
    print("ok", flush=True)
