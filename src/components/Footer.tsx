type Dict = {
  footer: { copyright: string; tagline: string };
};

export default function Footer({ dict }: { dict: Dict }) {
  return (
    <footer className="mt-auto border-t border-card-border py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted">
        <p className="font-medium">{dict.footer.copyright}</p>
        <p className="mt-1">{dict.footer.tagline}</p>
        <p className="mt-2">&copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
