import { Wrapper } from "@components/ui";

export default function Loading() {
  return (
    <Wrapper>
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-columbiaYellow border-t-transparent" />
      </div>
    </Wrapper>
  );
}
