export interface Source {
  name: string;
  url: string;
  type: "aggregator" | "org_listing" | "calendar";
}

export const SOURCES: Source[] = [
  // Aggregators
  {
    name: "Poets & Writers Grants & Awards",
    url: "https://www.pw.org/grants",
    type: "aggregator",
  },
  {
    name: "The Review Review",
    url: "https://www.thereviewreview.net/residencies",
    type: "aggregator",
  },
  {
    name: "Authors Publish Residencies",
    url: "https://www.authorspublish.com/category/residencies/",
    type: "aggregator",
  },
  {
    name: "NewPages Classifieds",
    url: "https://www.newpages.com/classifieds/",
    type: "aggregator",
  },

  // Individual orgs
  {
    name: "MacDowell",
    url: "https://www.macdowell.org/apply",
    type: "org_listing",
  },
  { name: "Yaddo", url: "https://www.yaddo.org/apply/", type: "org_listing" },
  {
    name: "Hedgebrook",
    url: "https://www.hedgebrook.org/apply",
    type: "org_listing",
  },
  {
    name: "Ragdale",
    url: "https://ragdale.org/residencies/",
    type: "org_listing",
  },
  { name: "VCCA", url: "https://www.vcca.com/apply/", type: "org_listing" },
  {
    name: "Ucross",
    url: "https://www.ucrossfoundation.org/residency-program/",
    type: "org_listing",
  },
  {
    name: "Millay Arts",
    url: "https://www.millayarts.org/residencies",
    type: "org_listing",
  },
  {
    name: "Bread Loaf",
    url: "https://www.middlebury.edu/bread-loaf-conferences/bl-writers",
    type: "org_listing",
  },
  {
    name: "Sewanee Writers Conference",
    url: "https://new.sewanee.edu/sewanee-writers-conference/",
    type: "org_listing",
  },
  {
    name: "Tin House Summer Workshop",
    url: "https://tinhouse.com/workshop/",
    type: "org_listing",
  },
];
