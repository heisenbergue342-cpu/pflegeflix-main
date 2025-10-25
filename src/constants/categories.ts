import { Building2, Hospital, Home, HeartPulse, Stethoscope } from "lucide-react";

export type CategorySlug =
  | "kliniken"
  | "krankenhaeuser"
  | "altenheime"
  | "1-1-intensivpflege"
  | "ambulante-pflege";

export type CategoryKind = "facility" | "tag";

export interface CategoryDef {
  slug: CategorySlug;
  index: number;
  kind: CategoryKind;
  de: string;
  en: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Zentrale Kategorien mit Labels (kein i18n-Key), Icon und Art (facility vs. tag)
export const CATEGORIES: CategoryDef[] = [
  {
    slug: "kliniken",
    index: 1,
    kind: "facility",
    de: "Kliniken",
    en: "Clinics",
    icon: Building2,
  },
  {
    slug: "krankenhaeuser",
    index: 2,
    kind: "facility",
    de: "Krankenhäuser",
    en: "Hospitals",
    icon: Hospital,
  },
  {
    slug: "altenheime",
    index: 3,
    kind: "facility",
    de: "Altenheime",
    en: "Nursing Homes",
    icon: Home,
  },
  {
    slug: "1-1-intensivpflege",
    index: 4,
    kind: "facility",
    de: "1:1-Intensivpflege",
    en: "1:1 Intensive Care",
    icon: HeartPulse,
  },
  {
    slug: "ambulante-pflege",
    index: 5,
    kind: "tag",
    de: "Ambulante Pflege",
    en: "Outpatient Care",
    icon: Stethoscope,
  },
];

export const CATEGORY_BY_SLUG: Record<CategorySlug, CategoryDef> = CATEGORIES.reduce((acc, c) => {
  acc[c.slug] = c;
  return acc;
}, {} as Record<CategorySlug, CategoryDef>);

export function labelForCategory(slug: CategorySlug, language: "de" | "en" = "de"): string {
  const cat = CATEGORY_BY_SLUG[slug];
  if (!cat) return slug;
  return language === "en" ? cat.en : cat.de;
}

// Mapping von Slug -> facility_type Wert in DB (wo zutreffend)
export function facilityTypeForSlug(slug: CategorySlug): "Klinik" | "Krankenhaus" | "Altenheim" | "1zu1" | null {
  switch (slug) {
    case "kliniken":
      return "Klinik";
    case "krankenhaeuser":
      return "Krankenhaus";
    case "altenheime":
      return "Altenheim";
    case "1-1-intensivpflege":
      return "1zu1";
    default:
      return null;
  }
}

// Matching-Logik für Filter: facility-Kategorien via facility_type, ambulant via Tag
export function matchesCategory(job: any, slug: CategorySlug): boolean {
  const cat = CATEGORY_BY_SLUG[slug];
  if (!cat) return false;
  if (cat.kind === "facility") {
    const ft = facilityTypeForSlug(slug);
    return job?.facility_type === ft;
  }
  // tag-basiert (Ambulante Pflege)
  if (slug === "ambulante-pflege") {
    return Array.isArray(job?.tags) && job.tags.includes("Ambulante Pflege");
  }
  return false;
}