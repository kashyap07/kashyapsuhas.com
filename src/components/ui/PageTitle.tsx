import cn from "@utils/cn";

export default function PageTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "title mb-4 w-full text-heading-md font-medium md:text-display",
        className,
      )}
    >
      <span className="relative">{children}</span>
    </h1>
  );
}
