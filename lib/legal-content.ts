import { SITE_CONTACT_EMAIL } from "@/lib/site-contact";

/** Shown at top of Terms, Privacy, and Disclaimer. */
export const LEGAL_LAST_UPDATED = "May 19, 2026";

export const LEGAL_OPERATOR = "SNG LABS LLC";
export const LEGAL_PRODUCT = "Stadium Slop";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

function contactParagraph(intro: string): string {
  return `${intro} Email ${SITE_CONTACT_EMAIL}.`;
}

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of these Terms",
    paragraphs: [
      `These Terms of Use ("Terms") govern your access to and use of the ${LEGAL_PRODUCT} website, apps, and related services (collectively, the "Service") operated by ${LEGAL_OPERATOR} ("we," "us," or "our").`,
      "By accessing or using the Service, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the Service."
    ]
  },
  {
    id: "service",
    title: "2. What Stadium Slop is",
    paragraphs: [
      `${LEGAL_PRODUCT} is an independent, fan-powered guide for stadium and arena concession food and drinks. Fans may browse venues, view Slop Scores and scorecards, submit structured reviews, upload optional photos, report prices, suggest corrections, and flag content.`,
      "We may add, change, or remove features at any time. The Service is provided for general information and entertainment—not as professional, medical, legal, or food-safety advice."
    ]
  },
  {
    id: "non-affiliation",
    title: "3. No affiliation with venues, teams, or leagues",
    paragraphs: [
      `${LEGAL_PRODUCT} is not affiliated with, endorsed by, or sponsored by any stadium, arena, team, league, concessionaire, or vendor unless we clearly state otherwise in writing on a specific listing.`,
      "Team names, venue names, logos, and menu references may appear for identification and fan context only. All trademarks belong to their respective owners."
    ]
  },
  {
    id: "eligibility",
    title: "4. Eligibility and accounts",
    bullets: [
      "You must be at least 13 years old to use the Service.",
      "You must be at least 21 years old to view, submit, or interact with alcohol-related listings where age gates apply.",
      "You are responsible for your account credentials and for activity under your account.",
      "You agree to provide accurate information and to keep it reasonably up to date."
    ]
  },
  {
    id: "user-content-license",
    title: "5. Your content and license to us",
    paragraphs: [
      `You retain ownership of content you submit (reviews, photos, notes, reports, and similar material) ("User Content"). By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, sublicensable license to host, store, reproduce, adapt, publish, display, distribute, and otherwise use User Content in connection with operating, promoting, and improving the Service.`,
      "This license includes the right to show User Content on venue and item pages, scorecards, rankings, and marketing materials that describe the Service. You represent that you have all rights needed to grant this license and that your User Content does not violate law or third-party rights."
    ],
    bullets: [
      "Do not submit content you do not have permission to share.",
      "Do not include personal information about others without consent.",
      "We may remove or refuse User Content at our discretion."
    ]
  },
  {
    id: "prohibited",
    title: "6. Prohibited conduct",
    bullets: [
      "Harassment, hate speech, threats, or illegal activity.",
      "False, misleading, or fraudulent reviews or price reports.",
      "Spam, scraping, or automated access that burdens the Service.",
      "Impersonation of venues, teams, staff, or other users.",
      "Uploading malware or attempting to breach security.",
      "Circumventing age gates or alcohol restrictions.",
      "Infringing copyright, trademark, or other intellectual property."
    ]
  },
  {
    id: "moderation",
    title: "7. Moderation and reporting",
    paragraphs: [
      "We may review, moderate, hide, or remove User Content and accounts that violate these Terms or that we believe harm the community or the Service.",
      `Fans can flag reviews, photos, or other material via our report flow at /report-content or by emailing ${SITE_CONTACT_EMAIL}. We are not obligated to take action on every report but will use reasonable efforts to address serious issues.`,
      "Repeated violations may result in suspension or termination of access."
    ]
  },
  {
    id: "alcohol",
    title: "8. Alcohol-related content",
    paragraphs: [
      "Some listings involve alcoholic beverages. Availability, pricing, and rules vary by venue and event. You must comply with local law and venue policy.",
      `${LEGAL_PRODUCT} does not sell alcohol. We do not verify your age beyond any on-site age gate we provide. Always drink responsibly. Do not drink and drive.`
    ]
  },
  {
    id: "dmca",
    title: "9. Copyright and DMCA",
    paragraphs: [
      "We respect intellectual property rights. If you believe content on the Service infringes your copyright, send a notice that includes:",
      contactParagraph("Send DMCA notices to:"),
      "We may remove or disable access to material after a valid notice and may terminate repeat infringers. Counter-notices may be sent to the same address if you believe material was removed in error."
    ],
    bullets: [
      "Identification of the copyrighted work and the material you claim is infringing (with URLs on our Service).",
      "Your contact information and a statement of good-faith belief that use is not authorized.",
      "A statement, under penalty of perjury, that the information is accurate and that you are the owner or authorized agent.",
      "Your physical or electronic signature."
    ]
  },
  {
    id: "promoted",
    title: "10. Promoted and partner listings",
    paragraphs: [
      "Some items or venues may be labeled as promoted, featured, or partner content. We will disclose paid or sponsored placement clearly when it applies.",
      "Promoted placement does not change our fan-powered review model unless we say so on the listing."
    ]
  },
  {
    id: "disclaimer-warranty",
    title: "11. Disclaimers",
    paragraphs: [
      `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.`,
      "Slop Scores, rankings, menus, sections, prices, and fan signals reflect crowd opinion and may be incomplete or outdated. Verify important details at the stand."
    ]
  },
  {
    id: "liability",
    title: "12. Limitation of liability",
    paragraphs: [
      `TO THE FULLEST EXTENT PERMITTED BY LAW, ${LEGAL_OPERATOR} AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.`,
      "Our total liability for any claim relating to the Service is limited to the greater of (a) amounts you paid us in the twelve months before the claim or (b) one hundred U.S. dollars ($100)."
    ]
  },
  {
    id: "indemnity",
    title: "13. Indemnification",
    paragraphs: [
      "You agree to defend, indemnify, and hold harmless us and our affiliates from claims, damages, losses, and expenses (including reasonable attorneys' fees) arising from your User Content, your use of the Service, or your violation of these Terms."
    ]
  },
  {
    id: "changes",
    title: "14. Changes to these Terms",
    paragraphs: [
      "We may update these Terms from time to time. We will post the revised Terms with an updated date. Continued use after changes means you accept the revised Terms."
    ]
  },
  {
    id: "law",
    title: "15. Governing law",
    paragraphs: [
      "These Terms are governed by the laws of the State of Delaware, USA, without regard to conflict-of-law rules, except where mandatory local law applies.",
      "Disputes will be resolved in the state or federal courts located in Delaware, and you consent to personal jurisdiction there."
    ]
  },
  {
    id: "contact",
    title: "16. Contact",
    paragraphs: [contactParagraph("Questions about these Terms:")]
  }
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "intro",
    title: "1. Overview",
    paragraphs: [
      `This Privacy Policy describes how ${LEGAL_OPERATOR} ("we") collects, uses, and shares information when you use ${LEGAL_PRODUCT} (the "Service").`,
      "By using the Service, you agree to this Policy. If you do not agree, do not use the Service."
    ]
  },
  {
    id: "controller",
    title: "2. Who we are",
    paragraphs: [
      `${LEGAL_OPERATOR} operates ${LEGAL_PRODUCT}.`,
      contactParagraph("Privacy questions:")
    ]
  },
  {
    id: "collect",
    title: "3. Information we collect",
    bullets: [
      "Account information you provide (such as email, display name, or profile details).",
      "Review data you submit (Slop Score, napkins, replay value, price check, notes, and optional photos).",
      "User Content you upload, including images processed by our photo hosting provider.",
      "Corrections, price reports, claim inquiries, and content reports you send.",
      "Approximate or event-day location signals when you submit a verified game-day review (where enabled).",
      "Technical data: IP address, browser type, device identifiers, cookies, and usage logs.",
      "Communications you send to us by email or through forms."
    ]
  },
  {
    id: "use",
    title: "4. How we use information",
    bullets: [
      "Operate the Service, including displaying reviews, scorecards, and venue rankings.",
      "Authenticate users, prevent abuse, and enforce our Terms.",
      "Moderate content and respond to reports.",
      "Improve features, analytics, and reliability.",
      "Send service-related messages (we do not sell your email for third-party marketing).",
      "Comply with law and protect rights, safety, and security."
    ]
  },
  {
    id: "sharing",
    title: "5. How we share information",
    paragraphs: [
      "We do not sell your personal information. We may share information:"
    ],
    bullets: [
      "With service providers who help us host, store, analyze, or deliver the Service (for example, hosting, image CDN, and email).",
      "When you choose to make User Content public on venue or item pages.",
      "If required by law, regulation, legal process, or governmental request.",
      "To protect the rights, property, or safety of us, users, or others.",
      "In connection with a merger, acquisition, or sale of assets (with notice where required)."
    ]
  },
  {
    id: "user-content-public",
    title: "6. Public fan content",
    paragraphs: [
      "Reviews, photos, scores, and similar submissions may be visible to other visitors on item pages, scorecards, and venue scoreboards. Do not include sensitive personal data in public fields.",
      "You can request removal of your content by contacting us; we may retain backups for a limited period as described below."
    ]
  },
  {
    id: "alcohol-privacy",
    title: "7. Alcohol-related listings",
    paragraphs: [
      "Where age gates apply, we may store your age-confirmation choice in a browser cookie or local storage so you are not prompted on every visit.",
      "Alcohol-related pages are intended for users 21+. We do not collect government ID numbers through the public Service."
    ]
  },
  {
    id: "cookies",
    title: "8. Cookies and similar technologies",
    paragraphs: [
      "We use cookies and similar technologies for session management, preferences (including age gates), security, and basic analytics. You can control cookies through your browser settings; some features may not work if cookies are disabled."
    ]
  },
  {
    id: "retention",
    title: "9. Data retention",
    paragraphs: [
      "We retain information as long as needed to operate the Service, comply with law, resolve disputes, and enforce agreements. We may delete or anonymize inactive accounts and old logs on a reasonable schedule."
    ]
  },
  {
    id: "security",
    title: "10. Security",
    paragraphs: [
      "We use reasonable administrative, technical, and organizational measures to protect information. No method of transmission or storage is 100% secure."
    ]
  },
  {
    id: "choices",
    title: "11. Your choices and rights",
    bullets: [
      "Access or update account information through your profile where available.",
      "Request deletion of your account or User Content by emailing us.",
      "Opt out of non-essential cookies via browser controls.",
      "California residents may have additional rights under the CCPA/CPRA, including rights to know, delete, and correct personal information. Contact us to exercise applicable rights."
    ]
  },
  {
    id: "children",
    title: "12. Children",
    paragraphs: [
      "The Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. Contact us if you believe we have done so and we will delete it."
    ]
  },
  {
    id: "international",
    title: "13. International users",
    paragraphs: [
      "We are based in the United States. If you access the Service from other regions, your information may be processed in the U.S. and other countries with different data-protection laws."
    ]
  },
  {
    id: "changes-privacy",
    title: "14. Changes to this Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time. We will post the revised Policy with an updated date. Material changes may be highlighted on the Service."
    ]
  },
  {
    id: "contact-privacy",
    title: "15. Contact",
    paragraphs: [contactParagraph("Privacy inquiries:")]
  }
];

