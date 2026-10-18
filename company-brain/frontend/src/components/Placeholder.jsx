import React from "react";

export default function Placeholder({ title }) {
  return (
    <div className="flex h-full items-center justify-center bg-panel-bg rounded">
      <h2 className="text-2xl font-medium text-text-secondary">{title}</h2>
    </div>
  );
}
