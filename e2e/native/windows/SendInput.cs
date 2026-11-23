// Real keyboard input on Windows for the nightly suite. Reads one command per
// line on stdin and answers `ok [detail]` or `error <message>`:
//
//   focus <title>      Activates the top-level window whose title contains <title>
//                      and clicks its client area.
//   layout <KLID>      Loads a keyboard layout (such as 00000407) and asks the
//                      foreground window to switch to it. Answers the active HKL.
//   press <keys...>    Holds each key down in order, then releases them in reverse.
//
// Keys are sent as scan codes, so the active layout decides what they type, and
// Windows adds its own Control for the AltGr key, as with a real keyboard.
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

static class SendInputHelper
{
    const uint INPUT_MOUSE = 0;
    const uint INPUT_KEYBOARD = 1;
    const uint KEYEVENTF_EXTENDEDKEY = 0x1;
    const uint KEYEVENTF_KEYUP = 0x2;
    const uint KEYEVENTF_SCANCODE = 0x8;
    const uint MOUSEEVENTF_LEFTDOWN = 0x2;
    const uint MOUSEEVENTF_LEFTUP = 0x4;
    const uint KLF_ACTIVATE = 0x1;
    const uint WM_INPUTLANGCHANGEREQUEST = 0x50;

    [StructLayout(LayoutKind.Sequential)]
    struct MOUSEINPUT { public int dx, dy; public uint mouseData, dwFlags, time; public IntPtr dwExtraInfo; }

    [StructLayout(LayoutKind.Sequential)]
    struct KEYBDINPUT { public ushort wVk, wScan; public uint dwFlags, time; public IntPtr dwExtraInfo; }

    [StructLayout(LayoutKind.Explicit)]
    struct InputUnion { [FieldOffset(0)] public MOUSEINPUT mi; [FieldOffset(0)] public KEYBDINPUT ki; }

    [StructLayout(LayoutKind.Sequential)]
    struct INPUT { public uint type; public InputUnion u; }

    [StructLayout(LayoutKind.Sequential)]
    struct RECT { public int Left, Top, Right, Bottom; }

    [StructLayout(LayoutKind.Sequential)]
    struct POINT { public int X, Y; }

    delegate bool EnumWindowsProc(IntPtr hwnd, IntPtr lParam);

