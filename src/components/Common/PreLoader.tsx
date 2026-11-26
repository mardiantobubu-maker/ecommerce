import React from "react";

export const Spinner = ({ className = "h-10 w-10" }: { className?: string }) => {
  return (
    <div className={`${className} animate-spin rounded-full border-4 border-solid border-blue border-t-transparent`}></div>
  );
};

const PreLoader = ({ fullScreen = true }: { fullScreen?: boolean }) => {
  if (fullScreen) {
    return (
      <div className="fixed left-0 top-0 z-[9999999] flex h-screen w-screen items-center justify-center bg-white animate-[fadeIn_0.2s_ease-in_forwards] opacity-0 [animation-delay:400ms]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue border-t-transparent"></div>
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center py-10 animate-[fadeIn_0.2s_ease-in_forwards] opacity-0 [animation-delay:400ms]">
      <Spinner />
    </div>
  );
};

export default PreLoader;
