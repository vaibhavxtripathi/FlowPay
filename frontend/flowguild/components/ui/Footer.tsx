import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--border)] relative">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-3">
        <div>
          <div className="text-lg brand flex items-center gap-2 mb-4">
            <Image src="/logo.png" alt="FlowGuild" width={32} height={32} className="rounded-lg" />
            FlowGuild
          </div>
          <p className="text-sm text-[color:var(--muted)] leading-relaxed">
            Automated team treasury & payouts — transparent and on-chain.
          </p>
        </div>
        <div className="text-sm">
          <div className="font-semibold text-white mb-3">Product</div>
          <ul className="space-y-2 text-[color:var(--muted)]">
            <li className="hover:text-white transition-colors cursor-pointer">
              Guild payouts
            </li>
            <li className="hover:text-white transition-colors cursor-pointer">
              Member shares
            </li>
            <li className="hover:text-white transition-colors cursor-pointer">
              Public activity
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="font-semibold text-white mb-3">Legal</div>
          <ul className="space-y-2 text-[color:var(--muted)]">
            <li className="hover:text-white transition-colors cursor-pointer">
              Terms
            </li>
            <li className="hover:text-white transition-colors cursor-pointer">
              Privacy
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[color:var(--border)] py-6">
        <div className="mx-auto max-w-7xl px-6 text-xs text-[color:var(--muted)] flex flex-col md:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} FlowGuild. All rights reserved.
          </span>
          <span>
            Made with ❤️ by{" "}
            <a
              href="https://github.com/vaibhavxtripathi"
              target="_blank"
              rel="noreferrer"
              className="text-white hover:text-[color:var(--accent)] transition-colors underline"
            >
              Vaibhav
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
