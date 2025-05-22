
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FilePdf, FileText, Download } from 'lucide-react';

interface ExportTabProps {
  videoId: string;
}

const ExportTab: React.FC<ExportTabProps> = ({ videoId }) => {
  const [exporting, setExporting] = useState<boolean>(false);
  const [formatType, setFormatType] = useState<'pdf' | 'docx'>('pdf');
  const { toast } = useToast();

  const handleExport = async (type: 'pdf' | 'docx') => {
    setFormatType(type);
    setExporting(true);
    
    // In a real extension, this would call your background script
    // to generate the export file
    try {
      chrome.runtime.sendMessage(
        { action: "exportNotes", videoId, format: type },
        (response) => {
          if (response.error) {
            toast({
              variant: "destructive",
              title: "Export Failed",
              description: response.error
            });
          } else {
            // In a real extension, this would trigger a download
            toast({
              title: "Export Successful",
              description: `Notes exported as ${type.toUpperCase()} successfully.`
            });
            
            // Mock download by opening a new tab
            // In a real extension, you would use chrome.downloads.download()
            window.open("https://example.com/download-mock", "_blank");
          }
          setExporting(false);
        }
      );
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export notes. Please try again."
      });
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Export Notes</h3>
      
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Export video summary, key points, and quiz as a document.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => handleExport('pdf')}
              disabled={exporting}
            >
              {exporting && formatType === 'pdf' ? (
                <div className="spinner mb-2"></div>
              ) : (
                <FilePdf size={24} className="mb-2" />
              )}
              <span className="text-sm">Export as PDF</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex flex-col"
              onClick={() => handleExport('docx')}
              disabled={exporting}
            >
              {exporting && formatType === 'docx' ? (
                <div className="spinner mb-2"></div>
              ) : (
                <FileText size={24} className="mb-2" />
              )}
              <span className="text-sm">Export as DOCX</span>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Exports include summary, key points, and quizzes.
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium text-sm mb-2">Export Preview</h4>
          <div className="h-[100px] border rounded-md flex items-center justify-center bg-muted">
            <p className="text-sm text-muted-foreground">
              Summary and quiz will be included in the export.
            </p>
          </div>
          
          <div className="flex justify-center mt-4">
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => handleExport('pdf')}
              disabled={exporting}
            >
              {exporting ? (
                <div className="spinner mr-2"></div>
              ) : (
                <Download size={16} className="mr-2" />
              )}
              Quick Export (PDF)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportTab;
