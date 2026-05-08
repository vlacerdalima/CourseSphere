import { VideoOff, ExternalLink } from "lucide-react";
import { toEmbedUrl } from "@/lib/videoEmbed";

type VideoPlayerProps = {
  videoUrl: string | null;
  title?: string;
};

export function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  if (!videoUrl) {
    return (
      <div className="aspect-video w-full rounded-xl bg-muted flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <VideoOff className="h-12 w-12" />
        <p className="text-sm">Esta aula ainda não tem vídeo.</p>
      </div>
    );
  }

  const embedUrl = toEmbedUrl(videoUrl);

  if (!embedUrl) {
    return (
      <div className="aspect-video w-full rounded-xl bg-muted flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <ExternalLink className="h-12 w-12" />
        <p className="text-sm">Não foi possível incorporar este vídeo.</p>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline"
        >
          Abrir no link original
        </a>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
      <iframe
        src={embedUrl}
        title={title || "Vídeo da aula"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
}