export const DISCLAIMER_SECTIONS: LegalSection[] = [
  {
    id: "independent",
    title: "Independent fan guide",
    paragraphs: [
      `${LEGAL_PRODUCT} is an independent, fan-powered food and drink guide operated by ${LEGAL_OPERATOR}. Content reflects crowd opinion—not official guidance from any stadium, team, league, concessionaire, or vendor unless we clearly label a partner relationship.`
    ]
  },
  {
    id: "non-affiliation-disclaimer",
    title: "No affiliation",
    paragraphs: [
      "Reference to teams, venues, leagues, stands, or menu items is for identification and fan discussion only. We are not affiliated with, endorsed by, or sponsored by those entities unless explicitly stated on a specific page.",
      "Trademarks and logos belong to their respective owners."
    ]
  },
  {
    id: "accuracy",
    title: "Menus, prices, and availability",
    paragraphs: [
      "Sections, vendors, prices, and items can change by game, season, or event. Imported menu data and fan reports may be incomplete or out of date.",
      "Always confirm price, ingredients, allergens, and availability at the stand if it matters to you."
    ]
  },
  {
    id: "scores",
    title: "Slop Scores and rankings",
    paragraphs: [
      "Slop Scores, Fresh signals, Fan Favorite badges, and scoreboard rankings are fan-generated summaries. They are opinions for entertainment and discovery—not quality certifications, health inspections, or professional reviews.",
      "Badge thresholds and rankings can change as more fans review items."
    ]
  },
  {
    id: "ugc",
    title: "User-generated content",
    paragraphs: [
      "Photos, reviews, and notes come from fans. We moderate reported content but do not guarantee accuracy, safety, or appropriateness of every submission.",
      `To report a problem, use /report-content or email ${SITE_CONTACT_EMAIL}.`
    ]
  },
  {
    id: "alcohol-disclaimer",
    title: "Alcohol",
    paragraphs: [
      `Alcohol listings are for adults 21+ where law requires. Availability varies by venue. ${LEGAL_PRODUCT} does not sell or serve alcohol.`,
      "Drink responsibly. Never drink and drive. Follow venue and local rules."
    ]
  },
  {
    id: "health",
    title: "Health, allergens, and safety",
    paragraphs: [
      "We do not provide medical, nutritional, or allergen advice. If you have dietary restrictions or health concerns, speak with venue staff before ordering."
    ]
  },
  {
    id: "third-party",
    title: "Third-party links and services",
    paragraphs: [
      "The Service may link to third-party sites or use third-party tools (for example, image hosting or social profiles). We are not responsible for their content or privacy practices."
    ]
  },
  {
    id: "no-reliance",
    title: "No reliance",
    paragraphs: [
      "You use the Service at your own risk. We disclaim liability for decisions you make based on fan reviews, scores, photos, or listings.",
      "For full legal terms, see our Terms of Use and Privacy Policy."
    ]
  },
  {
    id: "contact-disclaimer",
    title: "Contact",
    paragraphs: [contactParagraph("Questions about this Disclaimer:")]
  }
];
