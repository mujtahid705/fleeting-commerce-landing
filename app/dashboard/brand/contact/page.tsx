"use client";

import { useState, useEffect } from "react";
import {
  Phone,
  CreditCard,
  MessageSquare,
  Headphones,
  Share2,
  HelpCircle,
  MapPin,
  Search,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { ButtonSpinner, PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import WarningBanner from "@/components/ui/WarningBanner";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchBrand,
  updateBrand,
  upsertBrand,
} from "@/lib/store/slices/brandSlice";
import PageHeader from "@/components/dashboard/PageHeader";
import PageCard from "@/components/dashboard/PageCard";
import CollapsibleSection from "@/components/dashboard/CollapsibleSection";
import Textarea from "@/components/dashboard/Textarea";
import IconPicker from "@/components/dashboard/IconPicker";
import ImageUploadField from "@/components/dashboard/ImageUploadField";
import type {
  ContactPageSection,
  ContactInfoItem,
  ContactInfoType,
  SupportOptionItem,
  ContactSocialItem,
  SocialPlatform,
  FaqItem,
  IconName,
} from "@/lib/types/brand";

const CONTACT_INFO_TYPES: { value: ContactInfoType; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "address", label: "Address" },
  { value: "hours", label: "Business Hours" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "custom", label: "Custom" },
];

const SOCIAL_PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "x", label: "X (formerly Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "website", label: "Website" },
];

const CONTACT_ICONS: IconName[] = [
  "mail",
  "phone",
  "map-pin",
  "clock",
  "send",
  "message-circle",
  "headphones",
  "globe",
  "help-circle",
];

const DEFAULT_CONTACT: ContactPageSection = {
  isEnabled: true,
  hero: {
    eyebrow: "Get In Touch",
    title: "",
    description: "",
  },
  contactInfo: {
    isEnabled: true,
    items: [],
  },
  form: {
    isEnabled: true,
    title: "Send us a Message",
    description: "",
    submitButtonText: "Send Message",
    successMessage: "Thank you for your message. We will get back to you soon.",
    recipientEmail: "",
    fields: {
      name: { isEnabled: true, isRequired: true, label: "Full Name", placeholder: "Your full name" },
      email: { isEnabled: true, isRequired: true, label: "Email Address", placeholder: "your.email@example.com" },
      subject: { isEnabled: true, isRequired: true, label: "Subject", placeholder: "What is this about?" },
      message: { isEnabled: true, isRequired: true, label: "Message", placeholder: "Tell us more about your inquiry..." },
    },
  },
  supportOptions: {
    isEnabled: true,
    title: "Other Ways to Reach Us",
    items: [],
  },
  socialLinks: {
    isEnabled: true,
    title: "Follow Us",
    items: [],
  },
  faq: {
    isEnabled: true,
    eyebrow: "Common Questions",
    title: "Frequently Asked Questions",
    description: "",
    items: [],
  },
  location: {
    isEnabled: false,
    title: "Find Us",
    description: "",
    addressLabel: "Our Location",
    address: "",
    mapEmbedUrl: null,
    directionsUrl: "",
    buttonText: "Get Directions",
  },
  seo: { title: "", description: "" },
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("blob:") || path.startsWith("data:"))
    return path;
  let base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  if (base.endsWith("/api")) base = base.slice(0, -4);
  const imagePath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${imagePath}`;
}

function autoActionUrl(type: ContactInfoType, details: string): string {
  if (type === "email" && details.includes("@")) return `mailto:${details}`;
  if (type === "phone" && details.trim()) return `tel:${details.replace(/\s+/g, "")}`;
  if (type === "whatsapp" && details.trim()) return `https://wa.me/${details.replace(/[^0-9]/g, "")}`;
  return "";
}

