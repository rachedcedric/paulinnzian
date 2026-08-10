import type { ReactNode } from "react";

interface LegalPageProps {
  title: string;
  introduction: string;
  children: ReactNode;
}

export function LegalPage({ title, introduction, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-white pt-20">
      <header className="bg-black px-4 py-14 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-black sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-gray-300">{introduction}</p>
        </div>
      </header>
      <article className="mx-auto max-w-4xl space-y-10 px-4 py-14 text-gray-700 sm:px-6 [&_a]:font-semibold [&_a]:text-[#d95700] [&_a]:underline [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-black [&_li]:ml-5 [&_li]:list-disc [&_li]:leading-7 [&_p]:leading-7">
        {children}
      </article>
    </main>
  );
}