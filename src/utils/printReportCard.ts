/**
 * Production-grade print utility for Dominion Star Global College
 * Handles cross-browser, mobile-responsive, and iframe-isolated printing.
 */

export interface PrintOptions {
  title?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

/**
 * Triggers a clean print dialog using an isolated iframe so that only the
 * intended document content prints without surrounding modals, dark overlays, or URL artifacts.
 * Falls back gracefully to window.print() if iframe operations are restricted.
 */
export function printElement(element: HTMLElement | null, options: PrintOptions = {}): boolean {
  if (!element) {
    if (typeof window !== 'undefined') {
      window.print();
    }
    return false;
  }

  try {
    options.onBeforePrint?.();

    // Prepare isolated iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('title', options.title || 'Print Document');

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      document.body.removeChild(iframe);
      window.print();
      options.onAfterPrint?.();
      return true;
    }

    // Collect all active stylesheets and links from the current page
    const styleSheets = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((tag) => tag.outerHTML)
      .join('\n');

    // Clean cloned content
    const clonedElement = element.cloneNode(true) as HTMLElement;

    // Remove elements marked with no-print
    const noPrintItems = clonedElement.querySelectorAll('.no-print, [data-no-print="true"]');
    noPrintItems.forEach((el) => el.remove());

    const pageTitle = options.title || 'Official Document - Dominion Star Global College';

    // Construct self-contained printable document
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${pageTitle}</title>
          ${styleSheets}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            *, *::before, *::after {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              font-size: 11pt;
              line-height: 1.4;
            }
            .no-print {
              display: none !important;
            }
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              page-break-inside: auto !important;
            }
            tr {
              page-break-inside: avoid !important;
              page-break-after: auto !important;
            }
            td, th {
              page-break-inside: avoid !important;
            }
            img {
              max-width: 100% !important;
            }
            @media print {
              body {
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-document-root" style="width: 100%; margin: 0 auto; background: white;">
            ${clonedElement.outerHTML}
          </div>
        </body>
      </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();

    // Trigger printing once content and images have rendered
    const executePrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.print():', err);
        window.print();
      } finally {
        setTimeout(() => {
          try {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          } catch (_) {}
          options.onAfterPrint?.();
        }, 1500);
      }
    };

    if (iframe.contentWindow) {
      if (doc.readyState === 'complete') {
        setTimeout(executePrint, 250);
      } else {
        iframe.contentWindow.onload = () => {
          setTimeout(executePrint, 250);
        };
      }
    } else {
      setTimeout(executePrint, 500);
    }

    return true;
  } catch (error) {
    console.error('Print utility error:', error);
    window.print();
    options.onAfterPrint?.();
    return false;
  }
}
