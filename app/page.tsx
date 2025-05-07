import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Leadgen Approvals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Agency Access</h2>
          <p className="mb-4">Upload and manage ad creatives for client approval</p>
          <Link href="/upload" className="text-blue-600 hover:underline">
            Go to Agency Dashboard
          </Link>
        </div>
        <div className="p-6 border rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Client Access</h2>
          <p className="mb-4">Review and approve ad creatives</p>
          <Link href="/library" className="text-blue-600 hover:underline">
            Browse Creative Library
          </Link>
        </div>
      </div>
    </div>
  );
} 