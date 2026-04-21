export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#060D18]">
      <div className="w-full max-w-md rounded-2xl border border-[#1C2A3D] bg-[#0C1220] p-8">
        {children}
      </div>
    </div>
  );
}
