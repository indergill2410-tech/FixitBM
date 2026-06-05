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

export const homeCategories = [
  { label: "Plumbing", icon: Droplets },
  { label: "Electrical", icon: PlugZap },
  { label: "Locksmith", icon: KeyRound },
  { label: "Roof leak", icon: Home },
  { label: "Glass repair", icon: ShieldCheck },
  { label: "Appliance issue", icon: Wrench },
  { label: "Heating/cooling", icon: Home },
  { label: "Pest emergency", icon: ShieldCheck },
  { label: "Cleaning", icon: Hammer },
  { label: "Handyman", icon: Hammer }
];

export const roadsideCategories = [
  { label: "Flat tyre", icon: Car },
  { label: "Battery", icon: BatteryCharging },
  { label: "Vehicle lockout", icon: KeyRound },
  { label: "Fuel emergency", icon: Fuel },
  { label: "Towing", icon: Truck },
  { label: "Mechanic", icon: Wrench }
];

export const customerTimeline = [
  "Job posted",
  "Matching tradies",
  "Tradie accepted",
  "Tradie en route",
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
