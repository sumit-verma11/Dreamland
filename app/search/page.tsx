import { Loader2 } from "lucide-react";
import { Suspense } from "react";

import { Navbar } from "@/components/nav/navbar";
import { SearchPage } from "@/components/search/search-page";

export const dynamic = "force-dynamic";

function SearchFallback() {
  return (
    <div className="flex flex-1 items-center justify-center py-32 text-muted-foreground">
      <Loader2 className="mr-2 size-5 animate-spin" />
      Loading…
    </div>
  );
}

export default function Page() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<SearchFallback />}>
        <SearchPage />
      </Suspense>
    </>
  );
}
