/**
 * Opens the present-to-players view in a popup window.
 * Falls back to a new tab if popups are blocked.
 */
export function openPresentWindow(url: string) {
  const width = Math.round(screen.width * 0.75);
  const height = Math.round(screen.height * 0.75);
  const left = Math.round((screen.width - width) / 2);
  const top = Math.round((screen.height - height) / 2);

  window.open(
    url,
    'nimble-present',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no`
  );
}
