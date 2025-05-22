
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, RotateCcw } from 'lucide-react';

interface Settings {
  openaiApiKey: string;
  useTextToSpeech: boolean;
  useDarkMode: boolean;
  preferredLanguage: string;
}

const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    openaiApiKey: '',
    useTextToSpeech: true,
    useDarkMode: true,
    preferredLanguage: 'auto'
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load settings from storage
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings) {
        setSettings(result.settings);
      }
    });
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    
    // Save settings to storage
    chrome.storage.local.set({ settings }, () => {
      setIsSaving(false);
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated."
      });
    });
  };

  const handleReset = () => {
    const defaultSettings: Settings = {
      openaiApiKey: '',
      useTextToSpeech: true,
      useDarkMode: true,
      preferredLanguage: 'auto'
    };
    
    setSettings(defaultSettings);
    
    // Save default settings to storage
    chrome.storage.local.set({ settings: defaultSettings }, () => {
      toast({
        title: "Settings Reset",
        description: "Your preferences have been reset to default values."
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-2">
        <h3 className="text-lg font-medium">Settings</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleReset}
        >
          <RotateCcw size={14} className="mr-1" />
          Reset
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">OpenAI API Key (Optional)</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="sk-..."
              value={settings.openaiApiKey}
              onChange={(e) => setSettings({...settings, openaiApiKey: e.target.value})}
            />
            <p className="text-xs text-muted-foreground">
              Add your API key to use your own OpenAI account.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="text-to-speech">Text to Speech</Label>
              <p className="text-xs text-muted-foreground">
                Enable audio reading of summaries
              </p>
            </div>
            <Switch
              id="text-to-speech"
              checked={settings.useTextToSpeech}
              onCheckedChange={(checked) => setSettings({...settings, useTextToSpeech: checked})}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">
                Use dark theme for the extension
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={settings.useDarkMode}
              onCheckedChange={(checked) => setSettings({...settings, useDarkMode: checked})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <select
              id="language"
              className="w-full p-2 rounded-md border border-input bg-transparent"
              value={settings.preferredLanguage}
              onChange={(e) => setSettings({...settings, preferredLanguage: e.target.value})}
            >
              <option value="auto">Auto-detect (from video)</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <>
                <div className="spinner mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <p className="text-xs text-center text-muted-foreground">
        YouTube Learning Assistant v1.0.0
      </p>
    </div>
  );
};

export default SettingsTab;
