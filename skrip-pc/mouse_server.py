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
    elif cmd == "fokus":  # jadikan jendela berjudul memuat <teks> foreground TANPA klik (klik pertama ke jendela tak aktif tidak sampai ke halaman)
        import ctypes
        u = ctypes.windll.user32
        teks = " ".join(a[1:])
        hasil = []
        def cek(h, _):
            if u.IsWindowVisible(h):
                b = ctypes.create_unicode_buffer(512)
                u.GetWindowTextW(h, b, 512)
                if teks in b.value:
                    hasil.append(h)
            return True
        u.EnumWindows(ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_void_p, ctypes.c_void_p)(cek), 0)
        import time
        for _ in range(3 if hasil else 0):
            p.press("alt")  # izin SetForegroundWindow dari proses yang mengirim input terakhir
            fg = u.GetWindowThreadProcessId(u.GetForegroundWindow(), None)
            me = ctypes.windll.kernel32.GetCurrentThreadId()
            u.AttachThreadInput(me, fg, True)  # pinjam hak foreground dari jendela aktif (mis. Recordly)
            u.BringWindowToTop(hasil[0]); u.SetForegroundWindow(hasil[0])
            u.AttachThreadInput(me, fg, False)
            time.sleep(0.25)
            if u.GetForegroundWindow() == hasil[0]:
                break
        print("fokus", "ok" if hasil and u.GetForegroundWindow() == hasil[0] else "gagal", file=sys.stderr, flush=True)
    elif cmd == "roda":  # n notch roda mouse (1 notch = 120 delta Windows ≈ 100 px di Chrome); scroll lama = delta mentah
        for _ in range(abs(int(a[1]))):
            p.scroll(120 if int(a[1]) > 0 else -120)
    print("ok", flush=True)