    [DllImport("user32.dll", SetLastError = true)] static extern uint SendInput(uint count, INPUT[] inputs, int size);
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowText(IntPtr hwnd, StringBuilder text, int max);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr hwnd);
    [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr hwnd, int command);
    [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr hwnd, out RECT rect);
    [DllImport("user32.dll")] static extern bool ClientToScreen(IntPtr hwnd, ref POINT point);
    [DllImport("user32.dll")] static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern IntPtr LoadKeyboardLayout(string klid, uint flags);
    [DllImport("user32.dll")] static extern bool PostMessage(IntPtr hwnd, uint message, IntPtr wParam, IntPtr lParam);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint processId);
    [DllImport("user32.dll")] static extern IntPtr GetKeyboardLayout(uint threadId);

    // Set 1 scan codes by KeyboardEvent.code, plus the names the other drivers use.
    static readonly Dictionary<string, ushort> ScanCodes = new Dictionary<string, ushort>
    {
        { "Escape", 0x01 }, { "Digit1", 0x02 }, { "Digit2", 0x03 }, { "Digit7", 0x08 },
        { "Backspace", 0x0E }, { "KeyQ", 0x10 }, { "KeyE", 0x12 }, { "KeyY", 0x15 },
        { "KeyI", 0x17 }, { "KeyO", 0x18 }, { "Enter", 0x1C }, { "Control", 0x1D },
        { "KeyA", 0x1E }, { "KeyS", 0x1F }, { "KeyF", 0x21 }, { "KeyH", 0x23 },
        { "KeyK", 0x25 }, { "Backquote", 0x29 }, { "Shift", 0x2A }, { "KeyZ", 0x2C },
        { "KeyN", 0x31 }, { "Slash", 0x35 }, { "Alt", 0x38 }, { "Space", 0x39 },
    };

    // Extended keys share a scan code with another key and need the E0 prefix.
    static readonly Dictionary<string, ushort> ExtendedScanCodes = new Dictionary<string, ushort>
    {
        { "AltGr", 0x38 }, { "ControlRight", 0x1D }, { "Home", 0x47 }, { "End", 0x4F },
    };

    static void Main()
    {
        string line;
        while ((line = Console.ReadLine()) != null)
        {
            string[] parts = line.Trim().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 0) continue;
            try
            {
                string detail;
                switch (parts[0])
                {
                    case "focus": detail = Focus(line.Trim().Substring(6)); break;
                    case "layout": detail = Layout(parts[1]); break;
                    case "press": detail = Press(parts, 1); break;
                    default: throw new Exception("unknown command " + parts[0]);
                }
                Console.WriteLine("ok " + detail);
            }
            catch (Exception error)
            {
                Console.WriteLine("error " + error.Message);
            }
            Console.Out.Flush();
        }
    }

    static string Focus(string title)
    {
        IntPtr found = IntPtr.Zero;
        EnumWindows((hwnd, _) =>
        {
            if (!IsWindowVisible(hwnd)) return true;
            var text = new StringBuilder(512);
            GetWindowText(hwnd, text, text.Capacity);
            if (text.ToString().Contains(title)) { found = hwnd; return false; }
            return true;
        }, IntPtr.Zero);
        if (found == IntPtr.Zero) throw new Exception("no window titled " + title);

        ShowWindow(found, 9); // SW_RESTORE
        SetForegroundWindow(found);
        // Windows may refuse SetForegroundWindow from a background process. A
        // click in the window always activates it.
        RECT rect;
        GetClientRect(found, out rect);
        var center = new POINT { X = (rect.Right - rect.Left) / 2, Y = (rect.Bottom - rect.Top) / 2 };
        ClientToScreen(found, ref center);
        SetCursorPos(center.X, center.Y);
        Send(MouseInput(MOUSEEVENTF_LEFTDOWN));
        Thread.Sleep(20);
        Send(MouseInput(MOUSEEVENTF_LEFTUP));
        Thread.Sleep(300);
        return "foreground=" + (GetForegroundWindow() == found);
    }

    static string Layout(string klid)
    {
        IntPtr layout = LoadKeyboardLayout(klid, KLF_ACTIVATE);
        if (layout == IntPtr.Zero) throw new Exception("LoadKeyboardLayout failed for " + klid);
        IntPtr window = GetForegroundWindow();
        PostMessage(window, WM_INPUTLANGCHANGEREQUEST, IntPtr.Zero, layout);
        uint processId;
        uint thread = GetWindowThreadProcessId(window, out processId);
        // The window's thread switches layouts when it handles the message.
        for (int attempt = 0; attempt < 20; attempt++)
        {
            Thread.Sleep(100);
            if (GetKeyboardLayout(thread) == layout) break;
        }
        return "hkl=" + GetKeyboardLayout(thread).ToInt64().ToString("x8") + " requested=" + layout.ToInt64().ToString("x8");
    }

    static string Press(string[] parts, int start)
    {
        var keys = new List<string>();
        for (int i = start; i < parts.Length; i++) keys.AddRange(parts[i].Split('+'));
        foreach (string key in keys) { Send(KeyInput(key, false)); Thread.Sleep(30); }
        for (int i = keys.Count - 1; i >= 0; i--) { Send(KeyInput(keys[i], true)); Thread.Sleep(30); }
        return string.Join("+", keys);
    }

    static INPUT KeyInput(string key, bool up)
    {
        ushort scan;
        uint flags = KEYEVENTF_SCANCODE | (up ? KEYEVENTF_KEYUP : 0);
        if (ExtendedScanCodes.TryGetValue(key, out scan)) flags |= KEYEVENTF_EXTENDEDKEY;
        else if (!ScanCodes.TryGetValue(key, out scan)) throw new Exception("no scan code for " + key);
        var input = new INPUT { type = INPUT_KEYBOARD };
        input.u.ki = new KEYBDINPUT { wScan = scan, dwFlags = flags };
        return input;
    }

    static INPUT MouseInput(uint flags)
    {
        var input = new INPUT { type = INPUT_MOUSE };
        input.u.mi = new MOUSEINPUT { dwFlags = flags };
        return input;
    }

    static void Send(INPUT input)
    {
        if (SendInput(1, new[] { input }, Marshal.SizeOf(typeof(INPUT))) != 1)
            throw new Exception("SendInput failed with error " + Marshal.GetLastWin32Error());
    }
}
