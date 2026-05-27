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
    question: "What food will be at 2026 World Cup stadiums?",
    answer:
      "Each host venue has its own concessions—local specialties, international stands, and stadium classics. Stadium Slop lists items as fans and imports add them; coverage grows match by match."
  },
  {
    question: "Can fans leave stadium food reviews?",
    answer:
      "Yes. Sign in, pick a host venue and food item, and submit a review. Verified in-stadium reviews use location checks on game day so rankings reflect real fan experiences."
  },
  {
    question: "Which World Cup stadium has the best food?",
    answer:
      "Rankings change as more fans review items. Browse each host venue on Stadium Slop to compare Slop Scores, photos, and recent reviews—there is no single official answer."
  },
  {
    question: "How does Stadium Slop verify reviews?",
    answer:
      "When you review at a venue, Stadium Slop can confirm you are inside the stadium geofence during an eligible event window. That helps separate in-building game-day reviews from off-site guesses."
  },
  {
    question: "What is Stadium Slop?",
    answer:
      "Stadium Slop is an independent, fan-powered guide to stadium food. Browse items, photos, and rankings, then leave verified reviews to help other fans know what to order."
  }
] as const;

const ES_FAQ = [
  {
    question: "¿Qué comida habrá en los estadios del Mundial 2026?",
    answer:
      "Cada estadio sede tiene sus propios concessions: especialidades locales, stands internacionales y clásicos de estadio. Stadium Slop lista platillos conforme fans e importaciones los agregan; la cobertura crece partido a partido."
  },
  {
    question: "¿Pueden los fans dejar reseñas de comida en los estadios?",
    answer:
      "Sí. Inicia sesión, elige un estadio sede y un platillo, y envía una reseña. Las reseñas verificadas dentro del estadio usan verificación de ubicación en día de partido para que los rankings reflejen experiencias reales."
  },
  {
    question: "¿Qué estadio del Mundial tiene la mejor comida?",
    answer:
      "Los rankings cambian conforme más fans dejan reseñas. Explora cada estadio sede en Stadium Slop para comparar Slop Scores, fotos y reseñas recientes—no hay una sola respuesta oficial."
  },
  {
    question: "¿Cómo verifica Stadium Slop las reseñas?",
    answer:
      "Cuando reseñas en un estadio, Stadium Slop puede confirmar que estás dentro del geofence del estadio durante una ventana de evento elegible. Eso ayuda a separar reseñas de día de partido en el edificio de opiniones fuera del estadio."
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
      title: "2026 World Cup Stadium Food Guide | Stadium Slop",
      description:
        "Find food at 2026 World Cup host stadiums with Stadium Slop. Browse venue menus, fan photos, rankings, and verified in-stadium reviews.",
      keywords: [
        "2026 World Cup",
        "World Cup stadium food",
        "stadium food guide",
        "FIFA World Cup food",
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
      eyebrow: "Stadium Slop · Fan-powered stadium food",
      title: "2026 World Cup Stadium Food Guide",
      tagline: "Know Before You Bite",
      description:
        "Traveling for the 2026 World Cup? Stadium Slop helps fans discover what to eat inside each host venue, browse stadium food items, and help build fan-powered rankings with verified in-stadium reviews."
    },
    venues: {
      sectionEyebrow: (live, total) =>
        `2026 host venues · ${live} of ${total} live on Stadium Slop`,
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
        "Starter coverage is live. Fans attending matches can help expand and rank food items at this venue."
    },
    howItWorks: {
      heading: "How Stadium Slop Works",
      stepLabel: (n) => `Step ${n}`,
      steps: [
        {
          title: "Pick a host venue",
          body: "Choose a 2026 World Cup stadium to see what fans are eating inside the building."
        },
        {
          title: "Browse food items",
          body: "Explore menus, vendors, and standout bites before you head to your match."
        },
        {
          title: "See fan photos and rankings",
          body: "Compare Slop Scores, Napkin Ratings, and real photos from the stands."
        },
        {
          title: "Leave a verified in-stadium review",
          body: "Share a game-day review with location verification so rankings stay trustworthy."
        }
      ]
    },
    cta: {
      heading: "Be one of the first fans to help rank World Cup stadium food.",
      body: "Pick a host venue, leave a verified review, and help travelers know what is worth ordering before kickoff.",
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
      title: "Guía de comida en los estadios del Mundial 2026 | Stadium Slop",
      description:
        "Encuentra comida en los estadios sede del Mundial 2026 con Stadium Slop. Explora menús, fotos de fans, rankings y reseñas verificadas dentro del estadio.",
      keywords: [
        "Mundial 2026",
        "comida estadio Mundial",
        "guía comida estadio",
        "Copa Mundial comida",
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
      eyebrow: "Stadium Slop · Comida de estadio impulsada por fans",
      title: "Guía de comida en los estadios del Mundial 2026",
      tagline: "Sabe qué comer antes del partido.",
      description:
        "¿Viajas para el Mundial 2026? Stadium Slop ayuda a los fans a descubrir qué comer dentro de cada estadio sede, explorar comida del estadio y ayudar a crear rankings impulsados por fans con reseñas verificadas dentro del estadio."
    },
    venues: {
      sectionEyebrow: (live, total) =>
        `Estadios sede 2026 · ${live} de ${total} en vivo en Stadium Slop`,
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
        "La cobertura inicial ya está en vivo. Los fans que asistan a los partidos pueden ayudar a ampliar y rankear platillos en este estadio."
    },
    howItWorks: {
      heading: "Cómo funciona Stadium Slop",
      stepLabel: (n) => `Paso ${n}`,
      steps: [
        {
          title: "Elige un estadio sede",
          body: "Selecciona un estadio del Mundial 2026 para ver qué están comiendo los fans dentro del edificio."
        },
        {
          title: "Explora la comida disponible",
          body: "Revisa menús, vendors y platillos destacados antes de tu partido."
        },
        {
          title: "Mira fotos y rankings de fans",
          body: "Compara Slop Scores, Napkin Ratings y fotos reales desde las gradas."
        },
        {
          title: "Deja una reseña verificada dentro del estadio",
          body: "Comparte una reseña de día de partido con verificación de ubicación para que los rankings sean confiables."
        }
      ]
    },
    cta: {
      heading:
        "Sé uno de los primeros fans en ayudar a rankear la comida de los estadios del Mundial.",
      body: "Elige un estadio sede, deja una reseña verificada y ayuda a viajeros a saber qué vale la pena pedir antes del pitido inicial.",
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
