export const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fixit247.com.au";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readTime: string;
  sections: {
    heading: string;
    body: string;
  }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "what-to-do-when-a-pipe-bursts",
    title: "What to Do When a Pipe Bursts at Home",
    description: "A calm emergency checklist for burst pipes, leaks, water shutoff, photos, and getting a verified Fixer.",
    category: "Home emergencies",
    publishedAt: "2026-06-05",
    readTime: "4 min read",
    sections: [
      {
        heading: "Start with safety and water control",
        body: "If water is spreading quickly, move people away from electrical hazards and shut off the main water supply if you can reach it safely. Do not touch wet switches, outlets, or appliances."
      },
      {
        heading: "Document what happened",
        body: "Take clear photos of the leak source, damaged areas, and any visible pipes. Photos help Fixers understand the urgency before they contact you."
      },
      {
        heading: "Start an emergency request",
        body: "Fixit247 helps you describe the issue, capture location and contact details, and prepare the request for suitable verified Fixers."
      }
    ]
  },
  {
    slug: "home-emergency-plan-australia",
    title: "How to Build a Simple Home Emergency Plan",
    description: "A practical homeowner guide for preparing before leaks, lockouts, electrical faults, storm damage, and urgent repairs.",
    category: "Peace of mind",
    publishedAt: "2026-06-05",
    readTime: "5 min read",
    sections: [
      {
        heading: "Know your critical shutoffs",
        body: "Every household should know where water, electricity, and gas controls are located. Save photos and notes in your household records so family members can act quickly."
      },
      {
        heading: "Keep property and vehicle details ready",
        body: "Saved home and vehicle profiles reduce stress when something goes wrong. Fixit Peace is built around having those details ready before panic starts."
      },
      {
        heading: "Use one request path",
        body: "When the problem is urgent, a guided request is easier than searching through directories. Fixit247 is emergency-first but ready for every trade job your property needs."
      }
    ]
  },
  {
    slug: "when-to-request-project-quotes",
    title: "When a Trade Job Becomes a Project Quote",
    description: "How to decide whether your request is a repair, scheduled trade job, or larger project that needs quotes.",
    category: "Projects",
    publishedAt: "2026-06-05",
    readTime: "3 min read",
    sections: [
      {
        heading: "Small requests need speed",
        body: "Repairs, maintenance, lock repairs, appliance issues, and simple installations usually work best as standard trade requests."
      },
      {
        heading: "Projects need a clearer brief",
        body: "Renovations, outdoor living work, flooring projects, painting projects, roofing projects, and multi-trade jobs usually need a quote-first workflow."
      },
      {
        heading: "Fixit247 supports both",
        body: "You can start with one request and choose whether it is urgent, scheduled, or a larger project. The customer experience stays request-led while Fixit247 routes the right details to the right workflow."
      }
    ]
  }
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Fixit247",
    url: appUrl,
    description: "Emergency help for your home and road, 24/7.",
    brand: {
      "@type": "Brand",
      name: "Fixit247"
    }
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Fixit247",
    url: appUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${appUrl}/all-trade-jobs?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function articleJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    author: {
      "@type": "Organization",
      name: "Fixit247"
    },
    publisher: {
      "@type": "Organization",
      name: "Fixit247"
    },
    mainEntityOfPage: `${appUrl}/blog/${post.slug}`
  };
}
