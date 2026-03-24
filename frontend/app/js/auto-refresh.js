(function () {
    const CHECK_INTERVAL_MS = 30000;
    const REQUEST_TIMEOUT_MS = 12000;

    let previousSignature = null;
    let checking = false;

    function hashText(text) {
        let hash = 0;
        for (let index = 0; index < text.length; index++) {
            hash = (hash * 31 + text.charCodeAt(index)) | 0;
        }
        return String(hash >>> 0);
    }

    function buildUrl() {
        const base = `${window.location.pathname}${window.location.search}`;
        const separator = base.includes('?') ? '&' : '?';
        return `${base}${separator}__ts=${Date.now()}`;
    }

    async function getSignature() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(buildUrl(), {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    Pragma: 'no-cache',
                },
                signal: controller.signal,
            });

            const etag = response.headers.get('etag') || '';
            const lastModified = response.headers.get('last-modified') || '';
            const body = await response.text();
            const bodySlice = body.slice(0, 5000);
            const checksum = hashText(bodySlice);
            return `${response.status}|${etag}|${lastModified}|${body.length}|${checksum}`;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    async function checkAndReload() {
        if (checking || document.hidden) {
            return;
        }

        checking = true;
        try {
            const currentSignature = await getSignature();
            if (!previousSignature) {
                previousSignature = currentSignature;
                return;
            }

            if (currentSignature !== previousSignature) {
                window.location.reload();
                return;
            }

            previousSignature = currentSignature;
        } catch {
        } finally {
            checking = false;
        }
    }

    window.addEventListener('focus', () => {
        checkAndReload();
    });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            checkAndReload();
        }
    });

    window.addEventListener('pageshow', () => {
        checkAndReload();
    });

    setInterval(checkAndReload, CHECK_INTERVAL_MS);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndReload, { once: true });
    } else {
        checkAndReload();
    }
})();