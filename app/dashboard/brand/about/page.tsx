"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  BarChart2,
  BookOpen,
  Star,
  Milestone,
  Users,
  Target,
  Search,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ButtonSpinner, PageSpinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
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
import ImageUploadField from "@/components/dashboard/ImageUploadField";
import IconPicker from "@/components/dashboard/IconPicker";
import type {
  AboutPageSection,
  AboutStatItem,
  IconName,
} from "@/lib/types/brand";

const ABOUT_ICONS: IconName[] = [
  "users",
  "shopping-bag",
  "award",
  "truck",
  "shield",
  "heart",
  "star",
  "globe",
  "target",
  "map-pin",
  "sparkles",
  "leaf",
];

const DEFAULT_ABOUT: AboutPageSection = {
  isEnabled: true,
  hero: {
    eyebrow: "Our Story",
    title: "",
    highlightText: "",
    description: "",
    backgroundImage: null,
  },
  stats: {
    isEnabled: true,
    items: [],
  },
  story: {
    isEnabled: true,
    eyebrow: "How It Started",
    title: "Our Story",
    paragraphs: [""],
    featuredCard: { title: "", description: "", icon: undefined },
    image: null,
  },
  values: {
    isEnabled: true,
    eyebrow: "What We Believe",
    title: "Our Values",
    description: "",
    items: [],
  },
  milestones: {
    isEnabled: true,
    eyebrow: "Milestones",
    title: "Our Journey",
    description: "",
    items: [],
  },
  team: {
    isEnabled: true,
    eyebrow: "The People",
    title: "Meet Our Team",
    description: "",
    members: [],
  },
  mission: {
    isEnabled: true,
    title: "Our Mission",
    description: "",
    icon: "target",
  },
  seo: { title: "", description: "" },
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (
    path.startsWith("http") ||
    path.startsWith("blob:") ||
    path.startsWith("data:")
  )
    return path;
  let base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  if (base.endsWith("/api")) base = base.slice(0, -4);
  const imagePath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${imagePath}`;
}

export default function AboutPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { brand, loading, updateLoading } = useAppSelector((s) => s.brand);

  const [data, setData] = useState<AboutPageSection>(DEFAULT_ABOUT);
  const [hasChanges, setHasChanges] = useState(false);

  // Image files
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [storyImageFile, setStoryImageFile] = useState<File | null>(null);
  const [teamImageFiles, setTeamImageFiles] = useState<(File | null)[]>([]);

  useEffect(() => {
    if (!brand) dispatch(fetchBrand());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (brand?.aboutPage) {
      setData(brand.aboutPage);
      setTeamImageFiles(
        (brand.aboutPage.team?.members ?? []).map(() => null)
      );
    }
  }, [brand]);

  function mark() {
    setHasChanges(true);
  }

  function updateHero(key: string, value: string | null) {
    setData((d) => ({ ...d, hero: { ...d.hero, [key]: value } }));
    mark();
  }

  function updateStats(key: string, value: boolean | AboutStatItem[]) {
    setData((d) => ({ ...d, stats: { ...d.stats, [key]: value } }));
    mark();
  }

  function addStat() {
    if (data.stats.items.length >= 6) return;
    setData((d) => ({
      ...d,
      stats: { ...d.stats, items: [...d.stats.items, { label: "", value: "", icon: undefined }] },
    }));
    mark();
  }

  function updateStat(i: number, key: string, value: string | IconName | undefined) {
    setData((d) => {
      const items = [...d.stats.items];
      items[i] = { ...items[i], [key]: value };
      return { ...d, stats: { ...d.stats, items } };
    });
    mark();
  }

  function removeStat(i: number) {
    setData((d) => ({
      ...d,
      stats: { ...d.stats, items: d.stats.items.filter((_, idx) => idx !== i) },
    }));
    mark();
  }

  function updateStory(key: string, value: unknown) {
    setData((d) => ({ ...d, story: { ...d.story, [key]: value } }));
    mark();
  }

  function updateParagraph(i: number, value: string) {
    setData((d) => {
      const paragraphs = [...d.story.paragraphs];
      paragraphs[i] = value;
      return { ...d, story: { ...d.story, paragraphs } };
    });
    mark();
  }

  function addParagraph() {
    if (data.story.paragraphs.length >= 4) return;
    setData((d) => ({
      ...d,
      story: { ...d.story, paragraphs: [...d.story.paragraphs, ""] },
    }));
    mark();
  }

  function removeParagraph(i: number) {
    setData((d) => ({
      ...d,
      story: { ...d.story, paragraphs: d.story.paragraphs.filter((_, idx) => idx !== i) },
    }));
    mark();
  }

  function updateFeaturedCard(key: string, value: string | IconName | undefined) {
    setData((d) => ({
      ...d,
      story: { ...d.story, featuredCard: { ...d.story.featuredCard, [key]: value } },
    }));
    mark();
  }

  function updateValues(key: string, value: unknown) {
    setData((d) => ({ ...d, values: { ...d.values, [key]: value } }));
    mark();
  }

  function addValue() {
    if (data.values.items.length >= 6) return;
    setData((d) => ({
      ...d,
      values: { ...d.values, items: [...d.values.items, { title: "", description: "", icon: undefined }] },
    }));
    mark();
  }

  function updateValue(i: number, key: string, value: string | IconName | undefined) {
    setData((d) => {
      const items = [...d.values.items];
      items[i] = { ...items[i], [key]: value };
      return { ...d, values: { ...d.values, items } };
    });
    mark();
  }

  function removeValue(i: number) {
    setData((d) => ({
      ...d,
      values: { ...d.values, items: d.values.items.filter((_, idx) => idx !== i) },
    }));
    mark();
  }

  function updateMilestones(key: string, value: unknown) {
    setData((d) => ({ ...d, milestones: { ...d.milestones, [key]: value } }));
    mark();
  }

  function addMilestone() {
    if (data.milestones.items.length >= 10) return;
    setData((d) => ({
      ...d,
      milestones: { ...d.milestones, items: [...d.milestones.items, { year: "", title: "", description: "" }] },
    }));
    mark();
  }

  function updateMilestone(i: number, key: string, value: string) {
    setData((d) => {
      const items = [...d.milestones.items];
      items[i] = { ...items[i], [key]: value };
      return { ...d, milestones: { ...d.milestones, items } };
    });
    mark();
  }

  function removeMilestone(i: number) {
    setData((d) => ({
      ...d,
      milestones: { ...d.milestones, items: d.milestones.items.filter((_, idx) => idx !== i) },
    }));
    mark();
  }

  function updateTeam(key: string, value: unknown) {
    setData((d) => ({ ...d, team: { ...d.team, [key]: value } }));
    mark();
  }

  function addMember() {
    if (data.team.members.length >= 8) return;
    setData((d) => ({
      ...d,
      team: { ...d.team, members: [...d.team.members, { name: "", role: "", description: "", image: null }] },
    }));
    setTeamImageFiles((f) => [...f, null]);
    mark();
  }

  function updateMember(i: number, key: string, value: string | null) {
    setData((d) => {
      const members = [...d.team.members];
      members[i] = { ...members[i], [key]: value };
      return { ...d, team: { ...d.team, members } };
    });
    mark();
  }

  function removeMember(i: number) {
    setData((d) => ({
      ...d,
      team: { ...d.team, members: d.team.members.filter((_, idx) => idx !== i) },
    }));
    setTeamImageFiles((f) => f.filter((_, idx) => idx !== i));
    mark();
  }

  function setTeamImageFile(i: number, file: File | null) {
    setTeamImageFiles((f) => {
      const next = [...f];
      next[i] = file;
      return next;
    });
    mark();
  }

  function updateMission(key: string, value: string | boolean | IconName | undefined) {
    setData((d) => ({ ...d, mission: { ...d.mission, [key]: value } }));
    mark();
  }

  function updateSeo(key: string, value: string) {
    setData((d) => ({ ...d, seo: { ...d.seo, [key]: value } }));
    mark();
  }

  async function handleSave() {
    const payload = {
      aboutPage: data,
      ...(heroImageFile ? { aboutHeroImage: heroImageFile } : {}),
      ...(storyImageFile ? { aboutStoryImage: storyImageFile } : {}),
      ...(teamImageFiles.some((f) => f !== null)
        ? { aboutTeamImages: teamImageFiles.filter((f): f is File => f !== null) }
        : {}),
    };

    try {
      if (brand) {
        await dispatch(updateBrand(payload)).unwrap();
      } else {
        await dispatch(upsertBrand(payload)).unwrap();
      }
      await dispatch(fetchBrand());
      setHasChanges(false);
      showToast({ type: "success", title: "Saved", message: "About page updated." });
    } catch (err: unknown) {
      showToast({
        type: "error",
        title: "Save failed",
        message: typeof err === "string" ? err : "Could not save about page.",
      });
    }
  }

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="About Page"
        subtitle="Tell your store's story — customers will see this on the About page."
      />

      {/* Page Status */}
      <PageCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">About Page Status</p>
            <p className="text-sm text-muted mt-0.5">
              When disabled the About page shows no dynamic content.
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
        icon={<FileText size={20} className="text-primary" />}
        defaultOpen
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            First thing customers see on the About page. Keep the title clear and the description welcoming.
          </p>
          <Input
            label="Eyebrow (optional)"
            value={data.hero.eyebrow ?? ""}
            onChange={(e) => updateHero("eyebrow", e.target.value)}
            placeholder="Our Story"
          />
          <div>
            <Input
              label="Title *"
              value={data.hero.title}
              onChange={(e) => updateHero("title", e.target.value)}
              placeholder="About Your Store"
              maxLength={80}
            />
            <p className="mt-1 text-xs text-muted text-right">{data.hero.title.length}/80</p>
          </div>
          <Input
            label="Highlighted word(s) in title (optional)"
            value={data.hero.highlightText ?? ""}
            onChange={(e) => updateHero("highlightText", e.target.value)}
            placeholder="Your Store"
          />
          <div>
            <Textarea
              label="Description *"
              value={data.hero.description}
              onChange={(e) => updateHero("description", e.target.value)}
              placeholder="Your trusted partner for quality products and exceptional shopping experience."
              rows={3}
              maxLength={280}
            />
            <p className="mt-1 text-xs text-muted text-right">{data.hero.description.length}/280</p>
          </div>
          <ImageUploadField
            label="Background image (optional)"
            currentUrl={getImageUrl(data.hero.backgroundImage)}
            onFileSelect={(f) => {
              setHeroImageFile(f);
              mark();
            }}
            maxSizeMB={5}
            helpText="Used as the hero background. If left empty a theme default is shown."
            aspectHint="Recommended: 1440×600px"
          />
        </div>
      </CollapsibleSection>

      {/* Stats */}
      <CollapsibleSection
        title="Stats"
        icon={<BarChart2 size={20} className="text-primary" />}
        badge={
          <button
            type="button"
            onClick={() => {
              updateStats("isEnabled", !data.stats.isEnabled);
            }}
            className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              data.stats.isEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {data.stats.isEnabled ? "On" : "Off"}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Trust-building numbers shown below the hero. Use short values customers can scan quickly — like{" "}
            <code className="bg-gray-100 px-1 rounded">5+</code>,{" "}
            <code className="bg-gray-100 px-1 rounded">10,000+</code>, or{" "}
            <code className="bg-gray-100 px-1 rounded">24/7</code>. Ideal: 4 stats, max 6.
          </p>
          {data.stats.items.map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  Stat {i + 1}
                  {item.label && ` — ${item.label}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeStat(i)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Label"
                  value={item.label}
                  onChange={(e) => updateStat(i, "label", e.target.value)}
                  placeholder="Happy Customers"
                />
                <Input
                  label="Value"
                  value={item.value}
                  onChange={(e) => updateStat(i, "value", e.target.value)}
                  placeholder="50,000+"
                />
              </div>
              <IconPicker
                label="Icon (optional)"
                value={item.icon}
                allowed={ABOUT_ICONS}
                onChange={(icon) => updateStat(i, "icon", icon)}
              />
            </div>
          ))}
          {data.stats.items.length < 6 && (
            <Button variant="outline" size="sm" onClick={addStat} className="w-full">
              <Plus size={16} className="mr-2" /> Add Stat
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {/* Story */}
      <CollapsibleSection
        title="Story"
        icon={<BookOpen size={20} className="text-primary" />}
        badge={
          <button
            type="button"
            onClick={() => updateStory("isEnabled", !data.story.isEnabled)}
            className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              data.story.isEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {data.story.isEnabled ? "On" : "Off"}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Tell customers how your store started, what you sell, and why they should trust you.
          </p>
          <Input
            label="Eyebrow (optional)"
            value={data.story.eyebrow ?? ""}
            onChange={(e) => updateStory("eyebrow", e.target.value)}
            placeholder="How It Started"
          />
          <Input
            label="Section title *"
            value={data.story.title}
            onChange={(e) => updateStory("title", e.target.value)}
            placeholder="Our Story"
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Story paragraphs (1–4) *
            </label>
            <div className="space-y-2">
              {data.story.paragraphs.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <Textarea
                    value={p}
                    onChange={(e) => updateParagraph(i, e.target.value)}
                    placeholder={`Paragraph ${i + 1} (80–350 characters)`}
                    rows={3}
                    className="flex-1"
                  />
                  {data.story.paragraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParagraph(i)}
                      className="self-start mt-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {data.story.paragraphs.length < 4 && (
              <Button variant="outline" size="sm" onClick={addParagraph} className="mt-2">
                <Plus size={16} className="mr-1" /> Add Paragraph
              </Button>
            )}
          </div>

          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
            <p className="text-sm font-medium text-foreground">
              Featured card (shown if no image is set)
            </p>
            <Input
              label="Card title"
              value={data.story.featuredCard?.title ?? ""}
              onChange={(e) => updateFeaturedCard("title", e.target.value)}
              placeholder="Quality First"
            />
            <Textarea
              label="Card description"
              value={data.story.featuredCard?.description ?? ""}
              onChange={(e) => updateFeaturedCard("description", e.target.value)}
              placeholder="Every product is carefully selected before reaching our customers."
              rows={2}
            />
            <IconPicker
              label="Card icon (optional)"
              value={data.story.featuredCard?.icon}
              allowed={ABOUT_ICONS}
              onChange={(icon) => updateFeaturedCard("icon", icon)}
            />
          </div>

          <ImageUploadField
            label="Story section image (optional — replaces featured card)"
            currentUrl={getImageUrl(data.story.image)}
            onFileSelect={(f) => {
              setStoryImageFile(f);
              mark();
            }}
            maxSizeMB={5}
            helpText="If uploaded, this image is shown instead of the featured card."
            aspectHint="Recommended: 600×500px"
          />
        </div>
      </CollapsibleSection>

      {/* Values */}
      <CollapsibleSection
        title="Values"
        icon={<Star size={20} className="text-primary" />}
        badge={
          <button
            type="button"
            onClick={() => updateValues("isEnabled", !data.values.isEnabled)}
            className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              data.values.isEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {data.values.isEnabled ? "On" : "Off"}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Core values shown as cards. Ideal: 3–4, max 6.
          </p>
          <Input
            label="Eyebrow (optional)"
            value={data.values.eyebrow ?? ""}
            onChange={(e) => updateValues("eyebrow", e.target.value)}
            placeholder="What We Believe"
          />
          <Input
            label="Section title *"
            value={data.values.title}
            onChange={(e) => updateValues("title", e.target.value)}
            placeholder="Our Values"
          />
          <Textarea
            label="Section intro (optional)"
            value={data.values.description ?? ""}
            onChange={(e) => updateValues("description", e.target.value)}
            placeholder="These core values guide everything we do."
            rows={2}
          />
          {data.values.items.map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Value {i + 1}
                  {item.title && ` — ${item.title}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeValue(i)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <Input
                label="Title *"
                value={item.title}
                onChange={(e) => updateValue(i, "title", e.target.value)}
                placeholder="Customer First"
              />
              <Textarea
                label="Description *"
                value={item.description}
                onChange={(e) => updateValue(i, "description", e.target.value)}
                placeholder="We put customers at the heart of everything we do."
                rows={2}
              />
              <IconPicker
                label="Icon (optional)"
                value={item.icon}
                allowed={ABOUT_ICONS}
                onChange={(icon) => updateValue(i, "icon", icon)}
              />
            </div>
          ))}
          {data.values.items.length < 6 && (
            <Button variant="outline" size="sm" onClick={addValue} className="w-full">
              <Plus size={16} className="mr-2" /> Add Value
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {/* Milestones */}
      <CollapsibleSection
        title="Milestones"
        icon={<Milestone size={20} className="text-primary" />}
        badge={
          <button
            type="button"
            onClick={() => updateMilestones("isEnabled", !data.milestones.isEnabled)}
            className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              data.milestones.isEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {data.milestones.isEnabled ? "On" : "Off"}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Vertical timeline of key moments in your store&apos;s history. Ideal: 3–6, max 10.
          </p>
          <Input
            label="Eyebrow (optional)"
            value={data.milestones.eyebrow ?? ""}
            onChange={(e) => updateMilestones("eyebrow", e.target.value)}
            placeholder="Milestones"
          />
          <Input
            label="Section title *"
            value={data.milestones.title}
            onChange={(e) => updateMilestones("title", e.target.value)}
            placeholder="Our Journey"
          />
          <Textarea
            label="Section intro (optional)"
            value={data.milestones.description ?? ""}
            onChange={(e) => updateMilestones("description", e.target.value)}
            placeholder="From humble beginnings to serving thousands of customers."
            rows={2}
          />
          {data.milestones.items.map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {item.year ? `${item.year}` : `Milestone ${i + 1}`}
                  {item.title && ` — ${item.title}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeMilestone(i)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Year / Date badge *"
                  value={item.year}
                  onChange={(e) => updateMilestone(i, "year", e.target.value)}
                  placeholder="2020"
                />
                <Input
                  label="Title *"
                  value={item.title}
                  onChange={(e) => updateMilestone(i, "title", e.target.value)}
                  placeholder="Store Founded"
                />
              </div>
              <Textarea
                label="Description *"
                value={item.description}
                onChange={(e) => updateMilestone(i, "description", e.target.value)}
                placeholder="Started with a vision to improve online shopping."
                rows={2}
              />
            </div>
          ))}
          {data.milestones.items.length < 10 && (
            <Button variant="outline" size="sm" onClick={addMilestone} className="w-full">
              <Plus size={16} className="mr-2" /> Add Milestone
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {/* Team */}
      <CollapsibleSection
        title="Team"
        icon={<Users size={20} className="text-primary" />}
        badge={
          <button
            type="button"
            onClick={() => updateTeam("isEnabled", !data.team.isEnabled)}
            className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              data.team.isEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {data.team.isEnabled ? "On" : "Off"}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Optional team cards. Many stores leave this off. Ideal: 3, max 8. Use square photos.
          </p>
          <Input
            label="Eyebrow (optional)"
            value={data.team.eyebrow ?? ""}
            onChange={(e) => updateTeam("eyebrow", e.target.value)}
            placeholder="The People"
          />
          <Input
            label="Section title *"
            value={data.team.title}
            onChange={(e) => updateTeam("title", e.target.value)}
            placeholder="Meet Our Team"
          />
          <Textarea
            label="Section intro (optional)"
            value={data.team.description ?? ""}
            onChange={(e) => updateTeam("description", e.target.value)}
            placeholder="The passionate people behind the store."
            rows={2}
          />
          {data.team.members.map((member, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {member.name || `Member ${i + 1}`}
                  {member.role && ` — ${member.role}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeMember(i)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Name *"
                  value={member.name}
                  onChange={(e) => updateMember(i, "name", e.target.value)}
                  placeholder="Jane Doe"
                />
                <Input
                  label="Role *"
                  value={member.role}
                  onChange={(e) => updateMember(i, "role", e.target.value)}
                  placeholder="Founder & CEO"
                />
              </div>
              <Textarea
                label="Short bio (optional)"
                value={member.description ?? ""}
                onChange={(e) => updateMember(i, "description", e.target.value)}
                placeholder="Passionate about bringing quality products to customers."
                rows={2}
              />
              <ImageUploadField
                label="Photo (optional — square crop recommended)"
                currentUrl={getImageUrl(member.image)}
                onFileSelect={(f) => setTeamImageFile(i, f)}
                maxSizeMB={2}
                aspectHint="Recommended: 400×400px"
              />
            </div>
          ))}
          {data.team.members.length < 8 && (
            <Button variant="outline" size="sm" onClick={addMember} className="w-full">
              <Plus size={16} className="mr-2" /> Add Team Member
            </Button>
          )}
        </div>
      </CollapsibleSection>

      {/* Mission */}
      <CollapsibleSection
        title="Mission"
        icon={<Target size={20} className="text-primary" />}
        badge={
          <button
            type="button"
            onClick={() => updateMission("isEnabled", !data.mission.isEnabled)}
            className={`ml-2 px-2 py-0.5 rounded-md text-xs font-medium border ${
              data.mission.isEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-400 border-gray-200"
            }`}
          >
            {data.mission.isEnabled ? "On" : "Off"}
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Closing statement at the bottom of the About page. Keep it concise and customer-facing.
          </p>
          <Input
            label="Title *"
            value={data.mission.title}
            onChange={(e) => updateMission("title", e.target.value)}
            placeholder="Our Mission"
          />
          <Textarea
            label="Mission statement *"
            value={data.mission.description}
            onChange={(e) => updateMission("description", e.target.value)}
            placeholder="To provide an exceptional online shopping experience."
            rows={3}
          />
          <IconPicker
            label="Decorative icon (optional)"
            value={data.mission.icon}
            allowed={ABOUT_ICONS}
            onChange={(icon) => updateMission("icon", icon)}
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
            Controls the browser tab title and search engine snippet for the About page. If left empty,
            fallbacks are used automatically.
          </p>
          <Input
            label="Page title (optional)"
            value={data.seo?.title ?? ""}
            onChange={(e) => updateSeo("title", e.target.value)}
            placeholder="About Your Store"
          />
          <Textarea
            label="Meta description (optional)"
            value={data.seo?.description ?? ""}
            onChange={(e) => updateSeo("description", e.target.value)}
            placeholder="Learn more about us, our story, values, and mission."
            rows={2}
            hint="Fallback: hero description is used when empty."
          />
        </div>
      </CollapsibleSection>

      {/* Floating save button */}
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
              <><Save size={16} className="mr-2" /> Save About Page</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
