import Carbon
import Foundation

// Every installed keyboard layout: what each position types at each modifier level,
// from UCKeyTranslate. Output: JSON { layouts: [{ id, name, keys: { code: {level: char} } }] }
let vk: [(String, UInt16)] = [
  ("KeyA",0),("KeyS",1),("KeyD",2),("KeyF",3),("KeyH",4),("KeyG",5),("KeyZ",6),("KeyX",7),("KeyC",8),("KeyV",9),
  ("IntlBackslash",10),("KeyB",11),("KeyQ",12),("KeyW",13),("KeyE",14),("KeyR",15),("KeyY",16),("KeyT",17),
  ("Digit1",18),("Digit2",19),("Digit3",20),("Digit4",21),("Digit6",22),("Digit5",23),("Equal",24),("Digit9",25),
  ("Digit7",26),("Minus",27),("Digit8",28),("Digit0",29),("BracketRight",30),("KeyO",31),("KeyU",32),("BracketLeft",33),
  ("KeyI",34),("KeyP",35),("KeyL",37),("KeyJ",38),("Quote",39),("KeyK",40),("Semicolon",41),("Backslash",42),
  ("Comma",43),("Slash",44),("KeyN",45),("KeyM",46),("Period",47),("Backquote",50)]
// Carbon modifier state >> 8: cmd=1 shift=2 option=8. The keyboard type
// (LMGetKbdType, recorded in the output) decides whether Backquote and
// IntlBackslash follow the ANSI or the ISO keyboard.
let levels: [(String, UInt32)] = [("plain",0),("shift",2),("option",8),("optionShift",10),("cmd",1),("cmdShift",3),("cmdOption",9),("cmdOptionShift",11)]
func translate(_ layout: UnsafePointer<UCKeyboardLayout>, _ code: UInt16, _ mods: UInt32) -> String {
  var dead: UInt32 = 0
  var len = 0
  var chars = [UniChar](repeating: 0, count: 8)
  let st = UCKeyTranslate(layout, code, UInt16(kUCKeyActionDown), mods, UInt32(LMGetKbdType()), 0, &dead, 8, &len, &chars)
  if st != noErr { return "" }
  if dead != 0 && len == 0 { return "Dead" }
  return String(utf16CodeUnits: chars, count: len)
}
let filter = [kTISPropertyInputSourceType as String: kTISTypeKeyboardLayout as String] as CFDictionary
let list = (TISCreateInputSourceList(filter, true)?.takeRetainedValue() as? [TISInputSource]) ?? []
var out: [[String: Any]] = []
for src in list {
  guard let idp = TISGetInputSourceProperty(src, kTISPropertyInputSourceID),
        let ptr = TISGetInputSourceProperty(src, kTISPropertyUnicodeKeyLayoutData) else { continue }
  let id = Unmanaged<CFString>.fromOpaque(idp).takeUnretainedValue() as String
  var name = id
  if let np = TISGetInputSourceProperty(src, kTISPropertyLocalizedName) { name = Unmanaged<CFString>.fromOpaque(np).takeUnretainedValue() as String }
  let data = Unmanaged<CFData>.fromOpaque(ptr).takeUnretainedValue() as Data
  var keys: [String: [String: String]] = [:]
  data.withUnsafeBytes { raw in
    let layout = raw.bindMemory(to: UCKeyboardLayout.self).baseAddress!
    for (code, vkc) in vk {
      var row: [String: String] = [:]
      for (level, mods) in levels { row[level] = translate(layout, vkc, mods) }
      keys[code] = row
    }
  }
  out.append(["id": id, "name": name, "keys": keys])
}
let json = try! JSONSerialization.data(withJSONObject: ["kbdType": Int(LMGetKbdType()), "layouts": out], options: [.sortedKeys])
FileHandle.standardOutput.write(json)
