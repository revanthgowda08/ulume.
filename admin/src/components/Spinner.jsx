export default function Spinner({ size = 8, className = "" }) {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-primaryLight border-t-primary ${className}`}
      style={{ width: size * 4, height: size * 4 }}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner />
    </div>
  );
}
