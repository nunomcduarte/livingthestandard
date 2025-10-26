import { Bitcoin, Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
              <Bitcoin className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="font-bold">Live the Standard</span>
          </div>

          <p className="text-sm text-muted-foreground text-center">Educational tool for Bitcoin-curious Europeans</p>

          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-xs text-muted-foreground">
          <p>
            Built with data transparency in mind. All calculations are performed client-side. No personal data is
            collected or stored.
          </p>
        </div>
      </div>
    </footer>
  )
}
