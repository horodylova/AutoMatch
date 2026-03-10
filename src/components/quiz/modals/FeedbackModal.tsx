import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface FeedbackModalProps {
  onClose: () => void;
  destination: string;
}

export default function FeedbackModal({ onClose, destination }: FeedbackModalProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    onClose();
    router.push(destination);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment })
      });
      
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (e) {
      console.error("Failed to save feedback", e);
    } finally {
      setIsSubmitting(false);
      handleClose();
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      zIndex: 2100, // Higher than ExitModal
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
        position: "relative",
        animation: "fadeIn 0.2s ease-out",
        color: "var(--kendo-color-on-app-surface)"
      }}>
        {/* Close X */}
        <button 
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            color: "var(--kendo-color-on-app-surface)",
            opacity: 0.5
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h3 style={{
          fontSize: "24px",
          fontWeight: 800,
          marginBottom: "12px",
          color: "var(--kendo-color-on-app-surface)"
        }}>
          Did We Find Your Match?
        </h3>
        <p style={{
          fontSize: "16px",
          lineHeight: 1.6,
          color: "var(--kendo-color-on-app-surface)",
          opacity: 0.8,
          marginBottom: "24px"
        }}>
          Please rate the accuracy of your results.
        </p>

        {/* Stars */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                transform: rating >= star ? "scale(1.1)" : "scale(1)",
                transition: "transform 0.1s"
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill={rating >= star ? "var(--kendo-color-primary)" : "none"} stroke={rating >= star ? "var(--kendo-color-primary)" : "var(--kendo-color-on-app-surface)"} strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          placeholder="Optional comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{
            width: "100%",
            height: "80px",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid var(--kendo-color-border)",
            background: "var(--kendo-color-surface-alt)",
            color: "var(--kendo-color-on-app-surface)",
            fontSize: "14px",
            resize: "none",
            marginBottom: "24px",
            fontFamily: "inherit",
            boxSizing: "border-box",
            outline: "none"
          }}
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "99px",
            background: rating === 0 ? "var(--kendo-color-surface-alt)" : "var(--kendo-color-primary)",
            color: rating === 0 ? "var(--kendo-color-subtle)" : "var(--kendo-color-on-primary)",
            border: rating === 0 ? "1px solid var(--kendo-color-border)" : "none",
            fontSize: "16px",
            fontWeight: 700,
            cursor: rating === 0 ? "default" : "pointer",
            opacity: isSubmitting ? 0.7 : 1,
            transition: "all 0.2s ease"
          }}
        >
          {isSubmitting ? "Thank you!" : "Send Feedback"}
        </button>
      </div>
    </div>
  );
}
