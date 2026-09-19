import { useEffect, useMemo, useState } from "react";

import { FiCheckCircle, FiDownload, FiX } from "react-icons/fi";

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const [installed, setInstalled] = useState(false);

  const [showHelp, setShowHelp] = useState(false);

  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    const userAgent = navigator.userAgent;

    const normalIOS = /iPad|iPhone|iPod/i.test(userAgent);

    // Modern iPads can report themselves as Macintosh.
    const modernIPad =
      /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;

    return normalIOS || modernIPad;
  }, []);

  useEffect(() => {
    const checkInstalled = () => {
      const standalone = window.matchMedia?.(
        "(display-mode: standalone)",
      )?.matches;

      const iosStandalone = window.navigator.standalone === true;

      setInstalled(Boolean(standalone || iosStandalone));
    };

    checkInstalled();

    const handleInstallPrompt = (event) => {
      event.preventDefault();

      setDeferredPrompt(event);
    };

    const handleInstalled = () => {
      setInstalled(true);

      setDeferredPrompt(null);

      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);

      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (installed) {
      return;
    }

    // iPhone/iPad requires Safari's
    // Add to Home Screen flow.
    if (isIOS) {
      setShowHelp(true);

      return;
    }

    // Chrome / Edge / Android native install prompt.
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();

        const choice = await deferredPrompt.userChoice;

        if (choice.outcome === "accepted") {
          setInstalled(true);
        }

        setDeferredPrompt(null);
      } catch (error) {
        console.error("PWA INSTALL ERROR:", error);

        setShowHelp(true);
      }

      return;
    }

    // If browser did not provide native prompt,
    // show manual instructions.
    setShowHelp(true);
  };

  return (
    <>
      <div className="login-install-area">
        <div className="login-install-divider">
          <span>OR</span>
        </div>

        <button
          type="button"
          className={`login-install-btn ${
            installed ? "login-install-btn-installed" : ""
          }`}
          onClick={handleInstall}
          disabled={installed}
        >
          {installed ? (
            <>
              <FiCheckCircle />

              <span>App Installed</span>
            </>
          ) : (
            <>
              <FiDownload />

              <span>Install SmartKhataBook</span>
            </>
          )}
        </button>

        {!installed && (
          <p className="login-install-caption">
            Install on your phone or computer for faster access.
          </p>
        )}
      </div>

      {showHelp && (
        <div
          className="login-install-overlay"
          role="presentation"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="login-install-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-app-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="login-install-close"
              onClick={() => setShowHelp(false)}
              aria-label="Close install instructions"
            >
              <FiX />
            </button>

            <div className="login-install-modal-icon">
              <FiDownload />
            </div>

            <h3 id="install-app-title">Install SmartKhataBook</h3>

            {isIOS ? (
              <>
                <p>On iPhone or iPad, install SmartKhataBook from Safari:</p>

                <div className="login-install-steps">
                  <div>
                    <span>1</span>

                    <p>
                      Open this website in <strong>Safari</strong>.
                    </p>
                  </div>

                  <div>
                    <span>2</span>

                    <p>
                      Tap the <strong>Share</strong> button.
                    </p>
                  </div>

                  <div>
                    <span>3</span>

                    <p>
                      Choose <strong>Add to Home Screen</strong>.
                    </p>
                  </div>

                  <div>
                    <span>4</span>

                    <p>
                      Tap <strong>Add</strong>.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p>Your browser has not shown the automatic install popup.</p>

                <div className="login-install-steps">
                  <div>
                    <span>1</span>

                    <p>Open your browser menu.</p>
                  </div>

                  <div>
                    <span>2</span>

                    <p>
                      Select <strong>Install app</strong> or{" "}
                      <strong>Add to Home Screen</strong>.
                    </p>
                  </div>

                  <div>
                    <span>3</span>

                    <p>Confirm the installation.</p>
                  </div>
                </div>
              </>
            )}

            <button
              type="button"
              className="login-install-done"
              onClick={() => setShowHelp(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
