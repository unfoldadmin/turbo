export default function AuthLayout({
  children
}: { children: React.ReactNode }) {
  return (
    <div className="flex-grow h-screen flex items-center justify-center -my-12 w-full">
      <div className="w-96">{children}</div>
    </div>
  )
}
