/*! coi-serviceworker v0.1.7 | MIT License | © Guido Zuidhof | https://github.com */
if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));

    self.addEventListener("message", ev => {
        if (ev.data && ev.data.type === "coi-checker") {
            ev.source.postMessage("coi-OK");
        }
    });

    self.addEventListener("fetch", function (event) {
        const request = event.request;
        if (request.cache === "only-if-cached" && request.mode !== "same-origin") {
            return;
        }

        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.status === 0) {
                        return response;
                    }

                    const newHeaders = new Headers(response.headers);
                    newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
                    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: newHeaders,
                    });
                })
                .catch((e) => console.error(e))
        );
    });
} else {
    (() => {
        const shouldRegister = self.crossOriginIsolated === false;
        if (shouldRegister) {
            navigator.serviceWorker.register(window.document.currentScript.src).then(
                (registration) => {
                    registration.addEventListener("updatefound", () => {
                        window.location.reload();
                    });
                    if (registration.active) {
                        window.location.reload();
                    }
                },
                (err) => console.error("COI worker registration failed", err)
            );
        }
    })();
}
