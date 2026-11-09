// Real keyboard input on Wayland for the nightly suite, through the
// virtual-keyboard-unstable-v1 protocol (wlroots compositors such as sway).
// Unlike wtype, it uploads a real xkb keymap and sends evdev key codes, so the
// browser sees the same `code` values a physical keyboard produces.
//
// Reads one command per line on stdin and answers `ok` or `error <message>`:
//
//   layout <layout> [variant]   Compiles and uploads an xkb keymap, such as `de`.
//   down <evdev code>           Presses a key, such as 29 for left Control.
//   up <evdev code>             Releases it.
#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/mman.h>
#include <time.h>
#include <unistd.h>
#include <wayland-client.h>
#include <xkbcommon/xkbcommon.h>
#include "virtual-keyboard-unstable-v1-client-protocol.h"

static struct wl_seat *seat;
static struct zwp_virtual_keyboard_manager_v1 *manager;

static void global(void *data, struct wl_registry *registry, uint32_t name,
                   const char *interface, uint32_t version) {
  if (strcmp(interface, wl_seat_interface.name) == 0 && !seat)
    seat = wl_registry_bind(registry, name, &wl_seat_interface, 1);
  else if (strcmp(interface, zwp_virtual_keyboard_manager_v1_interface.name) == 0)
    manager = wl_registry_bind(registry, name,
                               &zwp_virtual_keyboard_manager_v1_interface, 1);
}

static void global_remove(void *data, struct wl_registry *registry, uint32_t name) {}

static const struct wl_registry_listener registry_listener = {global, global_remove};

static uint32_t now_ms(void) {
  struct timespec ts;
  clock_gettime(CLOCK_MONOTONIC, &ts);
  return (uint32_t)(ts.tv_sec * 1000 + ts.tv_nsec / 1000000);
}

int main(void) {
  struct wl_display *display = wl_display_connect(NULL);
  if (!display) {
    fprintf(stderr, "vkbd: can't connect to WAYLAND_DISPLAY\n");
    return 1;
  }
  struct wl_registry *registry = wl_display_get_registry(display);
  wl_registry_add_listener(registry, &registry_listener, NULL);
  wl_display_roundtrip(display);
  if (!seat || !manager) {
    fprintf(stderr, "vkbd: compositor has no seat or virtual keyboard manager\n");
    return 1;
  }
  struct zwp_virtual_keyboard_v1 *keyboard =
      zwp_virtual_keyboard_manager_v1_create_virtual_keyboard(manager, seat);
  struct xkb_context *context = xkb_context_new(XKB_CONTEXT_NO_FLAGS);
  struct xkb_state *state = NULL;

  char *line = NULL;
  size_t capacity = 0;
  setvbuf(stdout, NULL, _IOLBF, 0);
  while (getline(&line, &capacity, stdin) > 0) {
    char command[16] = "", argument[64] = "", variant[64] = "";
    if (sscanf(line, "%15s %63s %63s", command, argument, variant) < 2) {
      printf("error bad command\n");
      continue;
    }

    if (strcmp(command, "layout") == 0) {
      struct xkb_rule_names names = {
          .rules = "evdev", .model = "pc105", .layout = argument,
          .variant = variant[0] ? variant : NULL};
      struct xkb_keymap *keymap =
          xkb_keymap_new_from_names(context, &names, XKB_KEYMAP_COMPILE_NO_FLAGS);
      if (!keymap) {
        printf("error unknown layout %s\n", argument);
        continue;
      }
      char *text = xkb_keymap_get_as_string(keymap, XKB_KEYMAP_FORMAT_TEXT_V1);
      size_t size = strlen(text) + 1;
      int fd = memfd_create("vkbd-keymap", MFD_CLOEXEC);
      if (fd < 0 || write(fd, text, size) != (ssize_t)size) {
        printf("error can't write keymap\n");
        continue;
      }
      zwp_virtual_keyboard_v1_keymap(keyboard, WL_KEYBOARD_KEYMAP_FORMAT_XKB_V1,
                                     fd, size);
      close(fd);
      free(text);
      if (state) xkb_state_unref(state);
      state = xkb_state_new(keymap);
      xkb_keymap_unref(keymap);
      zwp_virtual_keyboard_v1_modifiers(keyboard, 0, 0, 0, 0);
    } else if (strcmp(command, "down") == 0 || strcmp(command, "up") == 0) {
      if (!state) {
        printf("error no layout\n");
        continue;
      }
      int down = strcmp(command, "down") == 0;
      uint32_t code = (uint32_t)atoi(argument);
      zwp_virtual_keyboard_v1_key(keyboard, now_ms(), code,
                                  down ? WL_KEYBOARD_KEY_STATE_PRESSED
                                       : WL_KEYBOARD_KEY_STATE_RELEASED);
      // A virtual keyboard reports its own modifier state, as a real
      // keyboard's compositor would. xkb codes are evdev codes plus 8.
      xkb_state_update_key(state, code + 8, down ? XKB_KEY_DOWN : XKB_KEY_UP);
      zwp_virtual_keyboard_v1_modifiers(
          keyboard, xkb_state_serialize_mods(state, XKB_STATE_MODS_DEPRESSED),
          xkb_state_serialize_mods(state, XKB_STATE_MODS_LATCHED),
          xkb_state_serialize_mods(state, XKB_STATE_MODS_LOCKED),
          xkb_state_serialize_layout(state, XKB_STATE_LAYOUT_EFFECTIVE));
    } else {
      printf("error unknown command %s\n", command);
      continue;
    }
    wl_display_roundtrip(display);
    printf("ok\n");
  }
  return 0;
}
