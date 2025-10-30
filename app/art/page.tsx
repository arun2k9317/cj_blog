import Image from "next/image";
import Link from "next/link";

export default function Art404() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <Image
          src="/logo.png"
          alt="NJ Photography Logo"
          width={120}
          height={120}
          className="mx-auto mb-4"
        />
        <h1 className="text-[15px] font-bold uppercase tracking-widest text-gray-900">
          404 — Art page not found
        </h1>
        <p className="text-[13px] text-gray-600 mt-2">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="inline-block mt-6 text-[13px] underline text-gray-900"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
