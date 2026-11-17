import { ExampleView } from "@/components/example";

export const metadata = { title: "Exemplu" };

// Placeholder screen so the kit runs out of the box. Delete it (and components/example.tsx) once the real mock
// screens exist. Server page + client view: a client page cannot export metadata.
export default function Exemplu() {
  return (
    <main className="mx-auto grid max-w-[1200px] gap-4 px-4 pb-40 pt-6 sm:px-6 sm:pt-8">
      <h1 className="text-xl font-semibold">Exemplu</h1>
      <ExampleView />
    </main>
  );
}
