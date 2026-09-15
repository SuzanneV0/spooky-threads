export default function StaticPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container static-page">
      <h1>{title}</h1>
      <div className="static-page-content">{children}</div>
    </div>
  );
}
