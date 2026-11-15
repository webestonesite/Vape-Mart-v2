export interface NavLinkDTO {
  title: string;
  url: string;
  items?: NavLinkDTO[];
}

export interface SiteSettingsDTO {
  storeName: string;
  logoUrl?: string;
  faviconUrl?: string;
  showAnnouncement: boolean;
  announcementText?: string;
  announcementCollection?: string;
  supportPhone?: string;
  supportEmail?: string;
  footerAbout?: string;
  copyrightText?: string;
}

export interface LayoutNavigationDTO {
  settings: SiteSettingsDTO;
  mainMenu: NavLinkDTO[];
  footerMenu: NavLinkDTO[];
}

