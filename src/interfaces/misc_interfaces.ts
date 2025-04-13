export interface UserSession {
    user: {
      id: string;
      name: string;
      email?: string | null;
      image?: string | null;
      type: string;
    };
  }

export interface Country {
    alpha2: string;
    alpha3: string;
    countryCallingCodes: string[];
    currencies: string[];
    emoji?: string;
    ioc: string;
    languages: string[];
    name: string;
    status: string;
  }

declare global {
    interface Window {
        TalkingHead?: any;
        talkingHeadLoaded?: boolean;
        talkingHeadError?: any;
    }
}

// This empty export is needed to make this file a module
export {};

