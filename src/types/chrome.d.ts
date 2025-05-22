
// Type definitions for Chrome extension API
declare namespace chrome {
  namespace tabs {
    function query(queryInfo: { active: boolean; currentWindow: boolean }, callback: (tabs: chrome.tabs.Tab[]) => void): void;
    function create(createProperties: { url: string }): void;
    function sendMessage(tabId: number, message: any, responseCallback?: (response: any) => void): void;
    
    interface Tab {
      id?: number;
      url?: string;
      title?: string;
    }
  }
  
  namespace runtime {
    function sendMessage(message: any, responseCallback?: (response: any) => void): void;
    const onMessage: {
      addListener(callback: (message: any, sender: any, sendResponse: (response?: any) => void) => void): void;
    };
  }
  
  namespace storage {
    interface StorageArea {
      get(keys: string | string[] | Object | null, callback?: (items: { [key: string]: any }) => void): void;
      set(items: Object, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
    }
    
    const local: StorageArea;
    const sync: StorageArea;
  }
  
  namespace downloads {
    function download(options: { url: string; filename?: string; saveAs?: boolean }): void;
  }
}
