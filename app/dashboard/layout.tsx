// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Travel Map</span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-4">
              <a href="/about" className="text-gray-600 hover:text-gray-900">
                Giới thiệu
              </a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">
                Liên hệ
              </a>
            </nav>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="flex-grow">{children}</div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Travel Map. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a
                href="/privacy"
                className="text-gray-500 hover:text-gray-900 text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-gray-500 hover:text-gray-900 text-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}