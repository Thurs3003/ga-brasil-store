import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { saveSetting, DEFAULT_WA_NUMBER } from "../lib/settings";

const DEFAULT_HERO_SLIDES = [
  {
    eyebrow: "Distribuidora de Maquiagens",
    title: "Produtos de beleza para quem compra e revende",
    description: "Encontre maquiagens, acessórios e kits promocionais com preços especiais para lojistas e revendedoras.",
    button: "Ver produtos",
    link: "#produtos",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Semana da Beleza",
    title: "Kits promocionais com condições especiais",
    description: "Monte pedidos maiores com descontos em produtos selecionados e atendimento personalizado pelo WhatsApp.",
    button: "Ver promoções",
    link: "#promocoes",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80",
  },
  {
    eyebrow: "Atacado e Revenda",
    title: "Compre para revender com mais variedade",
    description: "Produtos selecionados para lojas, salões, profissionais da beleza e revendedoras.",
    button: "Conhecer catálogo",
    link: "#produtos",
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80",
  },
];

const EMPTY_FORM = {
  name: "", brand: "", category: "", description: "",
  price: "", discount: "", installment: "", stock: "",
  tag: "", featured: false,
  image: "", gallery: [],
};

const EMPTY_SLIDE = { eyebrow: "", title: "", description: "", image: "", type: "split", showButtons: true };

const SLIDE_TYPES = [
  { value: "split",     label: "🖼️ Texto + Imagem lateral" },
  { value: "fullbg",   label: "🌅 Imagem de fundo com texto" },
  { value: "text-only", label: "✍️ Apenas texto (sem imagem)" },
];

const PRODUCT_TAGS = [
  "Lançamento",
  "Promoção",
  "Mais vendido",
  "Exclusivo",
  "Kit",
  "Novidade",
  "Edição limitada",
];

const ORDER_STATUSES = [
  { value: "aguardando",    label: "📲 Aguardando",     color: "#94a3b8" },
  { value: "novo",          label: "🆕 Novo",           color: "#3b82f6" },
  { value: "em_andamento",  label: "⏳ Em andamento",   color: "#f59e0b" },
  { value: "em_separacao",  label: "📦 Em separação",   color: "#8b5cf6" },
  { value: "enviado",       label: "🚚 Enviado",        color: "#06b6d4" },
  { value: "concluido",     label: "✅ Concluído",      color: "#10b981" },
  { value: "cancelado",     label: "❌ Cancelado",      color: "#ef4444" },
];

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`adminToast ${toast.type}`}>
      <span>{toast.type === "success" ? "✅" : "❌"}</span>
      {toast.message}
    </div>
  );
}

function MetricCard({ label, value, icon, color }) {
  return (
    <div className="metricCard" style={{ "--metric-color": color }}>
      <div className="metricIcon">{icon}</div>
      <div>
        <p className="metricLabel">{label}</p>
        <strong className="metricValue">{value}</strong>
      </div>
    </div>
  );
}