export default function ContactPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { brand, loading, updateLoading } = useAppSelector((s) => s.brand);

  const [data, setData] = useState<ContactPageSection>(DEFAULT_CONTACT);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [mapImageFile, setMapImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!brand) dispatch(fetchBrand());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (brand?.contactPage) {
      setData(brand.contactPage);
    }
  }, [brand]);

  function mark() {
    setHasChanges(true);
  }

  function updateHero(key: string, value: string) {
    setData((d) => ({ ...d, hero: { ...d.hero, [key]: value } }));
    mark();
  }

  // Contact info
  function addContactInfo() {
    if (data.contactInfo.items.length >= 6) return;
    setData((d) => ({
      ...d,
      contactInfo: {
        ...d.contactInfo,
        items: [...d.contactInfo.items, { type: "email", title: "", details: "", icon: "mail" }],
      },
    }));
    mark();
  }

  function updateContactInfo(i: number, key: string, value: string | IconName | undefined) {
    setData((d) => {
      const items = [...d.contactInfo.items];
      const updated = { ...items[i], [key]: value } as ContactInfoItem;
      // Auto-fill actionUrl on type or details change
      if (key === "type" || key === "details") {
        const type = key === "type" ? (value as ContactInfoType) : items[i].type;
        const details = key === "details" ? (value as string) : items[i].details;
        const autoUrl = autoActionUrl(type, details);
        if (autoUrl && !items[i].actionUrl) updated.actionUrl = autoUrl;
      }
      items[i] = updated;
      return { ...d, contactInfo: { ...d.contactInfo, items } };
    });
    mark();
  }

  function removeContactInfo(i: number) {
    setData((d) => ({
      ...d,
      contactInfo: { ...d.contactInfo, items: d.contactInfo.items.filter((_, idx) => idx !== i) },
    }));
    mark();
  }

  // Form
  function updateForm(key: string, value: string | boolean) {
    setData((d) => ({ ...d, form: { ...d.form, [key]: value } }));
    mark();
  }

  function updateFormField(field: "name" | "email" | "subject" | "message", key: string, value: string | boolean) {
    setData((d) => ({
      ...d,
      form: {
        ...d.form,
        fields: { ...d.form.fields, [field]: { ...d.form.fields[field], [key]: value } },
      },
    }));
    mark();
  }

  // Support options
  function addSupportOption() {
    if (data.supportOptions.items.length >= 6) return;
    setData((d) => ({
      ...d,
      supportOptions: {
        ...d.supportOptions,
        items: [...d.supportOptions.items, { title: "", description: "", isAvailable: true, icon: undefined }],
      },
    }));
    mark();
  }

  function updateSupportOption(i: number, key: string, value: string | boolean | IconName | undefined) {
    setData((d) => {
      const items = [...d.supportOptions.items];
      items[i] = { ...items[i], [key]: value } as SupportOptionItem;
      return { ...d, supportOptions: { ...d.supportOptions, items } };
    });
    mark();
  }

  function removeSupportOption(i: number) {
    setData((d) => ({
      ...d,
      supportOptions: { ...d.supportOptions, items: d.supportOptions.items.filter((_, idx) => idx !== i) },
    }));
    mark();
  }

  // Social links
  function addSocialLink() {
    setData((d) => ({
      ...d,
      socialLinks: {
        ...d.socialLinks,
        items: [...d.socialLinks.items, { platform: "facebook", label: "", url: "" }],
      },
    }));
    mark();
  }

  function updateSocialLink(i: number, key: string, value: string) {
    setData((d) => {
      const items = [...d.socialLinks.items];
      items[i] = { ...items[i], [key]: value } as ContactSocialItem;
      return { ...d, socialLinks: { ...d.socialLinks, items } };
    });
    mark();
  }

  function removeSocialLink(i: number) {
    setData((d) => ({
      ...d,
      socialLinks: { ...d.socialLinks, items: d.socialLinks.items.filter((_, idx) => idx !== i) },
    }));
    mark();
  }

  function copyFooterSocialLinks() {
    if (!brand?.footer?.socialLinks) return;
    const fl = brand.footer.socialLinks;
    const platforms: SocialPlatform[] = ["facebook", "instagram", "twitter", "linkedin", "youtube"];
    const items: ContactSocialItem[] = platforms
      .filter((p) => fl[p as keyof typeof fl])
      .map((p) => ({ platform: p, label: p.charAt(0).toUpperCase() + p.slice(1), url: fl[p as keyof typeof fl] as string }));
    setData((d) => ({ ...d, socialLinks: { ...d.socialLinks, items } }));
    mark();
  }

  // FAQ
  function addFaq() {
    if (data.faq.items.length >= 12) return;
    setData((d) => ({
      ...d,
      faq: { ...d.faq, items: [...d.faq.items, { question: "", answer: "" }] },
    }));
    setExpandedFaq(data.faq.items.length);
    mark();
  }

  function updateFaq(i: number, key: string, value: string) {
    setData((d) => {
      const items = [...d.faq.items];
      items[i] = { ...items[i], [key]: value } as FaqItem;
      return { ...d, faq: { ...d.faq, items } };
    });
    mark();
  }

  function removeFaq(i: number) {
    setData((d) => ({
      ...d,
      faq: { ...d.faq, items: d.faq.items.filter((_, idx) => idx !== i) },
    }));
    if (expandedFaq === i) setExpandedFaq(null);
    mark();
  }

  // Location
  function updateLocation(key: string, value: string | boolean | null) {
    setData((d) => ({ ...d, location: { ...d.location, [key]: value } }));
    mark();
  }

  function updateSeo(key: string, value: string) {
    setData((d) => ({ ...d, seo: { ...d.seo, [key]: value } }));
    mark();
  }

  async function handleSave() {
    try {
      const payload: { contactPage: ContactPageSection; contactMapImage?: File } = {
        contactPage: data,
        ...(mapImageFile ? { contactMapImage: mapImageFile } : {}),
      };
      if (brand) {
        await dispatch(updateBrand(payload)).unwrap();
      } else {
        await dispatch(upsertBrand(payload)).unwrap();
      }
      await dispatch(fetchBrand());
      setHasChanges(false);
      showToast({ type: "success", title: "Saved", message: "Contact page updated." });
    } catch (err: unknown) {
      showToast({
        type: "error",
        title: "Save failed",
        message: typeof err === "string" ? err : "Could not save contact page.",
      });
    }
  }

  const formEmailMissing = data.form.isEnabled && !data.form.recipientEmail.trim();

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Contact Page"
        subtitle="Set up your contact information, form, support options, and FAQ."
      />

      {formEmailMissing && (
        <WarningBanner
          title="Recipient email missing"
          message="Contact form is enabled but no recipient email is set. Messages won't be delivered until you add one."
        />
      )}

      {/* Page Status */}
      <PageCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Contact Page Status</p>
            <p className="text-sm text-muted mt-0.5">
              When disabled the Contact page shows no dynamic content.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setData((d) => ({ ...d, isEnabled: !d.isEnabled }));
              mark();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              data.isEnabled
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
            }`}
          >
            {data.isEnabled ? (
              <><Eye size={16} /> Enabled</>
            ) : (
              <><EyeOff size={16} /> Disabled</>
            )}
          </button>
        </div>
      </PageCard>

      {/* Hero */}
      <CollapsibleSection
        title="Hero"
        icon={<MessageSquare size={20} className="text-primary" />}
        defaultOpen
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Reassure customers that support is available. First thing they see on the Contact page.
          </p>
          <Input
            label="Eyebrow (optional)"
            value={data.hero.eyebrow ?? ""}
            onChange={(e) => updateHero("eyebrow", e.target.value)}
            placeholder="Get In Touch"
          />
          <div>
            <Input
              label="Title *"
              value={data.hero.title}
              onChange={(e) => updateHero("title", e.target.value)}
              placeholder="Contact Us"
              maxLength={80}
            />
            <p className="mt-1 text-xs text-muted text-right">{data.hero.title.length}/80</p>
          </div>
          <div>
            <Textarea
              label="Description *"
              value={data.hero.description}
              onChange={(e) => updateHero("description", e.target.value)}
              placeholder="We are here to help. Reach out for questions, support, or feedback."
              rows={3}
              maxLength={280}
            />
            <p className="mt-1 text-xs text-muted text-right">{data.hero.description.length}/280</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Contact Info Cards */}
      <CollapsibleSection
        title="Contact Info Cards"
        icon={<Phone size={20} className="text-primary" />}
        badge={
          <button
            type="button"
            onClick={() => {
              setData((d) => ({ ...d, contactInfo: { ...d.contactInfo, isEnabled: !d.contactInfo.isEnabled } }));
              mark();
            }}
            className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              data.contactInfo.isEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {data.contactInfo.isEnabled ? "On" : "Off"}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Quick contact cards shown near the top. Ideal: 3–4, max 6. For email and phone, the action URL is auto-filled.
          </p>
          {data.contactInfo.items.map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {item.title || `Card ${i + 1}`}
                  {item.details && ` — ${item.details}`}
                </span>
                <button type="button" onClick={() => removeContactInfo(i)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <Select
                label="Type *"
                value={item.type}
                options={CONTACT_INFO_TYPES}
                onChange={(e) => updateContactInfo(i, "type", e.target.value as ContactInfoType)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Card title *"
                  value={item.title}
                  onChange={(e) => updateContactInfo(i, "title", e.target.value)}
                  placeholder="Email Us"
                />
                <Input
                  label="Details *"
                  value={item.details}
                  onChange={(e) => updateContactInfo(i, "details", e.target.value)}
                  placeholder={
                    item.type === "email"
                      ? "support@example.com"
                      : item.type === "phone"
                      ? "+880 1700-000000"
                      : item.type === "hours"
                      ? "Mon–Fri 9am–6pm"
                      : "Value shown on card"
                  }
                />
              </div>
              <Input
                label="Helper text (optional)"
                value={item.description ?? ""}
                onChange={(e) => updateContactInfo(i, "description", e.target.value)}
                placeholder="We usually reply within one business day."
              />
              <Input
                label="Action URL (optional — auto-filled for email/phone)"
                value={item.actionUrl ?? ""}
                onChange={(e) => updateContactInfo(i, "actionUrl", e.target.value)}
                placeholder="mailto:…, tel:…, or https://…"
              />
              <IconPicker
                label="Icon (optional)"
                value={item.icon}
                allowed={CONTACT_ICONS}
                onChange={(icon) => updateContactInfo(i, "icon", icon)}
              />
            </div>
          ))}
          {data.contactInfo.items.length < 6 && (
            <Button variant="outline" size="sm" onClick={addContactInfo} className="w-full">
              <Plus size={16} className="mr-2" /> Add Contact Card
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {/* Contact Form */}
      <CollapsibleSection
        title="Contact Form"
        icon={<CreditCard size={20} className="text-primary" />}
        badge={
          <button
            type="button"
            onClick={() => updateForm("isEnabled", !data.form.isEnabled)}
            className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              data.form.isEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {data.form.isEnabled ? "On" : "Off"}
          </button>
        }
      >
        <div className="space-y-4">
          <Input
            label="Form title *"
            value={data.form.title}
            onChange={(e) => updateForm("title", e.target.value)}
            placeholder="Send us a Message"
          />
          <Textarea
            label="Form helper text (optional)"
            value={data.form.description ?? ""}
            onChange={(e) => updateForm("description", e.target.value)}
            placeholder="Fill out the form and we will get back to you shortly."
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Submit button text *"
              value={data.form.submitButtonText}
              onChange={(e) => updateForm("submitButtonText", e.target.value)}
              placeholder="Send Message"
            />
            <div>
              <Input
                label="Recipient email *"
                type="email"
                value={data.form.recipientEmail}
                onChange={(e) => updateForm("recipientEmail", e.target.value)}
                placeholder="support@example.com"
              />
              {formEmailMissing && (
                <p className="mt-1 text-xs text-amber-600">Required when form is enabled.</p>
              )}
            </div>
          </div>
          <Textarea
            label="Success message (shown after submission) *"
            value={data.form.successMessage}
            onChange={(e) => updateForm("successMessage", e.target.value)}
            placeholder="Thank you for your message. We will get back to you soon."
            rows={2}
          />

          <div className="border border-gray-100 rounded-xl p-4 space-y-4">
            <p className="text-sm font-medium text-foreground">Form fields</p>
            <p className="text-xs text-muted">Customize labels and placeholders. Field purpose is fixed.</p>
            {(["name", "email", "subject", "message"] as const).map((fieldKey) => {
              const field = data.form.fields[fieldKey];
              return (
                <div key={fieldKey} className="p-3 rounded-lg bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize text-foreground">{fieldKey}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.isRequired}
                          onChange={(e) => updateFormField(fieldKey, "isRequired", e.target.checked)}
                          className="rounded"
                        />
                        Required
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Label"
                      value={field.label}
                      onChange={(e) => updateFormField(fieldKey, "label", e.target.value)}
                      placeholder={fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}
                    />
                    <Input
                      label="Placeholder"
                      value={field.placeholder}
                      onChange={(e) => updateFormField(fieldKey, "placeholder", e.target.value)}
                      placeholder="Placeholder text…"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CollapsibleSection>

      {/* Support Options */}
      <CollapsibleSection
        title="Support Options"
        icon={<Headphones size={20} className="text-primary" />}
        badge={
          <button
            type="button"
            onClick={() => {
              setData((d) => ({ ...d, supportOptions: { ...d.supportOptions, isEnabled: !d.supportOptions.isEnabled } }));
              mark();
            }}
            className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              data.supportOptions.isEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {data.supportOptions.isEnabled ? "On" : "Off"}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Extra support channels beside the form — Live Chat, Help Center, WhatsApp, etc. Ideal: 3–4, max 6.
          </p>
          <Input
            label="Section title *"
            value={data.supportOptions.title}
            onChange={(e) => {
              setData((d) => ({ ...d, supportOptions: { ...d.supportOptions, title: e.target.value } }));
              mark();
            }}
            placeholder="Other Ways to Reach Us"
          />
          {data.supportOptions.items.map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {item.title || `Option ${i + 1}`}
                  {" — "}
                  <span className={item.isAvailable ? "text-green-600" : "text-gray-400"}>
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </span>
                <button type="button" onClick={() => removeSupportOption(i)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Title *"
                  value={item.title}
                  onChange={(e) => updateSupportOption(i, "title", e.target.value)}
                  placeholder="Live Chat"
                />
                <Input
                  label="Description (optional)"
                  value={item.description ?? ""}
                  onChange={(e) => updateSupportOption(i, "description", e.target.value)}
                  placeholder="Chat with our support team"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Action URL (optional)"
                  value={item.actionUrl ?? ""}
                  onChange={(e) => updateSupportOption(i, "actionUrl", e.target.value)}
                  placeholder="https://…"
                />
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={item.isAvailable}
                      onChange={(e) => updateSupportOption(i, "isAvailable", e.target.checked)}
                      className="rounded"
                    />
                    Mark as available
                  </label>
                </div>
              </div>
              <IconPicker
                label="Icon (optional)"
                value={item.icon}
                allowed={CONTACT_ICONS}
                onChange={(icon) => updateSupportOption(i, "icon", icon)}
              />
            </div>
          ))}
          {data.supportOptions.items.length < 6 && (
            <Button variant="outline" size="sm" onClick={addSupportOption} className="w-full">
              <Plus size={16} className="mr-2" /> Add Support Option
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {/* Social Links */}
      <CollapsibleSection
        title="Social Links"
        icon={<Share2 size={20} className="text-primary" />}
        badge={
          <button
            type="button"
            onClick={() => {
              setData((d) => ({ ...d, socialLinks: { ...d.socialLinks, isEnabled: !d.socialLinks.isEnabled } }));
              mark();
            }}
            className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              data.socialLinks.isEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {data.socialLinks.isEnabled ? "On" : "Off"}
          </button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Social platform icons shown on the Contact page.</p>
            {brand?.footer?.socialLinks && (
              <Button variant="outline" size="sm" onClick={copyFooterSocialLinks}>
                Copy from Brand Footer
              </Button>
            )}
          </div>
          <Input
            label="Section title (optional)"
            value={data.socialLinks.title ?? ""}
            onChange={(e) => {
              setData((d) => ({ ...d, socialLinks: { ...d.socialLinks, title: e.target.value } }));
              mark();
            }}
            placeholder="Follow Us"
          />
          {data.socialLinks.items.map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}
                  {item.url && ` — ${item.url}`}
                </span>
                <button type="button" onClick={() => removeSocialLink(i)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Platform *"
                  value={item.platform}
                  options={SOCIAL_PLATFORMS}
                  onChange={(e) => updateSocialLink(i, "platform", e.target.value)}
                />
                <Input
                  label="Label (optional)"
                  value={item.label ?? ""}
                  onChange={(e) => updateSocialLink(i, "label", e.target.value)}
                  placeholder="Facebook"
                />
              </div>
              <Input
                label="Profile URL *"
                type="url"
                value={item.url}
                onChange={(e) => updateSocialLink(i, "url", e.target.value)}
                placeholder="https://facebook.com/yourstore"
              />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addSocialLink} className="w-full">
            <Plus size={16} className="mr-2" /> Add Social Link
          </Button>
        </div>
      </CollapsibleSection>

      {/* FAQ */}
      <CollapsibleSection
        title="FAQ"
        icon={<HelpCircle size={20} className="text-primary" />}
        badge={
          <button
            type="button"
            onClick={() => {
              setData((d) => ({ ...d, faq: { ...d.faq, isEnabled: !d.faq.isEnabled } }));
              mark();
            }}
            className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              data.faq.isEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {data.faq.isEnabled ? "On" : "Off"}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Common questions shown below the form. Ideal: 4–6, max 12. Try: shipping, returns, order tracking, payment, refunds.
          </p>
          <Input
            label="Eyebrow (optional)"
            value={data.faq.eyebrow ?? ""}
            onChange={(e) => {
              setData((d) => ({ ...d, faq: { ...d.faq, eyebrow: e.target.value } }));
              mark();
            }}
            placeholder="Common Questions"
          />
          <Input
            label="Section title *"
            value={data.faq.title}
            onChange={(e) => {
              setData((d) => ({ ...d, faq: { ...d.faq, title: e.target.value } }));
              mark();
            }}
            placeholder="Frequently Asked Questions"
          />
          <Textarea
            label="Section intro (optional)"
            value={data.faq.description ?? ""}
            onChange={(e) => {
              setData((d) => ({ ...d, faq: { ...d.faq, description: e.target.value } }));
              mark();
            }}
            placeholder="Quick answers to common questions."
            rows={2}
          />

          <div className="space-y-2">
            {data.faq.items.map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                >
                  <span className="text-sm font-medium text-foreground truncate">
                    {item.question || `Question ${i + 1}`}
                  </span>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFaq(i); }}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </button>
                {expandedFaq === i && (
                  <div className="p-4 space-y-3">
                    <Input
                      label="Question *"
                      value={item.question}
                      onChange={(e) => updateFaq(i, "question", e.target.value)}
                      placeholder="What are your shipping options?"
                    />
                    <Textarea
                      label="Answer *"
                      value={item.answer}
                      onChange={(e) => updateFaq(i, "answer", e.target.value)}
                      placeholder="We offer standard and express delivery in supported areas."
                      rows={3}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {data.faq.items.length < 12 && (
            <Button variant="outline" size="sm" onClick={addFaq} className="w-full">
              <Plus size={16} className="mr-2" /> Add FAQ
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {/* Location */}
      <CollapsibleSection
        title="Location"
        icon={<MapPin size={20} className="text-primary" />}
        badge={
          <button
            type="button"
            onClick={() => updateLocation("isEnabled", !data.location.isEnabled)}
            className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              data.location.isEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {data.location.isEnabled ? "On" : "Off"}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Shows your physical address or a map at the bottom of the page. Leave off if you are online-only.
          </p>
          <Input
            label="Section title *"
            value={data.location.title}
            onChange={(e) => updateLocation("title", e.target.value)}
            placeholder="Find Us"
          />
          <Textarea
            label="Intro text (optional)"
            value={data.location.description ?? ""}
            onChange={(e) => updateLocation("description", e.target.value)}
            placeholder="Visit our office or find us on the map."
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Address label (optional)"
              value={data.location.addressLabel ?? ""}
              onChange={(e) => updateLocation("addressLabel", e.target.value)}
              placeholder="Our Location"
            />
            <Textarea
              label="Address *"
              value={data.location.address}
              onChange={(e) => updateLocation("address", e.target.value)}
              placeholder="123 Commerce Street, Dhaka, Bangladesh"
              rows={2}
            />
          </div>
          <Textarea
            label="Map embed URL (optional — paste Google Maps embed src)"
            value={data.location.mapEmbedUrl ?? ""}
            onChange={(e) => updateLocation("mapEmbedUrl", e.target.value || null)}
            placeholder="https://www.google.com/maps/embed?pb=…"
            rows={2}
            hint="Paste the src URL from the Google Maps embed iframe. If left empty, a styled address card is shown instead."
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Directions URL (optional)"
              type="url"
              value={data.location.directionsUrl ?? ""}
              onChange={(e) => updateLocation("directionsUrl", e.target.value)}
              placeholder="https://maps.google.com/?q=…"
            />
            <Input
              label="Directions button text (optional)"
              value={data.location.buttonText ?? ""}
              onChange={(e) => updateLocation("buttonText", e.target.value)}
              placeholder="Get Directions"
            />
          </div>
          {(data.location.directionsUrl && !data.location.buttonText) && (
            <p className="text-xs text-amber-600">
              Directions button will be hidden until button text is also filled in.
            </p>
          )}
          <ImageUploadField
            label="Map image (optional — shown when no embed URL is set)"
            currentUrl={getImageUrl(data.location.mapImage)}
            onFileSelect={(f) => {
              setMapImageFile(f);
              mark();
            }}
            maxSizeMB={5}
            helpText="Static map screenshot or location photo. Shown instead of the embed when no map URL is provided."
            aspectHint="Recommended: 800×400px"
          />
        </div>
      </CollapsibleSection>

      {/* SEO */}
      <CollapsibleSection
        title="SEO"
        icon={<Search size={20} className="text-primary" />}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Controls the browser tab title and search engine snippet for the Contact page.
          </p>
          <Input
            label="Page title (optional)"
            value={data.seo?.title ?? ""}
            onChange={(e) => updateSeo("title", e.target.value)}
            placeholder="Contact Your Store"
          />
          <Textarea
            label="Meta description (optional)"
            value={data.seo?.description ?? ""}
            onChange={(e) => updateSeo("description", e.target.value)}
            placeholder="Contact us for support, questions, and store information."
            rows={2}
            hint="Fallback: hero description is used when empty."
          />
        </div>
      </CollapsibleSection>

      {/* Floating save */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={handleSave}
            disabled={updateLoading}
            className="shadow-lg"
          >
            {updateLoading ? (
              <><ButtonSpinner /> Saving…</>
            ) : (
              <><Save size={16} className="mr-2" /> Save Contact Page</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
