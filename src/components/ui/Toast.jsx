export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="chai-toast fixed bottom-30 right-5 z-50 max-w-xs rounded-lg border border-token bg-card px-4 py-3 text-sm text-ink shadow-2xl">
      <span className="text-ai mr-1.5">●</span>{message}
    </div>
  );
}