function LivePreview({ product, imagePreview }) {
  const basePrice = parseFloat(product.price) || 0;
  const discountPct = parseFloat(product.discount) || 0;
  const sellingPrice = discountPct > 0 ? basePrice * (1 - discountPct / 100) : basePrice;
  const showOldPrice = discountPct > 0 && basePrice > 0;

  return (
    <div className="livePreview">
      <p className="livePreviewLabel">Preview em tempo real</p>
      <div className="previewCard">
        <div className="previewImage">
          {imagePreview
            ? <img src={imagePreview} alt="preview" />
            : <span>📷</span>
          }
          {product.featured && <div className="previewBadge featured">🔥 Mais vendido</div>}
          {discountPct > 0 && <div className="previewBadge discount">-{discountPct}%</div>}
          {product.category && <div className="previewBadge category">{product.category}</div>}
        </div>
        <div className="previewInfo">
          <p className="previewBrand">{product.brand || "Marca"}</p>
          <p className="previewName">{product.name || "Nome do produto"}</p>
          <div className="previewPrices">
            {showOldPrice && <s>R$ {basePrice.toFixed(2).replace(".", ",")}</s>}
            <strong>R$ {sellingPrice > 0 ? sellingPrice.toFixed(2).replace(".", ",") : "0,00"}</strong>
          </div>
          {product.installment && <em>{product.installment}</em>}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [newProduct, setNewProduct] = useState(EMPTY_FORM);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState("");

  // Stock quick adjust
  const [stockEditId, setStockEditId] = useState(null);
  const [stockDelta, setStockDelta] = useState("1");

  // Hero carousel
  const [heroSlides, setHeroSlides] = useState(DEFAULT_HERO_SLIDES);
  const [editingSlideIdx, setEditingSlideIdx] = useState(null);
  const [slideForm, setSlideForm] = useState(EMPTY_SLIDE);
  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [slideImageFile, setSlideImageFile] = useState(null);
  const [slideImagePreview, setSlideImagePreview] = useState("");

  // Orders
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState("todos");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Product table filter
  const [productSearch, setProductSearch] = useState("");

  // Confirm modal
  const [confirmModal, setConfirmModal] = useState(null);

  function askConfirm(message, description = "") {
    return new Promise((resolve) => {
      setConfirmModal({ message, description, resolve });
    });
  }
  const [productCategoryFilter, setProductCategoryFilter] = useState("");

  // Drag to reorder products
  const [dragSrcId, setDragSrcId] = useState(null);

  // Order filters
  const [orderDateFrom, setOrderDateFrom] = useState("");
  const [orderDateTo, setOrderDateTo] = useState("");
  const [orderMinValue, setOrderMinValue] = useState("");

  // WhatsApp settings (3 numbers: orders, support, footer)
  const [waOrders, setWaOrders] = useState(DEFAULT_WA_NUMBER);
  const [waSupport, setWaSupport] = useState(DEFAULT_WA_NUMBER);
  const [waFooter, setWaFooter] = useState(DEFAULT_WA_NUMBER);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Promotions settings
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoActive, setPromoActive] = useState(false);
  const [promoTitle, setPromoTitle] = useState("Semana da Beleza");
  const [promoStart, setPromoStart] = useState("");
  const [promoEnd, setPromoEnd]     = useState("");

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function playNotificationSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }

  function field(key) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setNewProduct((p) => ({ ...p, [key]: value }));
    };
  }

  function slideField(key) {
    return (e) => setSlideForm((s) => ({ ...s, [key]: e.target.value }));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login");
  }

  async function loadProducts() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("id", { ascending: true });
    if (error) { showToast("Erro ao carregar produtos", "error"); }
    else { setProducts(data || []); }
    setIsLoading(false);
  }

  async function uploadImage() {
    if (!imageFile) return newProduct.image || "";
    const fileName = `${Date.now()}-${imageFile.name}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, imageFile);
    if (error) { showToast("Erro ao enviar imagem", "error"); return null; }
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function uploadGallery() {
    if (galleryFiles.length === 0) return newProduct.gallery || [];
    const urls = [];
    for (const file of galleryFiles) {
      const fileName = `gallery/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("product-images").upload(fileName, file);
      if (error) { showToast("Erro ao enviar galeria", "error"); return null; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    const imageUrl = await uploadImage();
    const galleryUrls = await uploadGallery();
    if (!imageUrl || !galleryUrls) { setIsSaving(false); return; }

    const basePrice = parseFloat(newProduct.price) || 0;
    const discountPct = parseFloat(newProduct.discount) || 0;
    const sellingPrice = discountPct > 0
      ? parseFloat((basePrice * (1 - discountPct / 100)).toFixed(2))
      : basePrice;

    const payload = {
      name: newProduct.name,
      brand: newProduct.brand,
      category: newProduct.category,
      description: newProduct.description,
      price: sellingPrice,
      old_price: discountPct > 0 ? basePrice : null,
      installment: newProduct.installment,
      stock: parseInt(newProduct.stock) || 0,
      tag: newProduct.tag,
      featured: newProduct.featured || false,
      image: imageUrl,
      gallery: galleryUrls,
    };

    if (editingProductId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProductId);
      if (error) {
        showToast(`Erro: ${error.message}`, "error");
      } else { showToast("Produto atualizado com sucesso!"); resetForm(); }
    } else {
      const { error } = await supabase.from("products").insert([{ ...payload, is_new: true }]);
      if (error) {
        showToast(`Erro: ${error.message}`, "error");
      } else { showToast("Produto cadastrado com sucesso!"); resetForm(); }
    }
    setIsSaving(false);
    loadProducts();
  }

  function resetForm() {
    setNewProduct(EMPTY_FORM);
    setEditingProductId(null);
    setImageFile(null);
    setGalleryFiles([]);
    setImagePreview("");
  }

  function startEdit(product) {
    setEditingProductId(product.id);
    const basePrice = product.old_price > 0 ? product.old_price : product.price;
    const discountPct = product.old_price > 0
      ? Math.round((1 - product.price / product.old_price) * 100)
      : "";

    setNewProduct({
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      description: product.description || "",
      price: basePrice || "",
      discount: discountPct,
      installment: product.installment || "",
      stock: product.stock || "",
      tag: product.tag || "",
      featured: product.featured || false,
      image: product.image || "",
      gallery: product.gallery || [],
    });
    setImagePreview(product.image || "");
  }

  async function deleteProduct(id, name) {
    const ok = await askConfirm(`Excluir "${name}"?`, "Esta ação não pode ser desfeita.");
    if (!ok) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { showToast("Erro ao excluir produto", "error"); }
    else { showToast("Produto excluído!"); loadProducts(); }
  }

  async function toggleFeatured(product) {
    const { error } = await supabase.from("products")
      .update({ featured: !product.featured }).eq("id", product.id);
    if (error) { showToast("Erro ao atualizar destaque", "error"); }
    else { loadProducts(); }
  }

  async function applyStockAdjust(product, mode) {
    const delta = parseInt(stockDelta) || 0;
    if (delta <= 0) return;
    const newStock = mode === "add"
      ? (product.stock || 0) + delta
      : Math.max(0, (product.stock || 0) - delta);
    const { error } = await supabase.from("products")
      .update({ stock: newStock }).eq("id", product.id);
    if (error) { showToast("Erro ao atualizar estoque", "error"); }
    else {
      setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, stock: newStock } : p));
      setStockEditId(null);
      setStockDelta("1");
    }
  }

  const handleImageFile = useCallback((file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  async function saveHeroSlides(slides) {
    const error = await saveSetting("hero_slides", slides);
    if (error) { showToast("Erro ao salvar slides", "error"); return false; }
    setHeroSlides(slides);
    return true;
  }

  const handleSlideImageFile = useCallback((file) => {
    if (!file) return;
    setSlideImageFile(file);
    setSlideImagePreview(URL.createObjectURL(file));
  }, []);

  function startEditSlide(idx) {
    setEditingSlideIdx(idx);
    const slide = idx === -1
      ? { ...EMPTY_SLIDE }
      : { ...EMPTY_SLIDE, ...heroSlides[idx], type: heroSlides[idx].type || "split", showButtons: heroSlides[idx].showButtons !== false };
    setSlideForm(slide);
    setSlideImageFile(null);
    setSlideImagePreview(slide.image || "");
  }

  function cancelSlideEdit() {
    setEditingSlideIdx(null);
    setSlideImageFile(null);
    setSlideImagePreview("");
  }

  async function saveSlide() {
    if (!slideForm.title.trim()) { showToast("O título do slide é obrigatório", "error"); return; }

    let imageUrl = slideForm.image;
    if (slideImageFile) {
      const fileName = `hero/${Date.now()}-${slideImageFile.name}`;
      const { error } = await supabase.storage.from("product-images").upload(fileName, slideImageFile);
      if (error) { showToast("Erro ao enviar imagem do slide", "error"); return; }
      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const slideData = { ...slideForm, image: imageUrl };
    const updated = editingSlideIdx === -1
      ? [...heroSlides, slideData]
      : heroSlides.map((s, i) => i === editingSlideIdx ? slideData : s);
    const ok = await saveHeroSlides(updated);
    if (!ok) return;
    setEditingSlideIdx(null);
    setSlideImageFile(null);
    setSlideImagePreview("");
    showToast("Slide salvo com sucesso!");
  }

  async function deleteSlide(idx) {
    const title = heroSlides[idx]?.title || "sem título";
    const confirmed = await askConfirm(`Excluir slide "${title}"?`);
    if (!confirmed) return;
    const ok = await saveHeroSlides(heroSlides.filter((_, i) => i !== idx));
    if (ok) showToast("Slide excluído!");
  }

  async function resetHeroSlides() {
    const confirmed = await askConfirm("Restaurar slides padrão?", "As alterações atuais serão perdidas.");
    if (!confirmed) return;
    const ok = await saveHeroSlides(DEFAULT_HERO_SLIDES);
    if (ok) showToast("Slides restaurados!");
  }

  async function loadOrders() {
    setIsLoadingOrders(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      showToast(`Erro ao carregar pedidos: ${error.message}`, "error");
    } else {
      setOrders(data || []);
    }
    setIsLoadingOrders(false);
  }

  async function updateOrderStatus(id, status) {
    const prevOrder = orders.find((o) => o.id === id);
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) { showToast("Erro ao atualizar pedido", "error"); return; }
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));

    const shouldDecrement = status === "novo" && prevOrder?.status !== "novo";
    const shouldRestore = status === "cancelado" && ["novo", "em_separacao", "enviado"].includes(prevOrder?.status);

    if (shouldDecrement || shouldRestore) {
      const items = prevOrder?.items || [];
      const ids = items.map((i) => i.id);
      const { data: currentProducts } = await supabase.from("products").select("id, stock").in("id", ids);
      if (currentProducts) {
        const stockMap = Object.fromEntries(currentProducts.map((p) => [p.id, p.stock || 0]));
        for (const item of items) {
          const current = stockMap[item.id] ?? 0;
          const next = shouldDecrement
            ? Math.max(0, current - item.quantity)
            : current + item.quantity;
          await supabase.from("products").update({ stock: next }).eq("id", item.id);
        }
      }
      await loadProducts();
      showToast(
        shouldDecrement
          ? "✅ Pedido confirmado — estoque atualizado!"
          : "↩️ Pedido cancelado — estoque devolvido.",
        shouldDecrement ? "success" : "info"
      );
    }
  }

  async function clearFinishedOrders() {
    const ok = await askConfirm("Limpar pedidos finalizados?", "Pedidos concluídos, cancelados e aguardando serão excluídos.");
    if (!ok) return;
    const { error } = await supabase.from("orders")
      .delete().in("status", ["concluido", "cancelado", "aguardando"]);
    if (error) { showToast("Erro ao limpar pedidos", "error"); }
    else { showToast("Pedidos removidos!"); loadOrders(); }
  }

  async function clearAllOrders() {
    const ok = await askConfirm("Excluir TODOS os pedidos?", "Esta ação não pode ser desfeita. Todos os pedidos serão perdidos permanentemente.");
    if (!ok) return;
    const { error } = await supabase.from("orders").delete().neq("id", 0);
    if (error) { showToast("Erro ao limpar pedidos", "error"); }
    else { showToast("Todos os pedidos foram removidos!"); setOrders([]); }
  }

  async function updateOrderNotes(id, notes) {
    await supabase.from("orders").update({ notes }).eq("id", id);
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, notes } : o));
  }

  async function toggleIsNew(product) {
    const { error } = await supabase.from("products")
      .update({ is_new: !product.is_new }).eq("id", product.id);
    if (error) { showToast("Erro ao atualizar badge Novo", "error"); }
    else { setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_new: !p.is_new } : p)); }
  }

  async function savePromoSettings() {
    const errors = await Promise.all([
      saveSetting("promotions_active", promoActive),
      saveSetting("promotions_title", promoTitle),
      saveSetting("promotions_start", promoStart || null),
      saveSetting("promotions_end",   promoEnd   || null),
    ]);
    if (errors.some(Boolean)) {
      showToast("Erro ao salvar promoções", "error");
    } else {
      showToast(promoActive ? "Banner de promoções ativado!" : "Banner de promoções desativado!");
    }
  }

  async function saveWhatsAppSettings() {
    const errors = await Promise.all([
      saveSetting("wa_orders", waOrders),
      saveSetting("wa_support", waSupport),
      saveSetting("wa_footer", waFooter),
    ]);
    if (errors.some(Boolean)) {
      showToast("Erro ao salvar números", "error");
    } else {
      showToast("Números de WhatsApp salvos!");
    }
  }

  async function duplicateProduct(product) {
    const { id, created_at, sort_order, ...rest } = product;
    const { error } = await supabase.from("products").insert([{
      ...rest,
      name: `${product.name} (Cópia)`,
      is_new: false,
      stock: 0,
    }]);
    if (error) { showToast("Erro ao duplicar produto", "error"); }
    else { showToast(`"${product.name}" duplicado!`); loadProducts(); }
  }

  async function saveProductOrder(orderedList) {
    await Promise.all(
      orderedList.map((p, i) =>
        supabase.from("products").update({ sort_order: i + 1 }).eq("id", p.id)
      )
    );
  }

  function handleProductDrop(targetId) {
    if (dragSrcId === null || dragSrcId === targetId) { setDragSrcId(null); return; }
    const srcIdx = products.findIndex((p) => p.id === dragSrcId);
    const tgtIdx = products.findIndex((p) => p.id === targetId);
    const reordered = [...products];
    const [moved] = reordered.splice(srcIdx, 1);
    reordered.splice(tgtIdx, 0, moved);
    setProducts(reordered);
    saveProductOrder(reordered);
    setDragSrcId(null);
  }

  function exportOrdersCSV() {
    const filtered = orders
      .filter((o) => orderStatusFilter === "todos" || o.status === orderStatusFilter)
      .filter((o) => {
        const date = new Date(o.created_at);
        if (orderDateFrom && date < new Date(orderDateFrom)) return false;
        if (orderDateTo && date > new Date(orderDateTo + "T23:59:59")) return false;
        if (orderMinValue && Number(o.total) < parseFloat(orderMinValue)) return false;
        return true;
      });

    const rows = [
      ["ID", "Data", "Status", "Total (R$)", "Produtos"],
      ...filtered.map((o) => [
        o.id,
        new Date(o.created_at).toLocaleString("pt-BR"),
        ORDER_STATUSES.find((s) => s.value === o.status)?.label.replace(/[^\w\sÀ-ú]/g, "").trim() || o.status,
        Number(o.total).toFixed(2).replace(".", ","),
        (o.items || []).map((i) => `${i.name} x${i.quantity}`).join(" | "),
      ]),
    ];

    const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-ga-brasil-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    if (parseFloat(newProduct.discount) > 0) {
      setNewProduct((p) => ({ ...p, tag: "Promoção" }));
    } else if (newProduct.tag === "Promoção") {
      setNewProduct((p) => ({ ...p, tag: "" }));
    }
  }, [newProduct.discount]);

  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) => [payload.new, ...prev]);
        showToast("📲 Cliente abriu o WhatsApp para finalizar um pedido!", "success");
        playNotificationSound();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();
    supabase.from("settings").select("key, value").then(({ data }) => {
      if (!data) return;
      data.forEach(({ key, value }) => {
        if (key === "hero_slides" && Array.isArray(value) && value.length > 0) setHeroSlides(value);
        if (key === "wa_orders" && value) setWaOrders(value);
        if (key === "wa_support" && value) setWaSupport(value);
        if (key === "wa_footer" && value) setWaFooter(value);
        if (key === "promotions_active") setPromoActive(!!value);
        if (key === "promotions_title" && value) setPromoTitle(value);
        if (key === "promotions_start") setPromoStart(value || "");
        if (key === "promotions_end")   setPromoEnd(value || "");
      });
    });
  }, []);

  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const featuredCount = products.filter((p) => p.featured).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  // Orders report
  const activeOrders = orders.filter((o) => o.status !== "cancelado" && o.status !== "aguardando");
  const totalRevenue = activeOrders.reduce((s, o) => s + Number(o.total || 0), 0);
  const orderCountByStatus = ORDER_STATUSES.reduce((acc, s) => {
    acc[s.value] = orders.filter((o) => o.status === s.value).length;
    return acc;
  }, {});
  const topProducts = Object.values(
    orders.flatMap((o) => o.items || []).reduce((acc, item) => {
      const key = item.name;
      if (!acc[key]) acc[key] = { name: item.name, qty: 0 };
      acc[key].qty += item.quantity;
      return acc;
    }, {})
  ).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Orders with filters applied
  const displayedOrders = orders
    .filter((o) => orderStatusFilter === "todos" || o.status === orderStatusFilter)
    .filter((o) => {
      const date = new Date(o.created_at);
      if (orderDateFrom && date < new Date(orderDateFrom)) return false;
      if (orderDateTo && date > new Date(orderDateTo + "T23:59:59")) return false;
      if (orderMinValue && Number(o.total) < parseFloat(orderMinValue)) return false;
      return true;
    });

  // Product table filter
  const productCategories = [...new Set(products.map((p) => p.category).filter(Boolean))];
  const filteredProducts = products.filter((p) => {
    const matchSearch = !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase()) || p.brand?.toLowerCase().includes(productSearch.toLowerCase());
    const matchCat = !productCategoryFilter || p.category === productCategoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="adminDashboard">
      <Toast toast={toast} />

      <div className="adminHeader">
        <div>
          <h1>Admin <span>G.A Brasil</span></h1>
          <p>{products.length} produtos cadastrados</p>
        </div>
        <button className="adminLogoutBtn" onClick={handleLogout}>Sair</button>
      </div>

      <div className="adminMetrics">
        <MetricCard label="Total de produtos" value={products.length} icon="📦" color="#6366f1" />
        <MetricCard label="Unidades em estoque" value={totalStock} icon="🏪" color="#10b981" />
        <MetricCard label="Em destaque" value={featuredCount} icon="🔥" color="#f59e0b" />
        <MetricCard label="Estoque baixo" value={lowStockCount} icon="⚠️" color="#ef4444" />
      </div>

      {/* Hero Carousel Section */}
      <div className="adminCarouselSection">
        <button className="adminSectionHeader" onClick={() => setIsCarouselOpen((o) => !o)}>
          <span>🎠 Editar carrossel principal</span>
          <span className="adminSectionToggle">{isCarouselOpen ? "▲ Fechar" : "▼ Abrir"}</span>
        </button>

        {isCarouselOpen && (
          <div className="adminCarouselBody">
            <div className="adminCarouselSlides">
              {heroSlides.map((slide, idx) => (
                <div key={idx} className="adminSlideCard">
                  <div
                    className={`adminSlideThumb ${!slide.image || slide.type === "text-only" ? "adminSlideThumbText" : ""}`}
                    style={slide.image && slide.type !== "text-only" ? { backgroundImage: `url(${slide.image})` } : {}}
                  >
                    {(!slide.image || slide.type === "text-only") && (
                      <span className="adminSlideThumbLabel">
                        {SLIDE_TYPES.find((t) => t.value === (slide.type || "split"))?.label || "Slide"}
                      </span>
                    )}
                  </div>
                  <div className="adminSlideInfo">
                    <small>{slide.eyebrow}</small>
                    <strong>{slide.title}</strong>
                    <p>{slide.description?.slice(0, 80)}{slide.description?.length > 80 ? "..." : ""}</p>
                  </div>
                  <div className="adminSlideActions">
                    <button className="editButton" onClick={() => startEditSlide(idx)}>✏️ Editar</button>
                    <button className="deleteButton" onClick={() => deleteSlide(idx)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="adminCarouselButtons">
              {heroSlides.length < 5 && (
                <button className="adminSaveBtn" onClick={() => startEditSlide(-1)}>+ Novo slide</button>
              )}
              <button className="adminCancelBtn" onClick={resetHeroSlides}>Restaurar padrão</button>
            </div>

            {editingSlideIdx !== null && (
              <div className="adminSlideForm">
                <h3>{editingSlideIdx === -1 ? "Novo slide" : `Editando slide ${editingSlideIdx + 1}`}</h3>
                <div className="adminFormGrid">
                  <div className="formGroup fullWidth">
                    <label>Tipo de slide</label>
                    <div className="slideTypeSelector">
                      {SLIDE_TYPES.map((t) => (
                        <label
                          key={t.value}
                          className={`slideTypeOption ${slideForm.type === t.value ? "active" : ""}`}
                        >
                          <input
                            type="radio"
                            name="slideType"
                            value={t.value}
                            checked={slideForm.type === t.value}
                            onChange={slideField("type")}
                          />
                          {t.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="formGroup">
                    <label>Texto pequeno (eyebrow)</label>
                    <input
                      value={slideForm.eyebrow}
                      onChange={slideField("eyebrow")}
                      placeholder="Ex: Distribuidora de Maquiagens"
                    />
                  </div>
                  <div className="formGroup fullWidth">
                    <label>Título *</label>
                    <input
                      value={slideForm.title}
                      onChange={slideField("title")}
                      placeholder="Título principal do slide"
                    />
                  </div>
                  <div className="formGroup fullWidth">
                    <label>Descrição</label>
                    <textarea
                      rows={2}
                      value={slideForm.description}
                      onChange={slideField("description")}
                      placeholder="Texto descritivo do slide"
                    />
                  </div>

                  <div className="formGroup fullWidth">
                    <label className="slideCheckboxLabel">
                      <input
                        type="checkbox"
                        checked={slideForm.showButtons !== false}
                        onChange={(e) => setSlideForm((s) => ({ ...s, showButtons: e.target.checked }))}
                      />
                      Exibir botões de ação (Ver produtos / Falar no WhatsApp)
                    </label>
                  </div>

                  {slideForm.type !== "text-only" && (
                    <div className="formGroup fullWidth">
                      <label>
                        {slideForm.type === "fullbg" ? "Imagem de fundo (ocupa o slide inteiro)" : "Imagem lateral"}
                      </label>
                      <div
                        className="imageDropZone slideDropZone"
                        onClick={() => document.getElementById("slideImageInput").click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); handleSlideImageFile(e.dataTransfer.files[0]); }}
                      >
                        {slideImagePreview
                          ? <img src={slideImagePreview} alt="preview do slide" className="dropZonePreview slidePreview" />
                          : <><span>🖼️</span><p>Clique ou arraste a imagem do slide</p></>
                        }
                      </div>
                      <input
                        id="slideImageInput"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => handleSlideImageFile(e.target.files[0])}
                      />
                    </div>
                  )}
                </div>
                <div className="adminFormActions">
                  <button className="adminSaveBtn" onClick={saveSlide}>Salvar slide</button>
                  <button className="adminCancelBtn" onClick={cancelSlideEdit}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Orders Section */}
      {/* Promotions Settings */}
      <div className="adminCarouselSection">
        <button className="adminSectionHeader" onClick={() => setIsPromoOpen((o) => !o)}>
          <span>🔥 Banner de Promoções</span>
          <span className="adminSectionToggle">{isPromoOpen ? "▲ Fechar" : "▼ Abrir"}</span>
        </button>
        {isPromoOpen && (
          <div className="adminCarouselBody">
            <div className="promoAdminStats">
              {(() => {
                const promoProducts = products.filter((p) => p.old_price > 0);
                const maxDiscount = promoProducts.reduce((max, p) => {
                  const d = Math.round(((p.old_price - p.price) / p.old_price) * 100);
                  return d > max ? d : max;
                }, 0);
                return promoProducts.length > 0 ? (
                  <p>📊 <strong>{promoProducts.length}</strong> produto(s) com desconto ativo · até <strong>{maxDiscount}%</strong> OFF</p>
                ) : (
                  <p className="promoAdminNoPromo">Nenhum produto com desconto cadastrado. Adicione um preço base e desconto nos produtos.</p>
                );
              })()}
            </div>

            <div className="adminFormGrid" style={{ marginTop: 16 }}>
              <div className="formGroup">
                <label>Título do banner</label>
                <input
                  type="text"
                  placeholder="Semana da Beleza"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                />
                <small className="formHint">Aparece no banner da página inicial</small>
              </div>

              <div className="formGroup">
                <label>Status do banner</label>
                <div className="promoToggleRow">
                  <button
                    className={`promoToggleBtn ${promoActive ? "active" : ""}`}
                    onClick={() => setPromoActive(true)}
                  >
                    ✅ Ativo
                  </button>
                  <button
                    className={`promoToggleBtn ${!promoActive ? "inactive" : ""}`}
                    onClick={() => setPromoActive(false)}
                  >
                    ⏸ Inativo
                  </button>
                </div>
                <small className="formHint">
                  {promoActive ? "Banner visível na página inicial" : "Banner oculto na página inicial"}
                </small>
              </div>
            </div>

            <div className="adminFormGrid" style={{ marginTop: 16 }}>
              <div className="formGroup">
                <label>Início da promoção</label>
                <input
                  type="date"
                  value={promoStart}
                  onChange={(e) => setPromoStart(e.target.value)}
                />
                <small className="formHint">Deixe vazio para exibir imediatamente ao ativar</small>
              </div>
              <div className="formGroup">
                <label>Fim da promoção</label>
                <input
                  type="date"
                  value={promoEnd}
                  onChange={(e) => setPromoEnd(e.target.value)}
                />
                <small className="formHint">Controla o countdown e oculta o banner automaticamente</small>
              </div>
            </div>

            {promoActive && (promoStart || promoEnd) && (
              <div className="promoScheduleStatus">
                {(() => {
                  const fmt = (d) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
                  const now = new Date();
                  now.setHours(0,0,0,0);
                  const start = promoStart ? new Date(promoStart + "T00:00:00") : null;
                  const end   = promoEnd   ? new Date(promoEnd   + "T00:00:00") : null;
                  if (start && now < start) return <span className="promoScheduleTag scheduled">🗓 Agendada — começa em {fmt(promoStart)}</span>;
                  if (end   && now > end)   return <span className="promoScheduleTag expired">⛔ Expirada em {fmt(promoEnd)}</span>;
                  if (start && end)         return <span className="promoScheduleTag running">✅ Rodando de {fmt(promoStart)} até {fmt(promoEnd)}</span>;
                  if (end)                  return <span className="promoScheduleTag running">✅ Ativa até {fmt(promoEnd)}</span>;
                  if (start)                return <span className="promoScheduleTag running">✅ Ativa desde {fmt(promoStart)}</span>;
                })()}
              </div>
            )}

            <div className="adminCarouselButtons">
              <button className="adminSaveBtn" onClick={savePromoSettings}>Salvar configurações</button>
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Settings */}
      <div className="adminCarouselSection">
        <button className="adminSectionHeader" onClick={() => setIsSettingsOpen((o) => !o)}>
          <span>📱 Configurações de WhatsApp</span>
          <span className="adminSectionToggle">{isSettingsOpen ? "▲ Fechar" : "▼ Abrir"}</span>
        </button>
        {isSettingsOpen && (
          <div className="adminCarouselBody">
            <div className="adminFormGrid" style={{ marginTop: 16 }}>
              <div className="formGroup">
                <label>Finalizar pedido (carrinho)</label>
                <div className="waInputWrapper">
                  <span className="waPrefix">+</span>
                  <input
                    type="text"
                    placeholder="5511999999999"
                    value={waOrders}
                    onChange={(e) => setWaOrders(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <small className="formHint">Usado quando o cliente clica em "Finalizar pelo WhatsApp"</small>
              </div>
              <div className="formGroup">
                <label>Atendimento / Dúvidas</label>
                <div className="waInputWrapper">
                  <span className="waPrefix">+</span>
                  <input
                    type="text"
                    placeholder="5511999999999"
                    value={waSupport}
                    onChange={(e) => setWaSupport(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <small className="formHint">Usado no botão "Pedir pelo WhatsApp" nos produtos</small>
              </div>
              <div className="formGroup">
                <label>Rodapé (footer)</label>
                <div className="waInputWrapper">
                  <span className="waPrefix">+</span>
                  <input
                    type="text"
                    placeholder="5511999999999"
                    value={waFooter}
                    onChange={(e) => setWaFooter(e.target.value.replace(/\D/g, ""))}
                  />
                </div>
                <small className="formHint">Exibido na seção de contato do rodapé</small>
              </div>
            </div>
            <div className="adminCarouselButtons">
              <button className="adminSaveBtn" onClick={saveWhatsAppSettings}>Salvar números</button>
            </div>
          </div>
        )}
      </div>

      {/* Orders Report */}
      <div className="adminReportSection">
        <div className="adminOrdersHeader" style={{ marginBottom: 16 }}>
          <div>
            <h2>📊 Relatório de pedidos</h2>
            <p>Baseado em {orders.length} pedido(s) registrados</p>
          </div>
        </div>
        <div className="reportGrid">
          <div className="reportCard">
            <span className="reportIcon">💰</span>
            <div>
              <p>Receita total</p>
              <strong>R$ {totalRevenue.toFixed(2).replace(".", ",")}</strong>
              <small>excluindo cancelados</small>
            </div>
          </div>
          <div className="reportCard">
            <span className="reportIcon">🆕</span>
            <div>
              <p>Novos</p>
              <strong>{orderCountByStatus.novo || 0}</strong>
            </div>
          </div>
          <div className="reportCard">
            <span className="reportIcon">⏳</span>
            <div>
              <p>Em andamento</p>
              <strong>{(orderCountByStatus.em_andamento || 0) + (orderCountByStatus.em_separacao || 0) + (orderCountByStatus.enviado || 0)}</strong>
            </div>
          </div>
          <div className="reportCard">
            <span className="reportIcon">✅</span>
            <div>
              <p>Concluídos</p>
              <strong>{orderCountByStatus.concluido || 0}</strong>
            </div>
          </div>
        </div>

        {topProducts.length > 0 && (
          <div className="reportTopProducts">
            <h3>🏆 Produtos mais pedidos</h3>
            <div className="topProductsList">
              {topProducts.map((p, i) => (
                <div key={p.name} className="topProductRow">
                  <span className="topProductRank">#{i + 1}</span>
                  <span className="topProductName">{p.name}</span>
                  <span className="topProductQty">{p.qty} unid.</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="adminOrdersSection">
        <div className="adminOrdersHeader">
          <div>
            <h2>📋 Pedidos</h2>
            <p>{orders.filter((o) => o.status === "novo").length} novos · {displayedOrders.length} exibidos · {orders.length} total</p>
          </div>
          <div className="ordersHeaderActions">
            {orders.length > 0 && (
              <button className="adminRefreshBtn" onClick={exportOrdersCSV} title="Exportar CSV">
                📥 Exportar CSV
              </button>
            )}
            <button className="adminRefreshBtn" onClick={loadOrders} title="Atualizar">↻ Atualizar</button>
            {orders.some((o) => ["concluido", "cancelado"].includes(o.status)) && (
              <button className="adminRefreshBtn" onClick={clearFinishedOrders} title="Limpar concluídos e cancelados">
                🗑 Limpar concluídos
              </button>
            )}
            {orders.length > 0 && (
              <button className="clearAllOrdersBtn" onClick={clearAllOrders} title="Limpar todos os pedidos">
                🗑 Limpar todos
              </button>
            )}
          </div>
        </div>

        <div className="orderExtraFilters">
          <div className="orderFilterGroup">
            <label>De</label>
            <input type="date" value={orderDateFrom} onChange={(e) => setOrderDateFrom(e.target.value)} />
          </div>
          <div className="orderFilterGroup">
            <label>Até</label>
            <input type="date" value={orderDateTo} onChange={(e) => setOrderDateTo(e.target.value)} />
          </div>
          <div className="orderFilterGroup">
            <label>Valor mín. (R$)</label>
            <input
              type="number" min="0" step="0.01" placeholder="0,00"
              value={orderMinValue}
              onChange={(e) => setOrderMinValue(e.target.value)}
            />
          </div>
          {(orderDateFrom || orderDateTo || orderMinValue) && (
            <button className="adminCancelBtn" onClick={() => { setOrderDateFrom(""); setOrderDateTo(""); setOrderMinValue(""); }}>
              Limpar filtros
            </button>
          )}
        </div>

        <div className="orderStatusFilters">
          {[{ value: "todos", label: "Todos" }, ...ORDER_STATUSES].map((s) => (
            <button
              key={s.value}
              className={`orderFilterBtn ${orderStatusFilter === s.value ? "active" : ""}`}
              onClick={() => setOrderStatusFilter(s.value)}
              style={orderStatusFilter === s.value && s.color ? { background: s.color, color: "white", borderColor: s.color } : {}}
            >
              {s.label}
            </button>
          ))}
        </div>

        {isLoadingOrders ? (
          <div className="adminLoadingRow">
            <span className="adminSpinner large" />
            <p>Carregando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="ordersEmpty">
            <span>📭</span>
            <p>Nenhum pedido ainda. Os pedidos aparecerão aqui quando os clientes finalizarem pelo WhatsApp.</p>
          </div>
        ) : (
          <div className="ordersList">
            {displayedOrders.length === 0 ? (
              <div className="ordersEmpty">
                <span>🔍</span>
                <p>Nenhum pedido encontrado com os filtros aplicados.</p>
              </div>
            ) : null}
            {displayedOrders.map((order) => {
                const statusInfo = ORDER_STATUSES.find((s) => s.value === order.status) || ORDER_STATUSES[0];
                const isExpanded = expandedOrderId === order.id;
                const date = new Date(order.created_at);
                const dateStr = date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

                return (
                  <div key={order.id} className={`orderCard ${order.status}`}>
                    <div className="orderCardTop" onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
                      <div className="orderIdDate">
                        <strong>#{order.id}</strong>
                        <small>{dateStr}</small>
                      </div>

                      <div className="orderSummary">
                        <span>{order.items?.length || 0} produto(s)</span>
                        <strong>R$ {Number(order.total).toFixed(2).replace(".", ",")}</strong>
                      </div>

                      <span
                        className="orderStatusBadge"
                        style={{ background: statusInfo.color + "20", color: statusInfo.color, borderColor: statusInfo.color + "40" }}
                      >
                        {statusInfo.label}
                      </span>

                      <span className="orderExpandArrow">{isExpanded ? "▲" : "▼"}</span>
                    </div>

                    {isExpanded && (
                      <div className="orderCardBody">
                        {order.status === "aguardando" && (
                          <div className="orderAwaitingBanner">
                            <p>Cliente abriu o WhatsApp mas ainda não confirmou. Confirme quando receber a mensagem ou descarte se não chegar.</p>
                            <div className="orderAwaitingActions">
                              <button className="orderConfirmBtn" onClick={() => updateOrderStatus(order.id, "novo")}>
                                ✅ Recebi a mensagem — confirmar pedido
                              </button>
                              <button className="orderDiscardBtn" onClick={() => updateOrderStatus(order.id, "cancelado")}>
                                🗑️ Descartar
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="orderItems">
                          {(order.items || []).map((item, i) => (
                            <div key={i} className="orderItemRow">
                              <span className="orderItemName">{item.name}</span>
                              <span className="orderItemBrand">{item.brand}</span>
                              <span className="orderItemQty">×{item.quantity}</span>
                              <span className="orderItemPrice">R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                            </div>
                          ))}
                        </div>

                        <div className="orderCardActions">
                          <div className="orderStatusChange">
                            <label>Alterar status:</label>
                            <div className="orderStatusButtons">
                              {ORDER_STATUSES.map((s) => (
                                <button
                                  key={s.value}
                                  className={`orderStatusBtn ${order.status === s.value ? "current" : ""}`}
                                  style={order.status === s.value ? { background: s.color, color: "white" } : { borderColor: s.color, color: s.color }}
                                  onClick={() => updateOrderStatus(order.id, s.value)}
                                >
                                  {s.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="orderNotes">
                            <label>Observações internas:</label>
                            <textarea
                              rows={2}
                              defaultValue={order.notes || ""}
                              placeholder="Anote algo sobre este pedido..."
                              onBlur={(e) => updateOrderNotes(order.id, e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <div className="adminBody">
        <div className="adminFormSection">
          <div className="adminFormCard">
            <h2>{editingProductId ? "✏️ Editando produto" : "➕ Novo produto"}</h2>

            <form onSubmit={handleSubmit} className="adminForm">
              <div className="adminFormGrid">
                <div className="formGroup fullWidth">
                  <label>Nome do produto</label>
                  <input
                    placeholder="Ex: Base Líquida Matte"
                    value={newProduct.name}
                    onChange={field("name")}
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>Marca</label>
                  <input placeholder="Ex: Max Love" value={newProduct.brand} onChange={field("brand")} />
                </div>

                <div className="formGroup">
                  <label>Categoria</label>
                  <input
                    placeholder="Ex: Bases"
                    value={newProduct.category}
                    onChange={field("category")}
                    list="categoryOptions"
                  />
                  <datalist id="categoryOptions">
                    {productCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div className="formGroup">
                  <label>Preço base (R$)</label>
                  <input
                    type="number" step="0.01" min="0" placeholder="0,00"
                    value={newProduct.price}
                    onChange={field("price")}
                    required
                  />
                </div>

                <div className="formGroup">
                  <label>Desconto (%)</label>
                  <div className="discountInputWrapper">
                    <input
                      type="number" step="1" min="0" max="99"
                      placeholder="0"
                      value={newProduct.discount}
                      onChange={field("discount")}
                    />
                    {newProduct.price && parseFloat(newProduct.discount) > 0 && (
                      <span className="discountCalc">
                        → R$ {(parseFloat(newProduct.price) * (1 - parseFloat(newProduct.discount) / 100)).toFixed(2).replace(".", ",")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="formGroup">
                  <label>Parcelamento</label>
                  <input
                    placeholder="Ex: 3x de R$ 4,30"
                    value={newProduct.installment}
                    onChange={field("installment")}
                  />
                </div>

                <div className="formGroup">
                  <label>Estoque inicial</label>
                  <input type="number" min="0" placeholder="0" value={newProduct.stock} onChange={field("stock")} />
                </div>

                <div className="formGroup">
                  <label>Tag</label>
                  <select value={newProduct.tag} onChange={field("tag")}>
                    <option value="">Sem tag</option>
                    {PRODUCT_TAGS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="formGroup fullWidth">
                  <label>Descrição</label>
                  <textarea
                    rows={3}
                    placeholder="Descreva o produto..."
                    value={newProduct.description}
                    onChange={field("description")}
                  />
                </div>

                <div className="formGroup fullWidth formToggles">
                  <label className="toggleLabel">
                    <input type="checkbox" checked={newProduct.featured} onChange={field("featured")} />
                    <span className="toggleTrack"><span className="toggleThumb" /></span>
                    🔥 Mais vendido / Destaque
                  </label>
                </div>

                <div className="formGroup fullWidth">
                  <label>Imagem principal</label>
                  <div
                    className="imageDropZone"
                    onClick={() => document.getElementById("mainImageInput").click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleImageFile(e.dataTransfer.files[0]); }}
                  >
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" className="dropZonePreview" />
                      : <><span>📷</span><p>Clique ou arraste uma imagem</p></>
                    }
                  </div>
                  <input
                    id="mainImageInput" type="file" accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => handleImageFile(e.target.files[0])}
                  />
                </div>

                <div className="formGroup fullWidth">
                  <label>Galeria de imagens</label>
                  <div
                    className="imageDropZone galleryDrop"
                    onClick={() => document.getElementById("galleryInput").click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); setGalleryFiles(Array.from(e.dataTransfer.files)); }}
                  >
                    {galleryFiles.length > 0
                      ? <div className="galleryThumbRow">
                          {galleryFiles.map((f, i) => (
                            <img key={i} src={URL.createObjectURL(f)} alt={`g${i}`} />
                          ))}
                        </div>
                      : <><span>🖼️</span><p>Clique ou arraste múltiplas imagens</p></>
                    }
                  </div>
                  <input
                    id="galleryInput" type="file" accept="image/*" multiple
                    style={{ display: "none" }}
                    onChange={(e) => setGalleryFiles(Array.from(e.target.files))}
                  />
                </div>
              </div>

              <div className="adminFormActions">
                <button type="submit" className="adminSaveBtn" disabled={isSaving}>
                  {isSaving ? <span className="adminSpinner" /> : null}
                  {isSaving ? "Salvando..." : editingProductId ? "Salvar alterações" : "Cadastrar produto"}
                </button>
                {editingProductId && (
                  <button type="button" className="adminCancelBtn" onClick={resetForm}>
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <LivePreview product={newProduct} imagePreview={imagePreview} />
      </div>

      <div className="adminTableCard">
        <div className="adminTableHeader">
          <h2>Produtos cadastrados</h2>
          <div className="productTableFilters">
            <input
              type="text"
              placeholder="Buscar por nome ou marca..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="productSearchInput"
            />
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="productCategorySelect"
            >
              <option value="">Todas as categorias</option>
              {productCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {(productSearch || productCategoryFilter) && (
              <button
                className="adminCancelBtn"
                onClick={() => { setProductSearch(""); setProductCategoryFilter(""); }}
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="adminLoadingRow">
            <span className="adminSpinner large" />
            <p>Carregando produtos...</p>
          </div>
        ) : (
          <div className="adminTableWrapper">
            <table className="adminTable">
              <thead>
                <tr>
                  <th title="Arraste para reordenar" style={{ width: 32 }}>⠿</th>
                  <th>Imagem</th>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Categoria</th>
                  <th>Estoque</th>
                  <th>Novo</th>
                  <th>Destaque</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Nenhum produto encontrado</td></tr>
                )}
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    draggable={!productSearch && !productCategoryFilter}
                    onDragStart={() => setDragSrcId(product.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleProductDrop(product.id)}
                    onDragEnd={() => setDragSrcId(null)}
                    style={dragSrcId === product.id ? { opacity: 0.4 } : {}}
                  >
                    <td
                      className="dragHandle adminColDrag"
                      title={productSearch || productCategoryFilter ? "Limpe os filtros para reordenar" : "Arraste para reordenar"}
                      style={{ cursor: productSearch || productCategoryFilter ? "not-allowed" : "grab", color: "#94a3b8", textAlign: "center", fontSize: 18 }}
                    >
                      ⠿
                    </td>
                    <td className="adminColImage">
                      <img src={product.image} alt={product.name} className="adminThumb" />
                    </td>
                    <td className="adminColName">
                      <strong>{product.name}</strong>
                      <small>{product.brand}</small>
                    </td>
                    <td className="adminColPrice">R$ {Number(product.price).toFixed(2).replace(".", ",")}</td>
                    <td className="adminColCategory"><span className="adminCategoryPill">{product.category}</span></td>
                    <td className="adminColStock">
                      {stockEditId === product.id ? (
                        <div className="stockAdjustForm">
                          <input
                            type="number" min="1"
                            value={stockDelta}
                            onChange={(e) => setStockDelta(e.target.value)}
                            className="stockDeltaInput"
                            autoFocus
                          />
                          <div className="stockAdjustButtons">
                            <button className="stockAddBtn" onClick={() => applyStockAdjust(product, "add")}>
                              + Adicionar
                            </button>
                            <button className="stockRemoveBtn" onClick={() => applyStockAdjust(product, "remove")}>
                              − Remover
                            </button>
                            <button className="stockCancelBtn" onClick={() => setStockEditId(null)}>✕</button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="stockDisplay"
                          onClick={() => { setStockEditId(product.id); setStockDelta("1"); }}
                          title="Clique para ajustar estoque"
                        >
                          <span className={product.stock <= 5 ? "lowStock" : ""}>{product.stock}</span>
                          <span className="stockEditHint">✏️</span>
                        </div>
                      )}
                    </td>
                    <td className="adminColNew">
                      <button
                        className={`featuredToggle ${product.is_new ? "active" : ""}`}
                        onClick={() => toggleIsNew(product)}
                        title={product.is_new ? "Remover badge Novo" : "Marcar como Novo"}
                        aria-label={product.is_new ? "Remover badge Novo" : "Marcar como Novo"}
                        style={product.is_new ? { background: "#eff6ff", borderColor: "#3b82f6", color: "#1d4ed8" } : {}}
                      >
                        {product.is_new ? "✨ Sim" : "— Não"}
                      </button>
                    </td>
                    <td className="adminColFeatured">
                      <button
                        className={`featuredToggle ${product.featured ? "active" : ""}`}
                        onClick={() => toggleFeatured(product)}
                        title={product.featured ? "Remover destaque" : "Marcar como destaque"}
                        aria-label={product.featured ? "Remover destaque" : "Marcar como destaque"}
                      >
                        {product.featured ? "🔥 Sim" : "— Não"}
                      </button>
                    </td>
                    <td className="adminColActions">
                      <div className="adminActions">
                        <button className="editButton" aria-label={`Editar ${product.name}`} onClick={() => startEdit(product)}>✏️ Editar</button>
                        <button className="duplicateButton" aria-label={`Duplicar ${product.name}`} onClick={() => duplicateProduct(product)}>⧉ Duplicar</button>
                        <button className="deleteButton" aria-label={`Excluir ${product.name}`} onClick={() => deleteProduct(product.id, product.name)}>🗑 Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmModal && (
        <div className="confirmModalBackdrop" onClick={() => { confirmModal.resolve(false); setConfirmModal(null); }}>
          <div className="confirmModal" onClick={(e) => e.stopPropagation()}>
            <p className="confirmModalMessage">{confirmModal.message}</p>
            {confirmModal.description && (
              <p className="confirmModalDesc">{confirmModal.description}</p>
            )}
            <div className="confirmModalActions">
              <button
                className="confirmModalCancel"
                onClick={() => { confirmModal.resolve(false); setConfirmModal(null); }}
              >
                Cancelar
              </button>
              <button
                className="confirmModalConfirm"
                onClick={() => { confirmModal.resolve(true); setConfirmModal(null); }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
