import Navbar from "./Navbar";
import Footer from "./Footer";
import { cn } from "../../lib/utils";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main
        className={cn(
          "flex-1 p-6 md:p-10 pt-6 md:pt-12 overflow-x-auto min-h-[calc(100vh-80px)]"
        )}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
}
