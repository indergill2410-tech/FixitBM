import {
  BatteryCharging,
  Car,
  Droplets,
  Fuel,
  Hammer,
  Home,
  KeyRound,
  PlugZap,
  ShieldCheck,
  Truck,
  Wrench
} from "lucide-react";

export type RequestLane = "emergency_home" | "emergency_road" | "standard_trade_job" | "larger_project";

export const requestLanes = [
  {
    value: "emergency_home",
    title: "Emergency home help",
    shortTitle: "Home emergency",
    copy: "Leaks, faults, lockouts, storm damage, and urgent repairs. Start now so the right Fixer can see the details fast.",
    requestType: "home",
    urgency: "emergency"
  },
  {
    value: "emergency_road",
    title: "Roadside help now",
    shortTitle: "Roadside emergency",
    copy: "Flat tyre, battery, lockout, fuel, towing, or breakdown. Share the location details and get the next step moving.",
    requestType: "road",
    urgency: "emergency"
  },
  {
    value: "standard_trade_job",
    title: "Book a trade request",
    shortTitle: "Trade request",
    copy: "Repairs, maintenance, installations, and scheduled work. Add the details once and make it easy for Fixers to respond.",
    requestType: "scheduled",
    urgency: "flexible"
  },
  {
    value: "larger_project",
    title: "Get project quotes",
    shortTitle: "Project quotes",
    copy: "Renovations, upgrades, and bigger property work. Describe the scope once so suitable Fixers can quote properly.",
    requestType: "scheduled",
    urgency: "flexible"
  }
] as const;

export const homeCategories = [
  { label: "Burst pipe", icon: Droplets },
  { label: "Plumbing", icon: Droplets },
  { label: "Plumbing emergency", icon: Droplets },
  { label: "Electrical", icon: PlugZap },
  { label: "Electrical fault", icon: PlugZap },
  { label: "Locksmith", icon: KeyRound },
  { label: "Lockout", icon: KeyRound },
  { label: "Roof leak", icon: Home },
  { label: "Glass repair", icon: ShieldCheck },
  { label: "Broken glass", icon: ShieldCheck },
  { label: "Storm damage", icon: ShieldCheck },
  { label: "Appliance issue", icon: Wrench },
  { label: "Urgent repair", icon: Hammer },
  { label: "Heating/cooling", icon: Home },
  { label: "Pest emergency", icon: ShieldCheck },
  { label: "Cleaning", icon: Hammer },
  { label: "Handyman", icon: Hammer },
  { label: "Other emergency", icon: Wrench }
];

export const roadsideCategories = [
  { label: "Flat tyre", icon: Car },
  { label: "Battery", icon: BatteryCharging },
  { label: "Vehicle lockout", icon: KeyRound },
  { label: "Fuel emergency", icon: Fuel },
  { label: "Towing", icon: Truck },
  { label: "Mechanic help", icon: Wrench },
  { label: "Accident support", icon: ShieldCheck },
  { label: "Other roadside issue", icon: Wrench }
];

export const tradeCategories = [
  { label: "Plumbing", icon: Droplets },
  { label: "Electrical", icon: PlugZap },
  { label: "Locksmith", icon: KeyRound },
  { label: "Roofing", icon: Home },
  { label: "Carpentry", icon: Hammer },
  { label: "Painting", icon: Hammer },
  { label: "Tiling", icon: Hammer },
  { label: "Flooring", icon: Home },
  { label: "Plastering", icon: Hammer },
  { label: "Landscaping", icon: Home },
  { label: "Gardening", icon: Home },
  { label: "Fencing", icon: Hammer },
  { label: "Decking", icon: Hammer },
  { label: "Concreting", icon: Hammer },
  { label: "Cleaning", icon: ShieldCheck },
  { label: "Pest control", icon: ShieldCheck },
  { label: "Heating/cooling", icon: Home },
  { label: "Appliance repair", icon: Wrench },
  { label: "Handyman", icon: Hammer },
  { label: "Property maintenance", icon: Home },
  { label: "Other trade", icon: Wrench }
];

export const projectCategories = [
  { label: "Bathroom renovation", icon: Home },
  { label: "Kitchen renovation", icon: Home },
  { label: "Laundry renovation", icon: Home },
  { label: "Full renovation", icon: Home },
  { label: "Extension", icon: Hammer },
  { label: "Deck restoration", icon: Hammer },
  { label: "Flooring project", icon: Home },
  { label: "Painting project", icon: Hammer },
  { label: "Roofing project", icon: Home },
  { label: "Landscaping project", icon: Home },
  { label: "Outdoor living", icon: Home },
  { label: "Multi-trade project", icon: Hammer },
  { label: "Investment property upgrade", icon: ShieldCheck },
  { label: "Other project", icon: Wrench }
];

export const customerTimeline = [
  "Request posted",
  "Matching Fixers",
  "Fixer accepted",
  "Fixer en route",
  "On site",
  "Quote provided",
  "Work in progress",
  "Completed"
];

export const tradiePlans = [
  ["Free Starter", "$0", "Basic profile, limited job previews, and 111 bonus lead credits every month for 6 months"],
  ["Local Pro", "$99", "Local job alerts and standard lead access"],
  ["Emergency Pro", "$199", "Priority emergency alerts and after-hours jobs"],
  ["Growth Partner", "$399", "Multi-suburb coverage, analytics, and higher lead volume"]
];
