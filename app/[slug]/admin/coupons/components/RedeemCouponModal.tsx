/**
 * Redeem Coupon Modal
 * Allows staff/owner to redeem coupons via manual entry or QR code scanning
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { validateCouponCode } from "@/app/actions";
import Modal from "@/app/components/ui/Modal";
import ActionButton from "@/app/components/ui/ActionButton";
import Spinner from "@/app/components/ui/Spinner";
import { Scan, QrCode, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface RedeemCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  onRedeemed?: () => void;
}

export default function RedeemCouponModal({
  isOpen,
  onClose,
  tenantSlug,
  onRedeemed,
}: RedeemCouponModalProps) {
  const [code, setCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanAreaRef = useRef<HTMLDivElement>(null);
  const [shouldStartScanning, setShouldStartScanning] = useState(false);

  // Cleanup scanner on unmount or close
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current = null;
          })
          .catch(() => {
            scannerRef.current = null;
          });
      }
    };
  }, []);

  // Stop scanning when modal closes
  useEffect(() => {
    if (!isOpen && scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null;
          setIsScanning(false);
          setShouldStartScanning(false);
        })
        .catch(() => {
          scannerRef.current = null;
          setIsScanning(false);
          setShouldStartScanning(false);
        });
    } else if (!isOpen) {
      // Reset states when modal closes
      setIsScanning(false);
      setShouldStartScanning(false);
    }
  }, [isOpen]);

  const startScanning = () => {
    setError(null);
    setIsScanning(true);
    setShouldStartScanning(true);
  };

  // Initialize scanner after DOM element is rendered
  useEffect(() => {
    if (!shouldStartScanning || !isScanning || !isOpen) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait

    const initializeScanner = async () => {
      // Wait for the DOM element to be available
      const element = document.getElementById("qr-reader");
      if (!element) {
        attempts++;
        if (attempts < maxAttempts) {
          // Try again after a short delay
          timeoutId = setTimeout(initializeScanner, 100);
        } else {
          setError("Failed to initialize scanner. Please try again.");
          setIsScanning(false);
          setShouldStartScanning(false);
        }
        return;
      }

      // Clear any pending timeouts since we found the element
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" }, // Use back camera
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // QR code scanned successfully
            setCode(decodedText);
            stopScanning();
            handleRedeem(decodedText);
          },
          (errorMessage) => {
            // Scanning continues, errors are expected during scanning
            // Only log if it's not a common "not found" error
            if (
              errorMessage &&
              !errorMessage.includes("No QR code found") &&
              !errorMessage.includes("NotFoundException")
            ) {
              // Silently handle scanning errors
            }
          }
        );
      } catch (err) {
        console.error("Error starting QR scanner:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";

        // Provide user-friendly error messages
        if (
          errorMessage.includes("Permission denied") ||
          errorMessage.includes("NotAllowedError")
        ) {
          setError(
            "Camera permission denied. Please allow camera access and try again."
          );
        } else if (
          errorMessage.includes("NotFoundError") ||
          errorMessage.includes("No camera found")
        ) {
          setError(
            "No camera found. Please ensure you have a camera connected."
          );
        } else {
          setError(
            "Failed to start camera. Please check permissions and try again."
          );
        }

        setIsScanning(false);
        setShouldStartScanning(false);
        scannerRef.current = null;
      }
    };

    initializeScanner();

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [shouldStartScanning, isScanning, isOpen, tenantSlug]);

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
    setShouldStartScanning(false);
  };

  const handleRedeem = async (couponCode?: string) => {
    const codeToRedeem = couponCode || code.trim();

    if (!codeToRedeem) {
      setError("Please enter a coupon code");
      return;
    }

    setIsRedeeming(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await validateCouponCode(tenantSlug, codeToRedeem, true);

      if (result.valid && result.issuedCoupon) {
        setSuccess(
          result.message || `Coupon "${codeToRedeem}" redeemed successfully!`
        );
        setCode("");
        // Call callback to refresh list
        if (onRedeemed) {
          setTimeout(() => {
            onRedeemed();
            onClose();
            setSuccess(null);
          }, 1500);
        } else {
          setTimeout(() => {
            onClose();
            setSuccess(null);
          }, 1500);
        }
      } else {
        setError(result.message || result.error || "Failed to redeem coupon");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred while redeeming"
      );
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleClose = () => {
    if (isScanning) {
      stopScanning();
    }
    setCode("");
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Redeem Coupon"
      size="lg"
    >
      <div className="space-y-6">
        {/* Manual Entry */}
        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-zinc-50">
            Enter Coupon Code
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isRedeeming && !isScanning) {
                  handleRedeem();
                }
              }}
              placeholder="Enter coupon code"
              disabled={isScanning || isRedeeming}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-black placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
            />
            <ActionButton
              onClick={() => handleRedeem()}
              disabled={!code.trim() || isRedeeming || isScanning}
              className="sm:w-auto"
            >
              {isRedeeming ? (
                <>
                  <Spinner size="sm" className="inline" />
                  Redeeming...
                </>
              ) : (
                "Redeem"
              )}
            </ActionButton>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-300 dark:border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
              Or
            </span>
          </div>
        </div>

        {/* QR Scanner */}
        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-zinc-50">
            Scan QR Code
          </label>
          {!isScanning ? (
            <ActionButton
              icon={QrCode}
              onClick={startScanning}
              disabled={isRedeeming}
              variant="secondary"
            >
              Start Camera Scanner
            </ActionButton>
          ) : (
            <div className="space-y-4">
              <div
                id="qr-reader"
                ref={scanAreaRef}
                className="mx-auto w-full max-w-md rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden"
              />
              <ActionButton
                icon={Scan}
                onClick={stopScanning}
                variant="secondary"
              >
                Stop Scanner
              </ActionButton>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
