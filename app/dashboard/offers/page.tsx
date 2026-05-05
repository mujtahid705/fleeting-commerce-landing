"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Tag,
  Percent,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Check,
  TicketPercent,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SaleDiscountModal from "@/components/dashboard/SaleDiscountModal";
import CouponModal from "@/components/dashboard/CouponModal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchSaleDiscounts,
  fetchCoupons,
  updateSaleDiscount,
  deleteSaleDiscount,
  updateCoupon,
  deleteCoupon,
} from "@/lib/store/slices/offersSlice";
import { useToast } from "@/components/ui/Toast";
import { SaleDiscount, Coupon } from "@/lib/types/offers";

// ── Helpers ───────────────────────────────────────────────────────────────────

type ItemStatus = "Active" | "Inactive" | "Scheduled" | "Expired";

function getStatus(item: { isActive: boolean; startsAt: string | null; endsAt: string | null }): ItemStatus {
  if (!item.isActive) return "Inactive";
  const now = Date.now();
  if (item.startsAt && new Date(item.startsAt).getTime() > now) return "Scheduled";
  if (item.endsAt && new Date(item.endsAt).getTime() < now) return "Expired";
  return "Active";
}

function statusBadge(status: ItemStatus) {
  const cls: Record<ItemStatus, string> = {
    Active: "bg-green-100 text-green-700",
    Scheduled: "bg-blue-100 text-blue-700",
    Expired: "bg-gray-100 text-gray-700",
    Inactive: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${cls[status]}`}>
      {status}
    </span>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function discountLabel(type: "PERCENTAGE" | "FIXED_AMOUNT", val: number): string {
  return type === "PERCENTAGE" ? `${val}%` : `৳${val} off`;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-8 bg-gray-100 rounded-lg" />
      </div>
      <div className="h-7 w-24 bg-gray-200 rounded-full mb-4" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded" />
        <div className="h-3 w-3/4 bg-gray-100 rounded" />
        <div className="h-3 w-1/2 bg-gray-100 rounded" />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

// ── Sale Discount Card ────────────────────────────────────────────────────────

interface SaleCardProps {
  sale: SaleDiscount;
  onEdit: (sale: SaleDiscount) => void;
  onDelete: (sale: SaleDiscount) => void;
}

function SaleCard({ sale, onEdit, onDelete }: SaleCardProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const status = getStatus(sale);

  async function handleToggleActive() {
    const result = await dispatch(
      updateSaleDiscount({ id: sale.id, isActive: !sale.isActive })
    );
    if (updateSaleDiscount.rejected.match(result)) {
      showToast({ type: "error", title: "Error", message: result.payload as string });
    }
  }

  const scopeLabel =
    sale.scope === "ALL_PRODUCTS"
      ? "All Products"
      : `${sale.products.length} Product${sale.products.length !== 1 ? "s" : ""}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-semibold text-foreground truncate">{sale.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              {scopeLabel}
            </span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              {sale.discountType === "PERCENTAGE" ? "Percentage" : "Fixed Amount"}
            </span>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical size={16} className="text-muted" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-20">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(sale); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors rounded-t-xl"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(sale); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-xl"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Discount Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-full mb-4">
        <Percent size={14} />
        <span className="font-semibold text-sm">{discountLabel(sale.discountType, sale.value)}</span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Starts</span>
          <span className="font-medium text-foreground">
            {sale.startsAt ? formatDate(sale.startsAt) : "Immediate"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Ends</span>
          <span className="font-medium text-foreground">
            {sale.endsAt ? formatDate(sale.endsAt) : "No end"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        {statusBadge(status)}
        <button
          onClick={handleToggleActive}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            sale.isActive ? "bg-primary" : "bg-gray-300"
          }`}
          title={sale.isActive ? "Deactivate" : "Activate"}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              sale.isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

// ── Coupon Card ───────────────────────────────────────────────────────────────

interface CouponCardProps {
  coupon: Coupon;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
}

function CouponCard({ coupon, onEdit, onDelete }: CouponCardProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const status = getStatus(coupon);

  async function handleToggleActive() {
    const result = await dispatch(
      updateCoupon({ id: coupon.id, isActive: !coupon.isActive })
    );
    if (updateCoupon.rejected.match(result)) {
      showToast({ type: "error", title: "Error", message: result.payload as string });
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-primary">
              {coupon.code}
            </code>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} className="text-muted" />
              )}
            </button>
          </div>
          {coupon.description && (
            <p className="mt-1.5 text-xs text-muted line-clamp-2">{coupon.description}</p>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical size={16} className="text-muted" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-20">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(coupon); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors rounded-t-xl"
                >
                  <Edit size={14} /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(coupon); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-xl"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Discount Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 text-primary rounded-full mb-4">
        <Percent size={14} />
        <span className="font-semibold text-sm">{discountLabel(coupon.discountType, coupon.value)}</span>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Usage</span>
          <span className="font-medium text-foreground">
            {coupon.usedCount}
            {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : " (Unlimited)"}
          </span>
        </div>
        {coupon.minOrderAmount != null && (
          <div className="flex justify-between">
            <span className="text-muted">Min Order</span>
            <span className="font-medium text-foreground">৳{coupon.minOrderAmount}</span>
          </div>
        )}
        {coupon.maxDiscountAmount != null && (
          <div className="flex justify-between">
            <span className="text-muted">Max Discount</span>
            <span className="font-medium text-foreground">৳{coupon.maxDiscountAmount}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted">Starts</span>
          <span className="font-medium text-foreground">
            {coupon.startsAt ? formatDate(coupon.startsAt) : "Immediate"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Ends</span>
          <span className="font-medium text-foreground">
            {coupon.endsAt ? formatDate(coupon.endsAt) : "No end"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        {statusBadge(status)}
        <button
          onClick={handleToggleActive}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            coupon.isActive ? "bg-primary" : "bg-gray-300"
          }`}
          title={coupon.isActive ? "Deactivate" : "Activate"}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              coupon.isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ label, onCreate }: { label: string; onCreate: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <TicketPercent size={28} className="text-muted" />
      </div>
      <p className="text-foreground font-medium mb-1">{label}</p>
      <p className="text-sm text-muted mb-6">Get started by creating your first one.</p>
      <Button size="sm" onClick={onCreate} className="flex items-center gap-2">
        <Plus size={16} />
        Create
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "sales" | "coupons";

export default function OffersPage() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { sales, coupons, isLoading, isSubmitting } = useAppSelector((s) => s.offers);

  const [tab, setTab] = useState<Tab>("sales");
  const [search, setSearch] = useState("");

  // Sale modal state
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<SaleDiscount | null>(null);
  const [deletingSale, setDeletingSale] = useState<SaleDiscount | null>(null);

  // Coupon modal state
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    dispatch(fetchSaleDiscounts());
    dispatch(fetchCoupons());
  }, [dispatch]);

  // Stats
  const totalSales = sales.length;
  const activeSales = useMemo(
    () => sales.filter((s) => getStatus(s) === "Active").length,
    [sales]
  );
  const totalCoupons = coupons.length;
  const activeCoupons = useMemo(
    () => coupons.filter((c) => getStatus(c) === "Active").length,
    [coupons]
  );

  // Filtered lists
  const filteredSales = useMemo(
    () =>
      sales.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase())
      ),
    [sales, search]
  );

  const filteredCoupons = useMemo(
    () =>
      coupons.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      ),
    [coupons, search]
  );

  // Sale handlers
  function openNewSale() { setEditingSale(null); setSaleModalOpen(true); }
  function openEditSale(sale: SaleDiscount) { setEditingSale(sale); setSaleModalOpen(true); }

  async function handleDeleteSale() {
    if (!deletingSale) return;
    const result = await dispatch(deleteSaleDiscount(deletingSale.id));
    if (deleteSaleDiscount.fulfilled.match(result)) {
      showToast({ type: "success", title: "Deleted", message: "Sale discount removed" });
    } else {
      showToast({ type: "error", title: "Error", message: result.payload as string });
    }
    setDeletingSale(null);
  }

  // Coupon handlers
  function openNewCoupon() { setEditingCoupon(null); setCouponModalOpen(true); }
  function openEditCoupon(coupon: Coupon) { setEditingCoupon(coupon); setCouponModalOpen(true); }

  async function handleDeleteCoupon() {
    if (!deletingCoupon) return;
    const result = await dispatch(deleteCoupon(deletingCoupon.id));
    if (deleteCoupon.fulfilled.match(result)) {
      showToast({ type: "success", title: "Deleted", message: "Coupon removed" });
    } else {
      showToast({ type: "error", title: "Error", message: result.payload as string });
    }
    setDeletingCoupon(null);
  }

  const createButton = (
    <Button
      size="sm"
      className="flex items-center gap-2"
      onClick={tab === "sales" ? openNewSale : openNewCoupon}
    >
      <Plus size={16} />
      {tab === "sales" ? "New Sale" : "New Coupon"}
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Offers & Discounts"
        subtitle="Create and manage sale discounts and coupon codes"
        action={createButton}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Sales"
          value={totalSales.toString()}
          icon={Tag}
          iconColor="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          title="Active Sales"
          value={activeSales.toString()}
          icon={Percent}
          iconColor="from-green-500 to-emerald-500"
          delay={0.1}
        />
        <StatCard
          title="Total Coupons"
          value={totalCoupons.toString()}
          icon={TicketPercent}
          iconColor="from-purple-500 to-pink-500"
          delay={0.2}
        />
        <StatCard
          title="Active Coupons"
          value={activeCoupons.toString()}
          icon={TicketPercent}
          iconColor="from-yellow-500 to-orange-500"
          delay={0.3}
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setTab("sales"); setSearch(""); }}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "sales"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Sale Discounts
        </button>
        <button
          onClick={() => { setTab("coupons"); setSearch(""); }}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            tab === "coupons"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Coupons
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder={tab === "sales" ? "Search sales..." : "Search coupons or codes..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
        <Button
          size="sm"
          className="flex items-center gap-2 sm:hidden"
          onClick={tab === "sales" ? openNewSale : openNewCoupon}
        >
          <Plus size={16} />
          {tab === "sales" ? "New Sale" : "New Coupon"}
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : tab === "sales" ? (
          filteredSales.length === 0 ? (
            <EmptyState
              label="No sales created yet"
              onCreate={openNewSale}
            />
          ) : (
            filteredSales.map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                onEdit={openEditSale}
                onDelete={setDeletingSale}
              />
            ))
          )
        ) : filteredCoupons.length === 0 ? (
          <EmptyState
            label="No coupons created yet"
            onCreate={openNewCoupon}
          />
        ) : (
          filteredCoupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onEdit={openEditCoupon}
              onDelete={setDeletingCoupon}
            />
          ))
        )}
      </div>

      {/* Sale Discount Modal */}
      <SaleDiscountModal
        isOpen={saleModalOpen}
        onClose={() => setSaleModalOpen(false)}
        sale={editingSale}
      />

      {/* Coupon Modal */}
      <CouponModal
        isOpen={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        coupon={editingCoupon}
      />

      {/* Confirm Delete – Sale */}
      <ConfirmDialog
        isOpen={!!deletingSale}
        onClose={() => setDeletingSale(null)}
        onConfirm={handleDeleteSale}
        title="Delete Sale Discount"
        message={`Are you sure you want to delete "${deletingSale?.title}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />

      {/* Confirm Delete – Coupon */}
      <ConfirmDialog
        isOpen={!!deletingCoupon}
        onClose={() => setDeletingCoupon(null)}
        onConfirm={handleDeleteCoupon}
        title="Delete Coupon"
        message={`Are you sure you want to delete the coupon "${deletingCoupon?.code}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </>
  );
}
