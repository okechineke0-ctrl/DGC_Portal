/**
 * Scoped printing helper.
 *
 * `window.print()` on its own sends the whole application shell (sidebar,
 * toolbars, tab strips) to the printer. Marking a single element as the print
 * root lets the print stylesheet in index.css hide everything else.
 */
export function printDocument(printRootId: string): void {
  const root = document.getElementById(printRootId);

  if (!root) {
    window.print();
    return;
  }

  document.body.classList.add('printing');
  root.classList.add('print-root');

  const cleanup = () => {
    document.body.classList.remove('printing');
    root.classList.remove('print-root');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);
  window.print();
  // Safari/iOS do not always emit afterprint.
  window.setTimeout(cleanup, 1500);
}
