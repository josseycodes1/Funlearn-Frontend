import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  error?: string;
}

export default function AuthLayout({ children, title, subtitle, error }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-funlearn1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900">Funlearn</h1>
          </Link>
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="mt-2 text-gray-600">{subtitle}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-funlearn2 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}