"use client";

import {
  Users,
  ShoppingBag,
  Award,
  Truck,
  Shield,
  Heart,
  Star,
  Globe,
  Target,
  MapPin,
  Sparkles,
  Leaf,
  Mail,
  Phone,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  HelpCircle,
} from "lucide-react";
import type { IconName } from "@/lib/types/brand";

const ICON_MAP: Record<IconName, React.ReactNode> = {
  users: <Users size={18} />,
  "shopping-bag": <ShoppingBag size={18} />,
  award: <Award size={18} />,
  truck: <Truck size={18} />,
  shield: <Shield size={18} />,
  heart: <Heart size={18} />,
  star: <Star size={18} />,
  globe: <Globe size={18} />,
  target: <Target size={18} />,
  "map-pin": <MapPin size={18} />,
  sparkles: <Sparkles size={18} />,
  leaf: <Leaf size={18} />,
  mail: <Mail size={18} />,
  phone: <Phone size={18} />,
  clock: <Clock size={18} />,
  send: <Send size={18} />,
  "message-circle": <MessageCircle size={18} />,
  headphones: <Headphones size={18} />,
  facebook: <Facebook size={18} />,
  twitter: <Twitter size={18} />,
  instagram: <Instagram size={18} />,
  linkedin: <Linkedin size={18} />,
  youtube: <Youtube size={18} />,
  whatsapp: <MessageCircle size={18} />,
  "help-circle": <HelpCircle size={18} />,
};

interface IconPickerProps {
  value?: IconName;
  onChange: (icon: IconName | undefined) => void;
  allowed?: IconName[];
  label?: string;
}

export default function IconPicker({
  value,
  onChange,
  allowed,
  label,
}: IconPickerProps) {
  const icons = allowed ?? (Object.keys(ICON_MAP) as IconName[]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {icons.map((name) => (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(value === name ? undefined : name)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 border ${
              value === name
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-500 border-gray-200 hover:border-primary/50 hover:text-primary"
            }`}
          >
            {ICON_MAP[name]}
          </button>
        ))}
      </div>
    </div>
  );
}

export function renderIcon(name: IconName | undefined, size = 18) {
  if (!name) return null;
  const map: Record<IconName, React.ReactNode> = {
    users: <Users size={size} />,
    "shopping-bag": <ShoppingBag size={size} />,
    award: <Award size={size} />,
    truck: <Truck size={size} />,
    shield: <Shield size={size} />,
    heart: <Heart size={size} />,
    star: <Star size={size} />,
    globe: <Globe size={size} />,
    target: <Target size={size} />,
    "map-pin": <MapPin size={size} />,
    sparkles: <Sparkles size={size} />,
    leaf: <Leaf size={size} />,
    mail: <Mail size={size} />,
    phone: <Phone size={size} />,
    clock: <Clock size={size} />,
    send: <Send size={size} />,
    "message-circle": <MessageCircle size={size} />,
    headphones: <Headphones size={size} />,
    facebook: <Facebook size={size} />,
    twitter: <Twitter size={size} />,
    instagram: <Instagram size={size} />,
    linkedin: <Linkedin size={size} />,
    youtube: <Youtube size={size} />,
    whatsapp: <MessageCircle size={size} />,
    "help-circle": <HelpCircle size={size} />,
  };
  return map[name] ?? null;
}
