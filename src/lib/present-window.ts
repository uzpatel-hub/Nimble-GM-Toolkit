/**
 * Opens the present-to-players view in a popup window.
 * Falls back to a new tab if popups are blocked.
 */

/** BroadcastChannel name used to sync state between the GM app and the
 *  present window (so the GM can see what players are currently viewing). */
export const PRESENT_CHANNEL = 'nimble-present';

/** Handle to the most recently opened present window, when this tab opened it. */
let presentWindow: Window | null = null;

export function openPresentWindow(url: string) {
  const width = Math.round(screen.width * 0.75);
  const height = Math.round(screen.height * 0.75);
  const left = Math.round((screen.width - width) / 2);
  const top = Math.round((screen.height - height) / 2);

  presentWindow = window.open(
    url,
    'nimble-present',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
  );
  presentWindow?.focus();
}

/** Bring the present window to the front, if this tab still holds its handle. */
export function focusPresentWindow() {
  presentWindow?.focus();
}

/** Close the present window. Uses the BroadcastChannel so it works even when
 *  this tab no longer holds the handle (e.g. after a GM-side reload). */
export function closePresentWindow() {
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const ch = new BroadcastChannel(PRESENT_CHANNEL);
      ch.postMessage({ type: 'present:close' });
      ch.close();
    } catch {
      /* ignore */
    }
  }
  presentWindow?.close();
  presentWindow = null;
}
