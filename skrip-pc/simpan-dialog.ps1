# Isi dialog "Save Exported Video" Recordly dengan path tujuan.  powershell -File simpan-dialog.ps1 -Tujuan E:\...\x.mp4
param([string]$Tujuan)
Add-Type @"
using System; using System.Runtime.InteropServices; using System.Text;
public class Dlg { public delegate bool E(IntPtr h, IntPtr l);
[DllImport("user32.dll")] public static extern bool EnumWindows(E f, IntPtr l);
[DllImport("user32.dll")] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
[DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
[DllImport("user32.dll")] public static extern int GetClassName(IntPtr h, StringBuilder s, int n);
[DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h); }
"@
$h = [IntPtr]::Zero
for ($i = 0; $i -lt 300 -and $h -eq [IntPtr]::Zero; $i++) {
  [Dlg]::EnumWindows({ param($w,$l) if ([Dlg]::IsWindowVisible($w)) { $sb=New-Object Text.StringBuilder 256; $cb=New-Object Text.StringBuilder 64; [Dlg]::GetWindowText($w,$sb,256)|Out-Null; [Dlg]::GetClassName($w,$cb,64)|Out-Null; if ($cb.ToString() -eq '#32770' -and $sb.ToString() -like 'Save Exported*') { $script:h = $w } }; $true }, [IntPtr]::Zero) | Out-Null
  if ($h -eq [IntPtr]::Zero) { Start-Sleep -Milliseconds 1000 }
}
if ($h -eq [IntPtr]::Zero) { "dialog tidak muncul"; exit 1 }
[Dlg]::SetForegroundWindow($h) | Out-Null
Start-Sleep -Milliseconds 600
$py = 'C:/Users/RIFE/AppData/Local/Programs/Python/Python310/python.exe'
& $py -c "import pyautogui as p,time;p.hotkey('alt','n');time.sleep(0.3);p.hotkey('ctrl','a');p.write(r'$Tujuan',interval=0.01);time.sleep(0.3);p.press('enter')"
"disimpan ke $Tujuan"
