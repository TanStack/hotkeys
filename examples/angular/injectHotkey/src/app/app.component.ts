import { Component, ElementRef, signal, viewChild } from '@angular/core';
import {
  formatForDisplay,
  injectHotkey,
  type Hotkey,
} from '@tanstack/angular-hotkeys';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
})
export class AppComponent {
  protected readonly lastHotkey = signal<Hotkey | null>(null);
  protected readonly saveCount = signal(0);
  protected readonly incrementCount = signal(0);
  protected readonly enabled = signal(true);
  protected readonly activeTab = signal(1);
  protected readonly navigationCount = signal(0);
  protected readonly functionKeyCount = signal(0);
  protected readonly multiModifierCount = signal(0);
  protected readonly editingKeyCount = signal(0);

  protected readonly modalOpen = signal(false);
  protected readonly editorContent = signal('');
  protected readonly sidebarShortcutCount = signal(0);
  protected readonly modalShortcutCount = signal(0);
  protected readonly editorShortcutCount = signal(0);

  private readonly sidebarRef = viewChild<ElementRef<HTMLDivElement>>('sidebarRef');
  private readonly modalRef = viewChild<ElementRef<HTMLDivElement>>('modalRef');
  private readonly editorRef = viewChild<ElementRef<HTMLTextAreaElement>>('editorRef');

