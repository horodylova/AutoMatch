import React from "react";

interface QuizHeaderProps {
  onExit: () => void;
}

export default function QuizHeader({ onExit }: QuizHeaderProps) {
  return (
    <button 
      onClick={onExit}
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "var(--kendo-color-tertiary-subtle)",
        border: "1px solid var(--kendo-color-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        transition: "transform 0.2s ease, background-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.backgroundColor = "var(--kendo-color-surface)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.backgroundColor = "var(--kendo-color-tertiary-subtle)";
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="var(--kendo-color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
