export default function FullWidthDivider({ className = "" }) {
  return (
    <div
      className={`relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] ${className}`}
    >
      <div className="border-t border-black w-full" />
    </div>
  );
}
