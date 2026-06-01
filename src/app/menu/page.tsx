'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  Coffee, 
  Snowflake, 
  CupSoda, 
  Utensils, 
  Cookie, 
  Sparkles, 
  ArrowUpDown, 
  X,
  Heart,
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  ClipboardList
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import menuData from '@/data/menu.json';
import { MenuItem, KategoriMenu } from '@/types/menu';

const categoryTabs = [
  { id: 'semua', label: 'Semua', icon: LayoutGrid },
  { id: 'kopi_panas', label: 'Kopi Panas', icon: Coffee },
  { id: 'kopi_dingin', label: 'Kopi Dingin', icon: Snowflake },
  { id: 'non_kopi', label: 'Non-Kopi', icon: CupSoda },
  { id: 'makanan_berat', label: 'Makanan', icon: Utensils },
  { id: 'snack', label: 'Snack', icon: Cookie },
];

const sortOptions = [
  { id: 'default', label: 'Rekomendasi' },
  { id: 'harga-asc', label: 'Harga Terendah' },
  { id: 'harga-desc', label: 'Harga Tertinggi' },
  { id: 'manis-desc', label: 'Paling Manis' },
  { id: 'kopi-desc', label: 'Kopi Terkuat' },
  { id: 'asam-desc', label: 'Segar & Asam' },
];

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [sortBy, setSortBy] = useState<string>('default');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Advanced Filters
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);

  // Shopping Cart & Checkout State
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderSuccessDetails, setOrderSuccessDetails] = useState<{
    name: string;
    table: string;
    items: Array<{ nama: string; qty: number; harga: number }>;
    total: number;
  } | null>(null);

  // Cart operations
  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (!next[itemId]) return prev;
      if (next[itemId] <= 1) {
        delete next[itemId];
      } else {
        next[itemId]--;
      }
      return next;
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const cartTotalItems = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const cartTotalPrice = useMemo(() => {
    return Object.entries(cart).reduce((sum, [itemId, qty]) => {
      const item = menuData.find(m => m.id === itemId);
      return sum + (item ? item.harga * qty : 0);
    }, 0);
  }, [cart]);

  const handleCheckout = () => {
    const errors: Record<string, string> = {};
    if (!customerName.trim()) {
      errors.name = 'Nama pemesan wajib diisi';
    }
    if (!tableNumber) {
      errors.table = 'Nomor meja wajib dipilih';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Compile items for details screen
    const itemsList = Object.entries(cart).map(([itemId, qty]) => {
      const item = menuData.find(m => m.id === itemId);
      return {
        nama: item ? item.nama : 'Menu',
        qty,
        harga: item ? item.harga : 0
      };
    }).filter(i => i.qty > 0);

    // Store details for success screen
    setOrderSuccessDetails({
      name: customerName.trim(),
      table: tableNumber,
      items: itemsList,
      total: cartTotalPrice
    });

    // Reset state & close modal
    setCart({});
    setCustomerName('');
    setTableNumber('');
    setOrderNotes('');
    setIsCartOpen(false);
  };

  const filteredAndSortedMenu = useMemo(() => {
    let items = [...menuData] as MenuItem[];

    // 1. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) => 
          item.nama.toLowerCase().includes(query) || 
          item.deskripsi.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'semua') {
      items = items.filter((item) => item.kategori === selectedCategory);
    }

    // 3. Status Filters
    if (onlyFavorites) {
      items = items.filter((item) => item.is_favorit);
    }
    if (onlyNew) {
      items = items.filter((item) => item.is_baru);
    }

    // 4. Sort
    items.sort((a, b) => {
      if (sortBy === 'harga-asc') return a.harga - b.harga;
      if (sortBy === 'harga-desc') return b.harga - a.harga;
      if (sortBy === 'manis-desc') return b.rating.manis - a.rating.manis;
      if (sortBy === 'kopi-desc') return b.rating.kekuatan_kopi - a.rating.kekuatan_kopi;
      if (sortBy === 'asam-desc') return b.rating.asam - a.rating.asam;
      
      // Default: Favorit & Baru first, then alphabetical
      if (a.is_favorit && !b.is_favorit) return -1;
      if (!a.is_favorit && b.is_favorit) return 1;
      if (a.is_baru && !b.is_baru) return -1;
      if (!a.is_baru && b.is_baru) return 1;
      return a.nama.localeCompare(b.nama);
    });

    return items;
  }, [searchQuery, selectedCategory, sortBy, onlyFavorites, onlyNew]);

  // Helper to format currency
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Helper to render premium food category visual backdrops
  const renderItemMockup = (item: MenuItem) => {
    let bgColor = '#FEF3C7'; // default kopi panas
    let iconColor = '#C2660A';
    let IconComponent = Coffee;

    if (item.kategori === 'kopi_panas') {
      bgColor = '#FEF3C7';
      iconColor = '#C2660A';
      IconComponent = Coffee;
    } else if (item.kategori === 'kopi_dingin') {
      bgColor = '#DBEAFE';
      iconColor = '#1D4ED8';
      IconComponent = Snowflake;
    } else if (item.kategori === 'non_kopi') {
      bgColor = '#DCFCE7';
      iconColor = '#15803D';
      IconComponent = CupSoda;
    } else if (item.kategori === 'makanan_berat') {
      bgColor = '#FEE2E2';
      iconColor = '#DC2626';
      IconComponent = Utensils;
    } else if (item.kategori === 'snack') {
      bgColor = '#F3E8FF';
      iconColor = '#7C3AED';
      IconComponent = Cookie;
    }

    return (
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 14,
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <IconComponent size={34} color={iconColor} strokeWidth={1.8} />
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .floating-cart-bar {
          position: fixed !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: calc(100% - 32px) !important;
          max-width: 358px !important;
          background: var(--color-primary) !important;
          color: white !important;
          border-radius: var(--radius-lg) !important;
          padding: 12px 16px !important;
          box-shadow: var(--shadow-float) !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          z-index: 45 !important;
          bottom: calc(76px + env(safe-area-inset-bottom, 16px)) !important;
          transition: all var(--transition-normal) !important;
          animation: cartFadeUp 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }

        @media (min-width: 768px) {
          .floating-cart-bar {
            bottom: 24px !important;
            max-width: 500px !important;
            width: calc(100% - 48px) !important;
          }
        }

        .cart-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(28, 25, 23, 0.6) !important;
          backdrop-filter: blur(6px) !important;
          z-index: var(--z-modal) !important;
          display: flex !important;
          justify-content: center !important;
          align-items: flex-end !important;
          animation: cartFadeIn 250ms ease-out forwards !important;
        }

        .cart-drawer {
          background: var(--color-bg) !important;
          border-top-left-radius: var(--radius-xl) !important;
          border-top-right-radius: var(--radius-xl) !important;
          width: 100% !important;
          max-width: 500px !important;
          max-height: 85vh !important;
          display: flex !important;
          flex-direction: column !important;
          box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.15) !important;
          animation: cartSlideUp 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
        }

        @media (min-width: 768px) {
          .cart-overlay {
            align-items: center !important;
            padding: 24px !important;
          }
          .cart-drawer {
            border-radius: var(--radius-xl) !important;
            max-height: 90vh !important;
            height: auto !important;
          }
        }
      ` }} />
      {/* ── Sticky Header & Toolbar ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(250, 250, 247, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border-light)',
        padding: '16px 0 12px',
      }}>
        <div style={{ margin: '0 auto', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
          {/* Top title and back button */}
          <div style={{ display: 'flex', alignItems: 'center', justify_content: 'space-between', marginBottom: 16, padding: '0 16px' }}>
            <Link href="/" style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'white',
              border: '1px solid #E7E5E4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#57534E',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}>
              <ChevronLeft size={20} strokeWidth={2.5} color="#57534E" />
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="/smart-coffee.svg" alt="Logo" style={{ height: 28, width: 'auto' }} />
              <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                Smart QR Menu
              </h1>
            </div>

            <div style={{ width: 44 }} /> {/* spacer */}
          </div>

          {/* Search & Sort & Filter Row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, padding: '0 16px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A8A29E', display: 'flex', zIndex: 10 }}>
                <Search size={16} color="#A8A29E" />
              </span>
              <input 
                type="text" 
                placeholder="Cari kopi, makanan, rasa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: 36,
                  paddingRight: searchQuery ? 32 : 12,
                  height: 48,
                  border: '1px solid #E7E5E4',
                  background: '#F5F5F0',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: 'var(--color-text-primary)',
                  outline: 'none',
                  boxShadow: 'none',
                }}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 4,
                    zIndex: 10
                  }}
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Filter options trigger */}
            <button 
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 10,
                border: '1px solid #E7E5E4',
                background: '#F5F5F0',
                color: '#57534E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <SlidersHorizontal size={18} strokeWidth={2} color="#57534E" />
            </button>
          </div>

          {/* Category Pills (Horizontal Scroll) Wrapper */}
          <div style={{ width: '100%', overflow: 'hidden', minWidth: 0 }}>
            <div className="filter-scroll" style={{
              display: 'flex',
              overflowX: 'auto',
              width: '100%',
              maxWidth: '100%',
              gap: '8px',
              padding: '0 16px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}>
              {categoryTabs.map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: isSelected ? '#C2660A' : 'white',
                      color: isSelected ? 'white' : '#57534E',
                      border: isSelected ? '1px solid #C2660A' : '1px solid #E7E5E4',
                      borderRadius: 10,
                      padding: '7px 13px',
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <TabIcon size={13} strokeWidth={isSelected ? 2.5 : 2} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Advanced Filter & Sort Tray ── */}
      <div 
        style={{
          background: 'var(--color-bg)',
          borderBottom: isFilterPanelOpen ? '1px solid var(--color-border)' : '0px solid transparent',
          boxShadow: isFilterPanelOpen ? '0 8px 24px rgba(0, 0, 0, 0.04)' : 'none',
          overflow: 'hidden',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: isFilterPanelOpen ? 250 : 0,
          opacity: isFilterPanelOpen ? 1 : 0,
          transform: isFilterPanelOpen ? 'translateY(0)' : 'translateY(-10px)',
          pointerEvents: isFilterPanelOpen ? 'auto' : 'none',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Sort row */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px' }}>
              <ArrowUpDown size={14} color="#C2660A" /> Urutkan Berdasarkan
            </div>
            <div style={{ width: '100%', overflow: 'hidden', minWidth: 0 }}>
              <div className="filter-scroll" style={{
                display: 'flex',
                overflowX: 'auto',
                width: '100%',
                maxWidth: '100%',
                gap: '8px',
                padding: '0 16px 4px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}>
                {sortOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    style={{
                      background: sortBy === opt.id ? '#C2660A' : 'white',
                      color: sortBy === opt.id ? 'white' : '#57534E',
                      border: sortBy === opt.id ? '1px solid #C2660A' : '1px solid #E7E5E4',
                      borderRadius: 10,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick toggle options */}
          <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--color-border-light)', paddingTop: 12, paddingLeft: 16, paddingRight: 16 }}>
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: onlyFavorites ? '#FEE2E2' : '#F5F5F0',
                color: onlyFavorites ? '#DC2626' : '#57534E',
                border: onlyFavorites ? '1px solid #DC2626' : '1px solid #E7E5E4',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Heart size={14} fill={onlyFavorites ? '#DC2626' : 'none'} />
              Menu Terpopuler
            </button>

            <button
              onClick={() => setOnlyNew(!onlyNew)}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: onlyNew ? '#DCFCE7' : '#F5F5F0',
                color: onlyNew ? '#15803D' : '#57534E',
                border: onlyNew ? '1px solid #15803D' : '1px solid #E7E5E4',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Sparkles size={14} />
              Menu Baru
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Menu List ── */}
      <main className="menu-items-grid">
        {filteredAndSortedMenu.length > 0 ? (
          filteredAndSortedMenu.map((item, index) => {
            // Apply delay up to 5 items to keep staggering fast and snappy
            const staggerDelayClass = 
              index === 0 ? 'delay-75' : 
              index === 1 ? 'delay-150' : 
              index === 2 ? 'delay-225' : 
              index === 3 ? 'delay-300' : 'delay-375';

            return (
              <div 
                key={item.id}
                className={`animate-fade-in-up ${staggerDelayClass}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                  opacity: item.tersedia ? 1 : 0.6,
                  background: 'white',
                  border: '0.5px solid #E7E5E4',
                  borderRadius: '16px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
              >
                
                {/* 1. Header Area: Mockup + Info */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  {renderItemMockup(item)}

                  {/* Title & Badges */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
                      {item.is_favorit && <span className="badge-favorit">Terpopuler</span>}
                      {item.is_baru && <span className="badge-baru">Menu Baru</span>}
                      {!item.tersedia && (
                        <span style={{
                          background: 'oklch(0.9 0 0)',
                          color: 'var(--color-muted)',
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          border: '1px solid oklch(0.8 0 0)'
                        }}>
                          Habis
                        </span>
                      )}
                    </div>

                    <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 2 }}>
                      {item.nama}
                    </h2>
                    
                    <span style={{ fontSize: 14, fontWeight: 750, color: 'var(--color-primary)' }}>
                      {formatRupiah(item.harga)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ 
                  fontSize: 12.5, 
                  color: 'var(--color-text-secondary)', 
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  {item.deskripsi}
                </p>

                {/* 2. Visual RatingBars (Manis, Kopi, Asam) */}
                <div style={{ 
                  background: 'oklch(0.985 0.002 75)', 
                  borderRadius: 12, 
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  border: '1px solid var(--color-border-light)'
                }}>
                  {/* Sweetness bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, width: 44, color: 'var(--color-text-secondary)' }}>Manis</span>
                    <div style={{ flex: 1, height: 6, background: 'oklch(0.93 0.005 75)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${item.rating.manis * 10}%`,
                        height: '100%',
                        background: 'var(--color-rating-manis)',
                        borderRadius: 'var(--radius-pill)'
                      }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, width: 28, textAlign: 'right', color: 'var(--color-muted)' }}>
                      {item.rating.manis}/10
                    </span>
                  </div>

                  {/* Coffee strength bar (Only render if > 0 or if coffee category) */}
                  {item.rating.kekuatan_kopi > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, width: 44, color: 'var(--color-text-secondary)' }}>Kopi</span>
                      <div style={{ flex: 1, height: 6, background: 'oklch(0.93 0.005 75)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${item.rating.kekuatan_kopi * 10}%`,
                          height: '100%',
                          background: 'var(--color-rating-kopi)',
                          borderRadius: 'var(--radius-pill)'
                        }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, width: 28, textAlign: 'right', color: 'var(--color-muted)' }}>
                        {item.rating.kekuatan_kopi}/10
                      </span>
                    </div>
                  )}

                  {/* Acidity bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, width: 44, color: 'var(--color-text-secondary)' }}>Asam</span>
                    <div style={{ flex: 1, height: 6, background: 'oklch(0.93 0.005 75)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${item.rating.asam * 10}%`,
                        height: '100%',
                        background: 'var(--color-rating-asam)',
                        borderRadius: 'var(--radius-pill)'
                      }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, width: 28, textAlign: 'right', color: 'var(--color-muted)' }}>
                      {item.rating.asam}/10
                    </span>
                  </div>
                </div>

                {/* 3. Tags & Actions Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto',
                  gap: 8,
                  paddingTop: 8,
                  borderTop: '1px solid var(--color-border-light)'
                }}>
                  {/* Tags list (flexible wrap) */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, flex: 1 }}>
                    {item.tags.slice(0, 2).map((tag) => (
                      <span 
                        key={tag} 
                        style={{
                          background: '#F5F5F0',
                          borderRadius: '999px',
                          padding: '3px 8px',
                          fontSize: '10px',
                          color: '#78716C',
                          fontWeight: 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Cart Actions */}
                  {item.tersedia ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {cart[item.id] ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: 'white',
                          border: '1px solid var(--color-primary)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          height: '32px'
                        }}>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                              border: 'none',
                              background: 'none',
                              padding: '0 8px',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: 'var(--color-primary)',
                            }}
                          >
                            <Minus size={14} strokeWidth={2.5} />
                          </button>
                          <span style={{
                            padding: '0 4px',
                            minWidth: '24px',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: 'var(--color-text-primary)'
                          }}>
                            {cart[item.id]}
                          </span>
                          <button
                            onClick={() => addToCart(item.id)}
                            style={{
                              border: 'none',
                              background: 'none',
                              padding: '0 8px',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: 'var(--color-primary)',
                            }}
                          >
                            <Plus size={14} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item.id)}
                          style={{
                            background: 'white',
                            border: '1px solid var(--color-primary)',
                            color: 'var(--color-primary)',
                            borderRadius: '8px',
                            padding: '0 12px',
                            height: '32px',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Plus size={12} strokeWidth={3} />
                          <span>Tambah</span>
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        ) : (
          /* Empty state */
          <div 
            className="animate-fade-in-up"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              borderRadius: 20,
              border: '1.5px dashed var(--color-border)',
              marginTop: 20
            }}
          >
            <div style={{ fontSize: 44, marginBottom: 12 }}>☕</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
              Menu Tidak Ditemukan
            </h3>
            <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0, maxWidth: '24ch' }}>
              Coba gunakan kata kunci lain atau bersihkan kolom pencarian.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('semua');
                setOnlyFavorites(false);
                setOnlyNew(false);
              }}
              style={{
                marginTop: 16,
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary-dark)',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              Reset Filter
            </button>
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {cartTotalItems > 0 && (
        <div className="floating-cart-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <ShoppingCart size={18} color="white" />
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#DC2626',
                color: 'white',
                fontSize: '10px',
                fontWeight: 800,
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}>
                {cartTotalItems}
              </span>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 500, opacity: 0.9 }}>Total Pesanan</div>
              <div style={{ fontSize: '14px', fontWeight: 800 }}>{formatRupiah(cartTotalPrice)}</div>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              background: 'white',
              color: 'var(--color-primary)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
            }}
          >
            Lihat Keranjang
          </button>
        </div>
      )}

      {/* Cart Modal / Drawer */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid var(--color-border-light)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={20} color="var(--color-primary)" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Keranjang Belanja</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  onClick={clearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-error)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Trash2 size={14} />
                  <span>Kosongkan</span>
                </button>
                <button
                  onClick={() => setIsCartOpen(false)}
                  style={{
                    background: '#F5F5F0',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#57534E'
                  }}
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }} className="hide-scrollbar">
              {/* Item List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                  Item Pesanan
                </div>
                {Object.entries(cart).map(([itemId, qty]) => {
                  const item = menuData.find(m => m.id === itemId);
                  if (!item) return null;
                  return (
                    <div key={itemId} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'white',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '0.5px solid var(--color-border)'
                    }}>
                      <div style={{ flex: 1, marginRight: 12 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.nama}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>{formatRupiah(item.harga)}</div>
                      </div>
                      
                      {/* Quantity Selector */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#F5F5F0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        height: '32px'
                      }}>
                        <button
                          onClick={() => removeFromCart(itemId)}
                          style={{
                            border: 'none',
                            background: 'none',
                            padding: '0 8px',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#57534E',
                          }}
                        >
                          <Minus size={13} strokeWidth={2.5} />
                        </button>
                        <span style={{
                          padding: '0 4px',
                          minWidth: '24px',
                          textAlign: 'center',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: 'var(--color-text-primary)'
                        }}>
                          {qty}
                        </span>
                        <button
                          onClick={() => addToCart(itemId)}
                          style={{
                            border: 'none',
                            background: 'none',
                            padding: '0 8px',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#57534E',
                          }}
                        >
                          <Plus size={13} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ClipboardList size={12} />
                  <span>Informasi Pemesan</span>
                </div>

                {/* Nama Pemesan */}
                <div>
                  <label htmlFor="customerName" className="input-label" style={{ fontSize: '12px', fontWeight: 600 }}>Nama Pemesan <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <input
                    id="customerName"
                    type="text"
                    placeholder="Masukkan nama Anda"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (formErrors.name) {
                        setFormErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                    className={`input ${formErrors.name ? 'error' : ''}`}
                    style={{ height: '44px', fontSize: '14px', borderRadius: '10px' }}
                  />
                  {formErrors.name && <div className="input-error" style={{ fontSize: '11px', marginTop: 2 }}>{formErrors.name}</div>}
                </div>

                {/* Nomor Meja Selection */}
                <div>
                  <label htmlFor="tableNumber" className="input-label" style={{ fontSize: '12px', fontWeight: 600 }}>Nomor Meja <span style={{ color: 'var(--color-error)' }}>*</span></label>
                  <select
                    id="tableNumber"
                    value={tableNumber}
                    onChange={(e) => {
                      setTableNumber(e.target.value);
                      if (formErrors.table) {
                        setFormErrors(prev => ({ ...prev, table: '' }));
                      }
                    }}
                    className={`input ${formErrors.table ? 'error' : ''}`}
                    style={{ 
                      height: '44px', 
                      fontSize: '14px', 
                      borderRadius: '10px',
                      background: '#F5F5F0',
                      paddingRight: '32px',
                    }}
                  >
                    <option value="">Pilih Nomor Meja (1-15)</option>
                    {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>Meja {num}</option>
                    ))}
                  </select>
                  {formErrors.table && <div className="input-error" style={{ fontSize: '11px', marginTop: 2 }}>{formErrors.table}</div>}
                </div>

                {/* Catatan Pesanan */}
                <div>
                  <label htmlFor="orderNotes" className="input-label" style={{ fontSize: '12px', fontWeight: 600 }}>Catatan Pesanan (Opsional)</label>
                  <textarea
                    id="orderNotes"
                    placeholder="Contoh: Es kopi manis sedang, sendok tambahan..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="input"
                    style={{ 
                      height: '76px', 
                      fontSize: '14px', 
                      borderRadius: '10px', 
                      padding: '10px 14px',
                      resize: 'none',
                      lineHeight: '1.4'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid var(--color-border-light)',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Total Pembayaran:</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>{formatRupiah(cartTotalPrice)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="btn btn-primary"
                style={{ height: '48px', fontSize: '14px', fontWeight: 700, borderRadius: '10px' }}
              >
                Kirim Pesanan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccessDetails && (
        <div className="cart-overlay" style={{ alignItems: 'center', padding: '24px' }}>
          <div className="card animate-fade-in-up" style={{
            background: 'var(--color-bg)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '400px',
            padding: '28px 24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            border: 'none'
          }}>
            {/* Success Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--color-success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              color: 'var(--color-success)'
            }} className="animate-check">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 8px 0' }}>
              Pesanan Dikirim!
            </h3>
            
            <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Halo Rakan <strong>{orderSuccessDetails.name}</strong>, pesananmu untuk <strong>Meja {orderSuccessDetails.table}</strong> telah kami terima dan sedang dipersiapkan.
            </p>

            {/* Order Brief Summary */}
            <div style={{
              width: '100%',
              background: 'white',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                Ringkasan Pesanan
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }} className="hide-scrollbar">
                {orderSuccessDetails.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      <strong>{item.qty}x</strong> {item.nama}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {formatRupiah(item.harga * item.qty)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px dashed var(--color-border)', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Total Pembayaran:</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-primary)' }}>{formatRupiah(orderSuccessDetails.total)}</span>
              </div>
            </div>

            <button
              onClick={() => setOrderSuccessDetails(null)}
              className="btn btn-primary"
              style={{
                height: '46px',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: '12px',
                width: '100%'
              }}
            >
              Kembali ke Menu
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Nav */}
      <Navbar />
    </div>
  );
}
