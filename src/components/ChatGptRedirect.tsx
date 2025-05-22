
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from 'lucide-react';

interface ChatGptRedirectProps {
  videoId: string;
}

const ChatGptRedirect: React.FC<ChatGptRedirectProps> = ({ videoId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const redirectToChatGpt = async () => {
    if (!videoId) return;
    
    setLoading(true);
    
    // In a real extension, this would get the summary from storage
    // and redirect to ChatGPT with a pre-filled prompt
    try {
      chrome.storage.local.get([`summary_${videoId}`], (result) => {
        const summary = result[`summary_${videoId}`];
        
        if (!summary) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Please generate a summary before using this feature."
          });
          setLoading(false);
          return;
        }
        
        // Prepare the prompt for ChatGPT
        const promptText = `Video Summary:\n${summary.mainSummary}\n\nHighlight the key topics and help me understand the concept better with examples.`;
        
        // Encode the prompt for URL
        const encodedPrompt = encodeURIComponent(promptText);
        
        // Open ChatGPT in a new tab with pre-filled prompt
        chrome.tabs.create({
          url: `https://chat.openai.com/chat?prompt=${encodedPrompt}`
        });
        
        toast({
          title: "Redirecting to ChatGPT",
          description: "Summary has been copied to prompt."
        });
        
        setLoading(false);
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to redirect to ChatGPT."
      });
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="secondary" 
      className="flex flex-col items-center justify-center p-2 h-auto"
      onClick={redirectToChatGpt}
      disabled={loading}
    >
      {loading ? (
        <div className="spinner mb-1"></div>
      ) : (
        <MessageCircle size={20} className="mb-1" />
      )}
      <span className="text-xs">Ask ChatGPT</span>
    </Button>
  );
};

export default ChatGptRedirect;
