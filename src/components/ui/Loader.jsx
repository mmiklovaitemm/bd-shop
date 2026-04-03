import React from "react";

const Loader = ({ className = "h-10 w-10" }) => {
  return (
    <div className="flex items-center justify-center p-10">
      <div
        className={`${className} animate-spin rounded-full border-2 border-black/10 border-t-black`}
        role="status"
      />
    </div>
  );
};

export default Loader;
