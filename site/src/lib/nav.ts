// Navigation labels & URLs lifted from the original mega-menu (verified verbatim by scripts/verify_content.py).
export type NavItem = { label: string; href: string };
export type NavGroup = { label: string; href?: string; items?: NavItem[] };
export const NAV: NavGroup[] = [
  { label: "Our Products", items: [{ label: "MIMOSA Pro", href: "/mimosa-pro" }] },
  {
    label: "Uses & Applications",
    items: [
      { label: "Wound Care", href: "/uses/wound-care" },
      { label: "Peripheral Vascular Disease", href: "/uses/peripheral-vascular-disease" },
      { label: "Post Op", href: "/uses/post-op" },
      { label: "Pediatrics", href: "/uses/paediatrics" },
      { label: "Burns", href: "/uses/burns" },
      { label: "+ Much More", href: "/uses/much-more" },
    ],
  },
  { label: "Reimbursement Info", href: "/reimbursement" },
  {
    label: "Care Settings",
    items: [
      { label: "Group Practices & Clinics", href: "/care-settings/group-practices-clinics" },
      { label: "Hospitals", href: "/care-settings/hospitals" },
      { label: "Remote Care", href: "/care-settings/home-care" },
      { label: "Emergency Settings", href: "/care-settings/in-the-field" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Ask the Experts", href: "/resources/ask-the-experts" },
      { label: "Our Blog", href: "/blog" },
      { label: "MIMOSA Learning+", href: "/resources/learning-plus" },
      { label: "Publications", href: "/resources/publications" },
      { label: "Case Studies", href: "/resources/case-studies" },
      { label: "Posters", href: "/resources/posters" },
      { label: "Video & Audio", href: "/resources/video-audio-media" },
      { label: "E-Books & Whitepapers", href: "/resources/e-books" },
      { label: "In The Press", href: "/resources/in-the-press" },
      { label: "Reimbursement", href: "/resources/reimbursement" },
    ],
  },
  {
    label: "About Us",
    items: [
      { label: "Our Organization", href: "/about-us" },
      { label: "Our Team", href: "/meet-the-team" },
      { label: "Careers", href: "/careers" },
      { label: "For Investors", href: "/for-investors" },
      { label: "Contact Us", href: "/contact-us" },
    ],
  },
];
export const LOGINS = [
  { label: "USA", href: "https://portal.mimosadiagnostics.com" },
  { label: "CA", href: "https://can.mimosadiagnostics.com" },
];
export const UNIVERSITY = "https://app.vtail.co/onboarding/welcome?referrer=Mimosa%20Diagnostics&aosName=woundcare";
