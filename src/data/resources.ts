/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResourceItem } from '../types';

export const RESOURCES_DATA: ResourceItem[] = [
  // ADMINISTRATIVE
  {
    id: "commissions",
    title: "Commissions Documents & Statements",
    category: "administrative",
    url: "https://drive.google.com/drive/folders/1bvSwwOFlURS6L2SG6HIUsUI6kEFs7icw",
    description: "Access your 2026 commission statement history, payment schedules, direct deposit setup, and commission split details.",
    iconName: "FileText"
  },
  {
    id: "nvhl",
    title: "NVHL Portal Info (Nevada Health Link Access)",
    category: "administrative",
    url: "https://drive.google.com/drive/folders/10hIKCKr9SwCRAu29Dj-3oQtL0hr-tgGz",
    description: "Administrative setup, agent licensing attachments, and appointment credentials for NVHL Marketplace.",
    iconName: "Key"
  },
  {
    id: "ph-logo",
    title: "ProtectHealth Official Brand Assets & Logos",
    category: "administrative",
    url: "https://drive.google.com/drive/folders/1a2fpW-DJCCAg7hUGtX5YgunNs4M6XZ2b",
    description: "Download official ProtectHealth high-resolution vector and raster logos, brand guidelines, and presentation templates of B&G Agency LLC.",
    iconName: "Award"
  },

  // SUPPORT & TRAINING
  {
    id: "aca-item",
    title: "ACA Compliance & Sales Certification Guide",
    category: "support_training",
    url: "https://drive.google.com/drive/folders/1icKvAHlFXDfYwNzAvfa1OwGKAmtv6enW",
    description: "Training materials, compliance rules, client enrollment walkthroughs, and cert prep for Affordable Care Act plans.",
    iconName: "BookOpen"
  },
  {
    id: "life-item",
    title: "Life Insurance Sales Suite & Underwriting Guide",
    category: "support_training",
    url: "https://drive.google.com/drive/folders/1ylyBg4XPBVFPDURUZ7eM6yDKPV-7fPWb",
    description: "Product brochures, medical underwriting requirements, sales decks, and quote calculation manuals for life insurance.",
    iconName: "ShieldAlert"
  },
  {
    id: "seg-item",
    title: "SEG Benefit Guidelines & Plan Configurations",
    category: "support_training",
    url: "https://drive.google.com/drive/folders/1ZqizzTUUY6XPaGISkktcZoTOH_ORn0L5",
    description: "State Employee Group (SEG) benefits schedules, eligibility limits, enrollment criteria, and presentation guides.",
    iconName: "FileSpreadsheet"
  },
  {
    id: "voluntary-item",
    title: "Voluntary & Ancillary Supplemental Training",
    category: "support_training",
    url: "https://drive.google.com/drive/folders/1caMDyuMgwAclybVaAC_JlbTFf5M_bv7q",
    description: "Ancillary product guides including dental, vision, and critical illness supplemental packages.",
    iconName: "Sparkles"
  },

  // DIRECTORY
  {
    id: "dir-aca",
    title: "ACA Directory & Provider Network Hotlines",
    category: "directory",
    url: "https://drive.google.com/drive/folders/1TOcAso3o7JgOAa0ErP-IXFbiJzS-5bXV",
    description: "Quick finder for provider networks, customer services, enrollment offices, and carrier broker support helplines for ACA carriers.",
    iconName: "Users"
  },
  {
    id: "dir-dental-vision",
    title: "Dental & Vision Provider Networks Directory",
    category: "directory",
    url: "https://drive.google.com/drive/folders/1n588LnRMElLVg_sTG9dcCcFYohLv4FPy",
    description: "Underwriting hotlines, network directories, and claims addresses for all dental and vision plans.",
    iconName: "Eye"
  },
  {
    id: "dir-life",
    title: "Life Insurance Partner Carrier Contact List",
    category: "directory",
    url: "https://drive.google.com/drive/folders/18KJhhOnQpQJtwxWNRvsnByHHi4wEG6DG",
    description: "Phone contacts, claims mailing addresses, and administrative contact numbers for our life insurance carriers.",
    iconName: "PhoneCall"
  },
  {
    id: "dir-off-exchange",
    title: "Off-Exchange Specialized Plan Directory",
    category: "directory",
    url: "https://drive.google.com/drive/folders/1w49-L0W5csM504QqPvRVY0KWWOl6jcIC",
    description: "Details, enrollment support contacts, and direct phone lines for major off-exchange health plan options.",
    iconName: "Building"
  },
  {
    id: "dir-seg",
    title: "SEG Administrative Directory & Core Contacts",
    category: "directory",
    url: "https://drive.google.com/drive/folders/1UCpFH_gMzeTJvZsigBLlR7PHgbhbC4w8",
    description: "E-mail addresses, direct lines, and administrative contacts for Nevada State Employee Group administrators.",
    iconName: "Contact"
  },
  {
    id: "dir-voluntary",
    title: "Voluntary & Ancillary Insurer Directory",
    category: "directory",
    url: "https://drive.google.com/drive/folders/1jOubwNir-YZw8aCCQM6sPUwyNNbePyrF",
    description: "Direct contact list, agent support lines, and billing departments for voluntary benefit products.",
    iconName: "ClipboardList"
  },

  // IMPORTANT EXTERNAL LINKS (CARRIER PORTALS)
  {
    id: "aetna-producer",
    title: "Aetna Producer World",
    category: "important_links",
    url: "https://www.aetna.com/producer/producerworld/",
    description: "Manage quotes, enrollments, commission statements, and access broker licensing packages from Aetna.",
    iconName: "Globe",
    isExternal: true
  },
  {
    id: "ambetter-portal",
    title: "Ambetter Broker Portal",
    category: "important_links",
    url: "https://broker.ambetterhealth.com/",
    description: "Submit ACA applications, search plan networks, view broker commissions, and check enrollment status on Ambetter.",
    iconName: "ExternalLink",
    isExternal: true
  },
  {
    id: "anthem-toolbox",
    title: "Anthem Broker Toolbox",
    category: "important_links",
    url: "https://www.anthem.com/broker/",
    description: "Run Anthem client quotes, manage member rosters, view renewals, and download broker collateral documents.",
    iconName: "Activity",
    isExternal: true
  },
  {
    id: "caresource",
    title: "CareSource Broker login",
    category: "important_links",
    url: "https://www.caresource.com/providers/broker/",
    description: "Log in to view agent tools, check certification status, view member plans, and check commissions on CareSource.",
    iconName: "Heart",
    isExternal: true
  },
  {
    id: "evolve-molina",
    title: "Evolve Portal (Molina & HomeTown Health)",
    category: "important_links",
    url: "https://evolve.molinahealthcare.com/",
    description: "Access Evolve brokerage utilities for Molina Healthcare enrollment rosters and Hometown Health broker logins.",
    iconName: "RefreshCw",
    isExternal: true
  },
  {
    id: "clearwater-ppo",
    title: "Get Appointed to Sell Clearwater PPO",
    category: "important_links",
    url: "https://clearwaterhealth.com/brokers/",
    description: "Official contracting, licensing guide, electronic broker onboarding, and guidelines to sell the Clearwater PPO network.",
    iconName: "UserPlus",
    isExternal: true
  },
  {
    id: "hpn-portal",
    title: "Health Plan of Nevada Broker Portal",
    category: "important_links",
    url: "https://healthplanofnevada.com/Broker",
    description: "Check HPN broker commissions, access marketing material, look up member care systems, and execute enrollments.",
    iconName: "Building2",
    isExternal: true
  },
  {
    id: "meeting-reservations",
    title: "Meeting Room Reservations",
    category: "important_links",
    url: "https://meet.google.com/",
    description: "Schedule agent conferences, broker trainings, group pitches, and book physical boardrooms at B&G Agency. Note: This directs to scheduling portal.",
    iconName: "Calendar",
    isExternal: true
  },
  {
    id: "nevada-link-login",
    title: "Nevada Health Link Broker Login",
    category: "important_links",
    url: "https://www.nevadahealthlink.com/brokers/",
    description: "Check commissions, update licensing details, certify your profile, and complete on-exchange ACA marketplace registrations.",
    iconName: "FileCode",
    isExternal: true
  },
  {
    id: "new-era-training",
    title: "New Era Documents & Training",
    category: "important_links",
    url: "https://www.neweralife.com/agents/",
    description: "Direct download links to medical booklets, application forms, direct deposit forms, and digital trainings from New Era Life.",
    iconName: "Bookmark",
    isExternal: true
  },
  {
    id: "palic-new-era",
    title: "PALIC / New Era Broker Login",
    category: "important_links",
    url: "https://www.neweralife.com/broker-login",
    description: "View Philadelphian American Life Insurance Company (PALIC) policies, run custom quotes, and browse commissions.",
    iconName: "ShieldCheck",
    isExternal: true
  },
  {
    id: "protecthealth-home",
    title: "ProtectHealth Broker Platform",
    category: "important_links",
    url: "https://protecthealth.com/",
    description: "Main public-facing portal for ProtectHealth. Learn about carrier alignment, group offerings, and broker services.",
    iconName: "Layers",
    isExternal: true
  },
  {
    id: "selecthealth-portal",
    title: "SelectHealth Broker Portal",
    category: "important_links",
    url: "https://selecthealth.org/brokers",
    description: "Create quotes for dental/health packages, complete online enrollments, and check commission stats via SelectHealth.",
    iconName: "CheckSquare",
    isExternal: true
  }
];
