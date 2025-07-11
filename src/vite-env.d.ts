/// <reference types="vite/client" />

// Atlassian Connect API types
declare global {
  interface Window {
    AP: {
      ready: (callback: () => void) => void;
      resize: () => void;
      confluence: {
        saveMacro: (config: any) => void;
        getContentProperty: (key: string) => Promise<any>;
        setContentProperty: (key: string, value: any) => Promise<void>;
      };
      dialog: {
        close: () => void;
        getButton: (id: string) => {
          enable: () => void;
          disable: () => void;
          bind: (callback: () => void) => void;
        };
      };
      events: {
        emit: (event: string, data?: any) => void;
      };
      request: (options: {
        url: string;
        type?: string;
        data?: any;
        contentType?: string;
      }) => Promise<any>;
      context: {
        getToken: () => string;
      };
    };
  }
}
