
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Youtube, FileText, Brain, Zap, Settings } from 'lucide-react';
import SummaryTab from './tabs/SummaryTab';
import QuizTab from './tabs/QuizTab';
import ExportTab from './tabs/ExportTab';
import SettingsTab from './tabs/SettingsTab';
import FocusMode from './FocusMode';
import CommentGenerator from './CommentGenerator';
import ChatGptRedirect from './ChatGptRedirect';

const Popup: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isYouTube, setIsYouTube] = useState<boolean>(false);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [videoId, setVideoId] = useState<string>('');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get current tab info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        setCurrentUrl(tabs[0].url);
        
        // Check if we're on YouTube
        const isYoutube = tabs[0].url.includes('youtube.com/watch');
        setIsYouTube(isYoutube);
        
        if (isYoutube) {
          // Extract video ID from URL
          const url = new URL(tabs[0].url);
          const id = url.searchParams.get('v');
          if (id) {
            setVideoId(id);
            // Get video title from page
            chrome.tabs.sendMessage(
              tabs[0].id!,
              { action: "getVideoInfo" },
              (response) => {
                if (response && response.title) {
                  setVideoTitle(response.title);
                }
              }
            );
          }
        }
      }
    });
    
    // Check if focus mode is active
    chrome.storage.local.get(['focusMode'], (result) => {
      if (result.focusMode) {
        setIsFocusMode(result.focusMode);
      }
    });
  }, []);

  const toggleFocusMode = () => {
    const newMode = !isFocusMode;
    setIsFocusMode(newMode);
    
    // Save to storage
    chrome.storage.local.set({ focusMode: newMode });
    
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id!,
        { action: "toggleFocusMode", value: newMode }
      );
    });
    
    toast({
      title: newMode ? "Focus Mode Activated" : "Focus Mode Deactivated",
      description: newMode 
        ? "Distractions have been hidden." 
        : "YouTube's normal interface has been restored."
    });
  };

  if (!isYouTube) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Youtube size={48} className="text-youtube-red mb-4" />
        <h1 className="text-xl font-bold mb-2">YouTube Learning Assistant</h1>
        <p className="mb-4 text-muted-foreground">
          Please navigate to a YouTube video to use this extension.
        </p>
        <Button 
          variant="default"
          onClick={() => window.open('https://www.youtube.com')}
        >
          Go to YouTube
        </Button>
      </div>
    );
  }

  return (
    <div className="popup-container p-4 dark">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Youtube size={24} className="text-youtube-red mr-2" />
          <h1 className="text-lg font-bold">Learning Assistant</h1>
        </div>
        <Button
          variant={isFocusMode ? "destructive" : "outline"}
          size="sm"
          onClick={toggleFocusMode}
        >
          {isFocusMode ? "Exit Focus Mode" : "Focus Mode"}
        </Button>
      </div>
      
      {videoTitle && (
        <div className="mb-4">
          <h2 className="font-medium text-sm truncate" title={videoTitle}>
            {videoTitle}
          </h2>
        </div>
      )}
      
      <Separator className="my-4" />
      
      <Tabs defaultValue="summary">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
          <TabsTrigger value="quiz" className="text-xs">Quiz</TabsTrigger>
          <TabsTrigger value="export" className="text-xs">Export</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4">
          <SummaryTab videoId={videoId} />
        </TabsContent>
        
        <TabsContent value="quiz" className="space-y-4">
          <QuizTab videoId={videoId} />
        </TabsContent>
        
        <TabsContent value="export" className="space-y-4">
          <ExportTab videoId={videoId} />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
      
      <Separator className="my-4" />
      
      <div className="grid grid-cols-3 gap-2">
        <CommentGenerator videoId={videoId} />
        <ChatGptRedirect videoId={videoId} />
        <a
          href="https://github.com/your-username/youtube-learning-assistant"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center p-2 bg-secondary rounded-lg hover:bg-accent transition-colors"
        >
          <FileText size={20} className="mb-1" />
          <span className="text-xs">Docs</span>
        </a>
      </div>
    </div>
  );
};

export default Popup;
