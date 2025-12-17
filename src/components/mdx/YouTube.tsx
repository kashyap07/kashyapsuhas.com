interface YouTubeProps {
  id: string;
  title?: string;
}

export function YouTube({ id, title = "YouTube video" }: YouTubeProps) {
  return (
    <div className="my-6">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
