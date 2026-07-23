import { getAbsoluteUrl } from "@/lib/site-metadata";

export type WorldCupGuideLocale = "en" | "es";

export const WORLD_CUP_GUIDE_PATH_EN = "/world-cup-stadium-food-guide";
export const WORLD_CUP_GUIDE_PATH_ES = "/es/guia-comida-estadios-mundial-2026";

export type WorldCupGuideContent = {
  locale: WorldCupGuideLocale;
  path: string;
  alternateLocale: WorldCupGuideLocale;
  alternatePath: string;
  alternateLanguageLabel: string;
  htmlLang: string;
  metadata: {
    title: string;
    description: string;
    keywords: string[];
  };
  nav: {
    home: string;
    findVenue: string;
    languageSwitchPrefix: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    tagline: string;
    description: string;
  };
  venues: {
    sectionEyebrow: (live: number, total: number) => string;
    countryLabels: { USA: string; Canada: string; Mexico: string };
    venuePageComing: string;
    foodItemsListed: (count: number) => string;
    browseVenue: string;
    comingSoon: string;
    starterCoverage: string;
  };
  howItWorks: {
    heading: string;
    stepLabel: (n: number) => string;
    steps: readonly { title: string; body: string }[];
  };
  cta: {
    heading: string;
    body: string;
    findVenue: string;
    createAccount: string;
  };
  faq: {
    heading: string;
    items: readonly { question: string; answer: string }[];
  };
  disclaimer: string;
  disclaimerLink: string;
};

const EN_FAQ = [
  {
    question: "What food was at 2026 World Cup stadiums?",
    answer:
      "Each host venue had its own concessions—local specialties, international stands, and stadium classics. Stadium Slop still lists items fans and imports added during the tournament."
  },
  {
    question: "Can fans still leave stadium food reviews?",
    answer:
      "Yes at venues that remain active on Stadium Slop. Sign in, pick a venue and food item, and submit during an eligible live event window for that stadium (club games and other supported events—not closed World Cup match windows)."
  },
  {
    question: "Which World Cup stadium had the best food?",
    answer:
      "Rankings reflected fan reviews during the tournament. Browse each host venue on Stadium Slop to compare Slop Scores, photos, and reviews from that period."
  },
  {
    question: "How does Stadium Slop verify reviews?",
    answer:
      "When you review at a venue, Stadium Slop can confirm you are inside the stadium geofence during an eligible event window. That helps separate in-building reviews from off-site guesses."
  },
  {
    question: "What is Stadium Slop?",
    answer:
      "Stadium Slop is an independent, fan-powered guide to stadium food. Browse items, photos, and rankings, then leave verified reviews to help other fans know what to order."
  }
] as const;

const ES_FAQ = [
  {
    question: "¿Qué comida hubo en los estadios del Mundial 2026?",
    answer:
      "Cada estadio sede tuvo sus propios concessions: especialidades locales, stands internacionales y clásicos de estadio. Stadium Slop aún lista platillos que fans e importaciones agregaron durante el torneo."
  },
  {
    question: "¿Pueden los fans seguir dejando reseñas de comida en los estadios?",
    answer:
      "Sí en los estadios que siguen activos en Stadium Slop. Inicia sesión, elige un estadio y un platillo, y envía una reseña durante una ventana de evento elegible (partidos de club u otros eventos—no ventanas cerradas del Mundial)."
  },
  {
    question: "¿Qué estadio del Mundial tuvo la mejor comida?",
    answer:
      "Los rankings reflejaron reseñas de fans durante el torneo. Explora cada estadio sede en Stadium Slop para comparar Slop Scores, fotos y reseñas de ese periodo."
  },
  {
    question: "¿Cómo verifica Stadium Slop las reseñas?",
    answer:
      "Cuando reseñas en un estadio, Stadium Slop puede confirmar que estás dentro del geofence del estadio durante una ventana de evento elegible. Eso ayuda a separar reseñas en el edificio de opiniones fuera del estadio."
  },
  {
    question: "¿Qué es Stadium Slop?",
    answer:
      "Stadium Slop es una guía independiente de comida en estadios impulsada por fans. Explora platillos, fotos y rankings, y deja reseñas verificadas para ayudar a otros fans a saber qué pedir."
  }
] as const;

