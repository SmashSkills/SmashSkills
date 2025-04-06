import React from "react";
import { Editor } from "@tiptap/react";
import { Youtube, Twitter, Video } from "lucide-react";
import ToolbarButton from "./ToolbarButton";

interface EmbedControlsProps {
  editor: Editor;
}

/**
 * Komponente für das Einbetten externer Inhalte
 *
 * Enthält Buttons für:
 * - YouTube-Videos
 * - Tweets
 * - Andere Medien
 */
const EmbedControls: React.FC<EmbedControlsProps> = ({ editor }) => {
  if (!editor) return null;

  const insertYoutubeVideo = () => {
    const url = window.prompt("YouTube-Video-URL eingeben:");
    if (url) {
      // Extrahiere die YouTube-ID aus der URL
      const youtubeId = extractYoutubeId(url);
      if (youtubeId) {
        // Da wir keine iframe-Erweiterung haben, fügen wir HTML direkt ein
        const iframeHtml = `<div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background-color: #f8f8f8; border-radius: 8px; margin: 16px 0;">
          <iframe 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
            src="https://www.youtube.com/embed/${youtubeId}" 
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
          ></iframe>
        </div>`;

        editor.chain().focus().insertContent(iframeHtml).run();
      } else {
        alert("Ungültige YouTube-URL");
      }
    }
  };

  const insertTweet = () => {
    const url = window.prompt("Tweet-URL eingeben:");
    if (url) {
      // Für Tweets brauchen wir eigentlich das Twitter-Widget, aber wir verwenden hier einen Platzhalter
      const tweetHtml = `<div class="tweet-embed" style="border: 1px solid #e1e8ed; border-radius: 12px; padding: 16px; margin: 16px 0; background-color: #fff;">
        <div style="font-weight: bold; margin-bottom: 8px;">Tweet Einbettung</div>
        <div style="margin-bottom: 8px;">Tweet URL: ${url}</div>
        <div style="color: #657786; font-size: 0.875em;">Dies ist ein Platzhalter für einen eingebetteten Tweet. In einer vollständigen Implementierung würde hier das Twitter-Widget angezeigt werden.</div>
      </div>`;

      editor.chain().focus().insertContent(tweetHtml).run();
    }
  };

  const insertOtherEmbed = () => {
    const url = window.prompt("URL des einzubettenden Inhalts eingeben:");
    if (url) {
      // Für andere Inhalte erstellen wir einen generischen Platzhalter
      const embedHtml = `<div class="generic-embed" style="border: 1px solid #e1e8ed; border-radius: 8px; padding: 16px; margin: 16px 0; background-color: #f8f8f8;">
        <div style="font-weight: bold; margin-bottom: 8px;">Eingebetteter Inhalt</div>
        <div style="margin-bottom: 8px;">URL: <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></div>
        <div style="color: #657786; font-size: 0.875em;">Dies ist ein Platzhalter für eingebetteten Inhalt.</div>
      </div>`;

      editor.chain().focus().insertContent(embedHtml).run();
    }
  };

  // Hilfsfunktion zum Extrahieren der YouTube-ID aus einer URL
  const extractYoutubeId = (url: string) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  return (
    <div className="flex gap-1 mr-2 border-r pr-2">
      <ToolbarButton
        onClick={insertYoutubeVideo}
        title="YouTube-Video einfügen"
      >
        <Youtube size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={insertTweet} title="Tweet einfügen">
        <Twitter size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={insertOtherEmbed}
        title="Anderen Inhalt einbetten"
      >
        <Video size={18} />
      </ToolbarButton>
    </div>
  );
};

export default EmbedControls;