  constructor() {
    injectHotkey('Mod+S', (_event, { hotkey }) => {
      this.lastHotkey.set(hotkey);
      this.saveCount.update((c) => c + 1);
    });

    injectHotkey(
      'Mod+K',
      (_event, { hotkey }) => {
        this.lastHotkey.set(hotkey);
        this.incrementCount.update((c) => c + 1);
      },
      { requireReset: true },
    );

    injectHotkey(
      'Mod+E',
      (_event, { hotkey }) => {
        this.lastHotkey.set(hotkey);
        alert('This hotkey can be toggled!');
      },
      () => ({ enabled: this.enabled() }),
    );

    injectHotkey('Mod+1', () => {
      this.lastHotkey.set('Mod+1');
      this.activeTab.set(1);
    });
    injectHotkey('Mod+2', () => {
      this.lastHotkey.set('Mod+2');
      this.activeTab.set(2);
    });
    injectHotkey('Mod+3', () => {
      this.lastHotkey.set('Mod+3');
      this.activeTab.set(3);
    });
    injectHotkey('Mod+4', () => {
      this.lastHotkey.set('Mod+4');
      this.activeTab.set(4);
    });
    injectHotkey('Mod+5', () => {
      this.lastHotkey.set('Mod+5');
      this.activeTab.set(5);
    });

    injectHotkey('Shift+ArrowUp', () => {
      this.lastHotkey.set('Shift+ArrowUp');
      this.navigationCount.update((c) => c + 1);
    });
    injectHotkey('Shift+ArrowDown', () => {
      this.lastHotkey.set('Shift+ArrowDown');
      this.navigationCount.update((c) => c + 1);
    });
    injectHotkey('Alt+ArrowLeft', () => {
      this.lastHotkey.set('Alt+ArrowLeft');
      this.navigationCount.update((c) => c + 1);
    });
    injectHotkey('Alt+ArrowRight', () => {
      this.lastHotkey.set('Alt+ArrowRight');
      this.navigationCount.update((c) => c + 1);
    });
    injectHotkey('Mod+Home', () => {
      this.lastHotkey.set('Mod+Home');
      this.navigationCount.update((c) => c + 1);
    });
    injectHotkey('Mod+End', () => {
      this.lastHotkey.set('Mod+End');
      this.navigationCount.update((c) => c + 1);
    });
    injectHotkey('Control+PageUp', () => {
      this.lastHotkey.set('Control+PageUp');
      this.navigationCount.update((c) => c + 1);
    });
    injectHotkey('Control+PageDown', () => {
      this.lastHotkey.set('Control+PageDown');
      this.navigationCount.update((c) => c + 1);
    });

    injectHotkey('Meta+F4', () => {
      this.lastHotkey.set('Alt+F4');
      this.functionKeyCount.update((c) => c + 1);
      alert('Alt+F4 pressed (normally closes window)');
    });
    injectHotkey('Control+F5', () => {
      this.lastHotkey.set('Control+F5');
      this.functionKeyCount.update((c) => c + 1);
    });
    injectHotkey('Mod+F1', () => {
      this.lastHotkey.set('Mod+F1');
      this.functionKeyCount.update((c) => c + 1);
    });
    injectHotkey('Shift+F10', () => {
      this.lastHotkey.set('Shift+F10');
      this.functionKeyCount.update((c) => c + 1);
    });

    injectHotkey('Mod+Shift+S', () => {
      this.lastHotkey.set('Mod+Shift+S');
      this.multiModifierCount.update((c) => c + 1);
    });
    injectHotkey('Mod+Shift+Z', () => {
      this.lastHotkey.set('Mod+Shift+Z');
      this.multiModifierCount.update((c) => c + 1);
    });
    injectHotkey({ key: 'A', ctrl: true, alt: true }, () => {
      this.lastHotkey.set('Control+Alt+A');
      this.multiModifierCount.update((c) => c + 1);
    });
    injectHotkey('Control+Shift+N', () => {
      this.lastHotkey.set('Control+Shift+N');
      this.multiModifierCount.update((c) => c + 1);
    });
    injectHotkey('Mod+Alt+T', () => {
      this.lastHotkey.set('Mod+Alt+T');
      this.multiModifierCount.update((c) => c + 1);
    });
    injectHotkey('Control+Alt+Shift+X', () => {
      this.lastHotkey.set('Control+Alt+Shift+X');
      this.multiModifierCount.update((c) => c + 1);
    });

    injectHotkey('Mod+Enter', () => {
      this.lastHotkey.set('Mod+Enter');
      this.editingKeyCount.update((c) => c + 1);
    });
    injectHotkey('Shift+Enter', () => {
      this.lastHotkey.set('Shift+Enter');
      this.editingKeyCount.update((c) => c + 1);
    });
    injectHotkey('Mod+Backspace', () => {
      this.lastHotkey.set('Mod+Backspace');
      this.editingKeyCount.update((c) => c + 1);
    });
    injectHotkey('Mod+Delete', () => {
      this.lastHotkey.set('Mod+Delete');
      this.editingKeyCount.update((c) => c + 1);
    });
    injectHotkey('Control+Tab', () => {
      this.lastHotkey.set('Control+Tab');
      this.editingKeyCount.update((c) => c + 1);
    });
    injectHotkey('Shift+Tab', () => {
      this.lastHotkey.set('Shift+Tab');
      this.editingKeyCount.update((c) => c + 1);
    });
    injectHotkey('Mod+Space', () => {
      this.lastHotkey.set('Mod+Space');
      this.editingKeyCount.update((c) => c + 1);
    });

    injectHotkey({ key: 'Escape' }, () => {
      this.lastHotkey.set(null);
      this.saveCount.set(0);
      this.incrementCount.set(0);
      this.navigationCount.set(0);
      this.functionKeyCount.set(0);
      this.multiModifierCount.set(0);
      this.editingKeyCount.set(0);
      this.activeTab.set(1);
    });
    injectHotkey('F12', () => {
      this.lastHotkey.set('F12');
      this.functionKeyCount.update((c) => c + 1);
    });

    // Scoped: sidebar (Solid-style getter)
    injectHotkey(
      'Mod+B',
      () => {
        this.lastHotkey.set('Mod+B');
        this.sidebarShortcutCount.update((c) => c + 1);
        alert(
          'Sidebar shortcut triggered! This only works when the sidebar area is focused.',
        );
      },
      () => ({ target: this.sidebarRef()?.nativeElement ?? null }),
    );
    injectHotkey(
      'Mod+N',
      () => {
        this.lastHotkey.set('Mod+N');
        this.sidebarShortcutCount.update((c) => c + 1);
      },
      () => ({ target: this.sidebarRef()?.nativeElement ?? null }),
    );

    // Scoped: modal (Solid-style getter)
    injectHotkey(
      'Escape',
      () => {
        this.lastHotkey.set('Escape');
        this.modalShortcutCount.update((c) => c + 1);
        this.modalOpen.set(false);
      },
      () => ({
        target: this.modalRef()?.nativeElement ?? null,
        enabled: this.modalOpen(),
      }),
    );
    injectHotkey(
      'Mod+Enter',
      () => {
        this.lastHotkey.set('Mod+Enter');
        this.modalShortcutCount.update((c) => c + 1);
        alert('Modal submit shortcut!');
      },
      () => ({
        target: this.modalRef()?.nativeElement ?? null,
        enabled: this.modalOpen(),
      }),
    );

    // Scoped: editor (Solid-style getter)
    injectHotkey(
      'Mod+S',
      () => {
        this.lastHotkey.set('Mod+S');
        this.editorShortcutCount.update((c) => c + 1);
        const content = this.editorContent();
        alert(
          `Editor content saved: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        );
      },
      () => ({ target: this.editorRef()?.nativeElement ?? null }),
    );
    injectHotkey(
      'Mod+/',
      () => {
        this.lastHotkey.set('Mod+/');
        this.editorShortcutCount.update((c) => c + 1);
        this.editorContent.update((prev) => prev + '\n// Comment added via shortcut');
      },
      () => ({ target: this.editorRef()?.nativeElement ?? null }),
    );
    injectHotkey(
      'Mod+K',
      () => {
        this.lastHotkey.set('Mod+K');
        this.editorShortcutCount.update((c) => c + 1);
        this.editorContent.set('');
      },
      () => ({ target: this.editorRef()?.nativeElement ?? null }),
    );
  }

  protected formatForDisplay = formatForDisplay;

  protected openModal(): void {
    this.modalOpen.set(true);
  }

  protected closeModal(): void {
    this.modalOpen.set(false);
  }

  protected closeModalOverlay(): void {
    this.modalOpen.set(false);
  }

  protected onModalContentClick(event: Event): void {
    event.stopPropagation();
  }

  protected onEditorInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    this.editorContent.set(el.value);
  }
}
