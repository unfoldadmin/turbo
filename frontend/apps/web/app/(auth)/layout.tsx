export default function AuthLayout({
  children
}: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
