import React, { useState } from "react";
import { sendGarageResultsToEmail } from "../../../utils/api";

interface EmailModalProps {
  onClose: () => void;
  results: unknown[];
}

export default function EmailModal({ onClose, results }: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    const result = await sendGarageResultsToEmail(email, results);

    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      zIndex: 2000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "var(--kendo-color-surface)",
        borderRadius: "24px",
        padding: "32px",
        maxWidth: "400px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        border: "1px solid var(--kendo-color-border-alt)",
        animation: "fadeIn 0.2s ease-out",
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "transparent",
            border: "none",
            color: "var(--kendo-color-on-app-surface)",
            opacity: 0.6,
            cursor: "pointer",
            fontSize: "24px",
            lineHeight: 1
          }}
        >
          &times;
        </button>

        {status === "success" ? (
          <>
            <h3 style={{
              fontSize: "24px",
              fontWeight: 800,
              marginBottom: "12px",
              color: "var(--kendo-color-on-app-surface)"
            }}>
              Your garage is parked!
            </h3>
            <p style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--kendo-color-on-app-surface)",
              marginBottom: "28px"
            }}>
              Check your inbox. Your dream garage lineup is waiting for you.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: "16px 32px",
                borderRadius: "99px",
                background: "var(--kendo-color-primary)",
                color: "var(--kendo-color-on-primary)",
                border: "none",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "transform 0.1s ease",
                boxShadow: "0 4px 12px rgba(229,72,63,0.25)"
              }}
            >
              Awesome, thanks!
            </button>
          </>
        ) : (
          <>
            <h3 style={{
              fontSize: "24px",
              fontWeight: 800,
              marginBottom: "8px",
              color: "var(--kendo-color-on-app-surface)"
            }}>
              Save your garage?
            </h3>
            <p style={{
              fontSize: "15px",
              lineHeight: 1.5,
              color: "var(--kendo-color-subtle)",
              marginBottom: "24px"
            }}>
              We&apos;ll park these results in your inbox so you can come back later.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
                <style jsx>{`
                  input::placeholder {
                    text-align: center;
                    color: var(--kendo-color-subtle);
                    opacity: 1;
                  }
                  input:-webkit-autofill,
                  input:-webkit-autofill:hover, 
                  input:-webkit-autofill:focus, 
                  input:-webkit-autofill:active{
                    -webkit-box-shadow: 0 0 0 30px var(--kendo-color-surface-alt) inset !important;
                    -webkit-text-fill-color: var(--kendo-color-on-app-surface) !important;
                    transition: background-color 5000s ease-in-out 0s;
                    caret-color: var(--kendo-color-on-app-surface);
                  }
                `}</style>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid var(--kendo-color-border-alt)",
                    background: "var(--kendo-color-surface-alt)",
                    color: "var(--kendo-color-on-app-surface)",
                    fontSize: "16px",
                    outline: "none",
                    textAlign: "center"
                  }}
                />
              </div>

              {status === "error" && (
                <p style={{ color: "#ff4d4f", marginBottom: "16px" }}>{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  width: "100%",
                  padding: "16px 32px",
                  borderRadius: "99px",
                  background: "var(--kendo-color-primary)",
                  color: "var(--kendo-color-on-primary)",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                  opacity: status === "loading" ? 0.7 : 1,
                  transition: "transform 0.1s ease",
                  boxShadow: "0 4px 12px rgba(229,72,63,0.25)"
                }}
              >
                {status === "loading" ? "Sending..." : "Send Garage Results"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}