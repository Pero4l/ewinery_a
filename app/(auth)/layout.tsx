export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#722f37]/5 via-[#f5f0ed] to-[#722f37]/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#722f37]">eWinery</h1>
          <p className="text-muted-foreground mt-1">Admin Dashboard</p>
        </div>
        {children}
      </div>
    </div>
  );
}
