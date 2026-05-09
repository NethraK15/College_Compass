export default function ErrorState({ message }: { message: string }) {
  return (
    <div className="card border-red-200 bg-red-50 p-6">
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}
