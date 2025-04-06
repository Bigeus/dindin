import React from "react";
import { MoonLoader } from "react-spinners";

interface LoadingProps {
  isLoading: boolean;
}

const Loading: React.FC<LoadingProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      style={{
        width: '100vw', // Garante a largura total
        height: '100vh', // Garante a altura total
        top: 0,
        left: 0,
      }}
    >
      <MoonLoader color="green" size={60} />
    </div>
  );
};

export default Loading;