const CONTENT: Record<WorldCupGuideLocale, WorldCupGuideContent> = {
  en: {
    locale: "en",
    path: WORLD_CUP_GUIDE_PATH_EN,
    alternateLocale: "es",
    alternatePath: WORLD_CUP_GUIDE_PATH_ES,
    alternateLanguageLabel: "Español",
    htmlLang: "en",
    metadata: {
      title: "2026 World Cup Stadium Food Guide (Archive) | Stadium Slop",
      description:
        "Historical guide to food at 2026 World Cup host stadiums on Stadium Slop. Browse venue menus, fan photos, and rankings from the completed tournament.",
      keywords: [
        "2026 World Cup",
        "World Cup stadium food",
        "stadium food guide",
        "FIFA World Cup food archive",
        "host stadium food",
        "Stadium Slop"
      ]
    },
    nav: {
      home: "← Home",
      findVenue: "Find a venue",
      languageSwitchPrefix: "Also available in"
    },
    hero: {
      eyebrow: "Archive · 2026 World Cup complete",
      title: "2026 World Cup Stadium Food Guide",
      tagline: "Historical host-venue food coverage",
      description:
        "The 2026 World Cup is over. This page remains as a historical guide to food at the 16 host stadiums. Venues stay browseable on Stadium Slop for their ongoing club seasons and events."
    },
    venues: {
      sectionEyebrow: (live, total) =>
        `2026 host venues (archive) · ${live} of ${total} on Stadium Slop`,
      countryLabels: {
        USA: "United States",
        Canada: "Canada",
        Mexico: "Mexico"
      },
      venuePageComing: "Venue page coming to Stadium Slop.",
      foodItemsListed: (count) =>
        `${count} ${count === 1 ? "food item" : "food items"} listed`,
      browseVenue: "Browse venue →",
      comingSoon: "Coming soon",
      starterCoverage:
        "Coverage from the tournament remains available. Host venues continue as normal Stadium Slop guides for club games and other events."
    },
    howItWorks: {
      heading: "How Stadium Slop Works",
      stepLabel: (n) => `Step ${n}`,
      steps: [
        {
          title: "Open a host venue",
          body: "Choose a 2026 World Cup stadium page to see the food coverage fans and imports built."
        },
        {
          title: "Browse food items",
          body: "Explore menus, vendors, and standout bites still listed for that stadium."
        },
        {
          title: "See fan photos and rankings",
          body: "Compare Slop Scores, Napkin Ratings, and photos from real visits."
        },
        {
          title: "Review during live venue events",
          body: "Certified reviews open for eligible club or event windows at the stadium—not for closed World Cup match windows."
        }
      ]
    },
    cta: {
      heading: "Keep exploring these host stadiums year-round.",
      body: "World Cup match windows are closed. Browse each venue’s ongoing menu guide and leave reviews when a live eligible event is underway.",
      findVenue: "Find a venue",
      createAccount: "Create an account"
    },
    faq: {
      heading: "Frequently asked questions",
      items: EN_FAQ
    },
    disclaimer:
      "Stadium Slop is an independent fan platform and is not affiliated with or endorsed by FIFA or the FIFA World Cup.",
    disclaimerLink: "Read full disclaimer"
  },
  es: {
    locale: "es",
    path: WORLD_CUP_GUIDE_PATH_ES,
    alternateLocale: "en",
    alternatePath: WORLD_CUP_GUIDE_PATH_EN,
    alternateLanguageLabel: "English",
    htmlLang: "es",
    metadata: {
      title: "Guía de comida en los estadios del Mundial 2026 (archivo) | Stadium Slop",
      description:
        "Guía histórica de comida en los estadios sede del Mundial 2026 en Stadium Slop. Explora menús, fotos de fans y rankings del torneo concluido.",
      keywords: [
        "Mundial 2026",
        "comida estadio Mundial",
        "guía comida estadio",
        "archivo Copa Mundial comida",
        "estadios sede Mundial",
        "Stadium Slop"
      ]
    },
    nav: {
      home: "← Inicio",
      findVenue: "Buscar un estadio",
      languageSwitchPrefix: "También disponible en"
    },
    hero: {
      eyebrow: "Archivo · Mundial 2026 concluido",
      title: "Guía de comida en los estadios del Mundial 2026",
      tagline: "Cobertura histórica de estadios sede",
      description:
        "El Mundial 2026 ya terminó. Esta página permanece como guía histórica de la comida en los 16 estadios sede. Los estadios siguen disponibles en Stadium Slop para sus temporadas de club y otros eventos."
    },
    venues: {
      sectionEyebrow: (live, total) =>
        `Estadios sede 2026 (archivo) · ${live} de ${total} en Stadium Slop`,
      countryLabels: {
        USA: "Estados Unidos",
        Canada: "Canadá",
        Mexico: "México"
      },
      venuePageComing: "La página del estadio llegará pronto a Stadium Slop.",
      foodItemsListed: (count) =>
        `${count} ${count === 1 ? "platillo" : "platillos"} listados`,
      browseVenue: "Ver estadio →",
      comingSoon: "Próximamente",
      starterCoverage:
        "La cobertura del torneo sigue disponible. Los estadios sede continúan como guías normales de Stadium Slop para partidos de club y otros eventos."
    },
    howItWorks: {
      heading: "Cómo funciona Stadium Slop",
      stepLabel: (n) => `Paso ${n}`,
      steps: [
        {
          title: "Abre un estadio sede",
          body: "Elige un estadio del Mundial 2026 para ver la cobertura de comida que fans e importaciones construyeron."
        },
        {
          title: "Explora la comida disponible",
          body: "Revisa menús, vendors y platillos destacados que siguen listados para ese estadio."
        },
        {
          title: "Mira fotos y rankings de fans",
          body: "Compara Slop Scores, Napkin Ratings y fotos de visitas reales."
        },
        {
          title: "Reseña en eventos en vivo del estadio",
          body: "Las reseñas certificadas abren en ventanas elegibles de club u otros eventos—no en ventanas cerradas del Mundial."
        }
      ]
    },
    cta: {
      heading: "Sigue explorando estos estadios sede todo el año.",
      body: "Las ventanas de partidos del Mundial están cerradas. Explora la guía de menú de cada estadio y deja reseñas cuando haya un evento elegible en vivo.",
      findVenue: "Buscar un estadio",
      createAccount: "Crear cuenta"
    },
    faq: {
      heading: "Preguntas frecuentes",
      items: ES_FAQ
    },
    disclaimer:
      "Stadium Slop es una plataforma independiente de fans y no está afiliada ni respaldada por FIFA ni por la Copa Mundial de la FIFA.",
    disclaimerLink: "Ver aviso legal completo"
  }
};

export function getWorldCupGuideContent(locale: WorldCupGuideLocale): WorldCupGuideContent {
  return CONTENT[locale];
}

export function worldCupGuideAlternateLanguages(): Record<string, string> {
  const en = getAbsoluteUrl(WORLD_CUP_GUIDE_PATH_EN);
  const es = getAbsoluteUrl(WORLD_CUP_GUIDE_PATH_ES);
  return { en, es, "x-default": en };
}

export function worldCupGuideFaqJsonLd(
  locale: WorldCupGuideLocale
): Record<string, unknown> {
  const { items } = getWorldCupGuideContent(locale).faq;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}
