
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from 'lucide-react';

interface CommentGeneratorProps {
  videoId: string;
}

const CommentGenerator: React.FC<CommentGeneratorProps> = ({ videoId }) => {
  const [generating, setGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  const generateComments = () => {
    if (!videoId) return;
    
    setGenerating(true);
    
    // In a real extension, this would call your background script
    chrome.runtime.sendMessage(
      { action: "generateComments", videoId },
      (response) => {
        if (response.error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: response.error
          });
        } else {
          // Mock response
          const comments = [
            "Great explanation of the concepts! This really helped me understand.",
            "Thanks for sharing this valuable information. Looking forward to more videos!",
            "This is exactly what I was looking for. Well explained!"
          ];
          
          // Show a dialog with comment options
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(
              tabs[0].id!,
              { action: "showCommentDialog", comments }
            );
          });
          
          toast({
            title: "Comments Generated",
            description: "Choose a comment to use from the overlay."
          });
        }
        
        setGenerating(false);
      }
    );
  };

  return (
    <Button 
      variant="secondary" 
      className="flex flex-col items-center justify-center p-2 h-auto"
      onClick={generateComments}
      disabled={generating}
    >
      {generating ? (
        <div className="spinner mb-1"></div>
      ) : (
        <MessageSquare size={20} className="mb-1" />
      )}
      <span className="text-xs">Comments</span>
    </Button>
  );
};

export default CommentGenerator;
