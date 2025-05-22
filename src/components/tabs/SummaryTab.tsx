
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, Volume2, Copy } from 'lucide-react';

interface SummaryTabProps {
  videoId: string;
}

interface KeyPoint {
  point: string;
  timestamp: string;
}

interface Summary {
  title: string;
  mainSummary: string;
  language: string;
  keyPoints: KeyPoint[];
}

const SummaryTab: React.FC<SummaryTabProps> = ({ videoId }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a cached summary
    if (videoId) {
      chrome.storage.local.get([`summary_${videoId}`], (result) => {
        if (result[`summary_${videoId}`]) {
          setSummary(result[`summary_${videoId}`]);
        }
      });
    }
  }, [videoId]);

  const generateSummary = async () => {
    if (!videoId) return;

    setLoading(true);
    setError(null);

    try {
      // In a real extension, this would call your background script
      // which would then use an API to generate the summary
      chrome.runtime.sendMessage(
        { action: "generateSummary", videoId },
        (response) => {
          if (response.error) {
            setError(response.error);
            toast({
              variant: "destructive",
              title: "Error",
              description: response.error
            });
          } else {
            // For this demo, we'll create a mock summary
            const mockSummary: Summary = {
              title: "Understanding YouTube API Integration",
              mainSummary: "This video explains how to integrate YouTube APIs into web applications. The presenter covers authentication, fetching video data, and processing transcripts. The content is beginner-friendly and includes practical examples of code implementation.",
              language: "English",
              keyPoints: [
                { point: "YouTube API Setup", timestamp: "0:30" },
                { point: "Authentication Methods", timestamp: "5:45" },
                { point: "Fetching Video Metadata", timestamp: "10:20" },
                { point: "Working with Transcripts", timestamp: "15:10" },
                { point: "Error Handling", timestamp: "20:35" }
              ]
            };
            
            setSummary(mockSummary);
            
            // Cache the summary
            chrome.storage.local.set({ [`summary_${videoId}`]: mockSummary });
            
            toast({
              title: "Summary Generated",
              description: "Video summary has been created successfully."
            });
          }
          setLoading(false);
        }
      );
    } catch (err) {
      setError("Failed to generate summary. Please try again.");
      setLoading(false);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate summary. Please try again."
      });
    }
  };

  const playSummary = () => {
    if (!summary) return;
    
    const utterance = new SpeechSynthesisUtterance(summary.mainSummary);
    window.speechSynthesis.speak(utterance);
    
    toast({
      title: "Playing Summary",
      description: "Text-to-speech started."
    });
  };

  const copySummary = () => {
    if (!summary) return;
    
    const text = `
      ${summary.title}
      
      ${summary.mainSummary}
      
      Key Points:
      ${summary.keyPoints.map(point => `- ${point.point} (${point.timestamp})`).join('\n')}
    `;
    
    navigator.clipboard.writeText(text);
    
    toast({
      title: "Copied to Clipboard",
      description: "Summary has been copied to your clipboard."
    });
  };

  return (
    <div>
      {!summary ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium mb-4">Generate Video Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create an AI-powered summary of this video with key points and timestamps.
            </p>
            <Button 
              onClick={generateSummary} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCcw size={16} className="mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between mb-2">
            <h3 className="text-lg font-medium">Video Summary</h3>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={playSummary} title="Play summary">
                <Volume2 size={16} />
              </Button>
              <Button size="icon" variant="outline" onClick={copySummary} title="Copy summary">
                <Copy size={16} />
              </Button>
              <Button size="icon" variant="outline" onClick={generateSummary} disabled={loading} title="Refresh summary">
                {loading ? <div className="spinner"></div> : <RefreshCcw size={16} />}
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-1">Main Summary:</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {summary.mainSummary}
              </p>
              
              <h4 className="font-medium text-sm mb-1">Key Points:</h4>
              <ScrollArea className="h-[150px]">
                <ul className="space-y-1">
                  {summary.keyPoints.map((point, index) => (
                    <li key={index} className="text-sm flex justify-between">
                      <span>{point.point}</span>
                      <span className="text-muted-foreground">{point.timestamp}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SummaryTab;
