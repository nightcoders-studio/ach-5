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
  Heart
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
    let gradient = 'linear-gradient(135deg, oklch(0.85 0.12 75), oklch(0.7 0.15 75))'; // default amber
    let IconComponent = Coffee;

    if (item.kategori === 'kopi_panas') {
      gradient = 'linear-gradient(135deg, oklch(0.8 0.14 75), oklch(0.55 0.15 65))';
      IconComponent = Coffee;
    } else if (item.kategori === 'kopi_dingin') {
      gradient = 'linear-gradient(135deg, oklch(0.85 0.1 200), oklch(0.65 0.15 220))';
      IconComponent = Snowflake;
    } else if (item.kategori === 'non_kopi') {
      gradient = 'linear-gradient(135deg, oklch(0.85 0.1 320), oklch(0.65 0.15 340))';
      IconComponent = CupSoda;
    } else if (item.kategori === 'makanan_berat') {
      gradient = 'linear-gradient(135deg, oklch(0.8 0.15 30), oklch(0.6 0.18 45))';
      IconComponent = Utensils;
    } else if (item.kategori === 'snack') {
      gradient = 'linear-gradient(135deg, oklch(0.88 0.12 85), oklch(0.72 0.14 95))';
      IconComponent = Cookie;
    }

    return (
      <div style={{
        width: 80,
        height: 80,
        borderRadius: 14,
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: 'inset 0 2px 4px oklch(1 0 0 / 0.15), 0 4px 12px oklch(0 0 0 / 0.06)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle inner grid lines */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }} />
        <IconComponent size={34} color="white" strokeWidth={1.8} />
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--color-bg)',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
    }}>
      
      {/* ── Sticky Header & Toolbar ── */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'oklch(0.975 0.005 75 / 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--color-border-light)',
        padding: '16px 20px 12px',
      }}>
        
        {/* Top title and back button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Link href="/" style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'white',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text)',
            boxShadow: 'var(--shadow-card)',
            textDecoration: 'none'
          }}>
            <ChevronLeft size={18} strokeWidth={2.5} />
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/smart-coffee.svg" alt="Logo" style={{ height: 28, width: 'auto' }} />
            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Smart QR Menu
            </h1>
          </div>

          <div style={{ width: 36 }} /> {/* spacer */}
        </div>

        {/* Search & Sort & Filter Row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-placeholder)', display: 'flex' }}>
              <Search size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Cari kopi, makanan, rasa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: 36,
                paddingRight: searchQuery ? 32 : 12,
                height: 42,
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
                  padding: 4
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
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-input)',
              border: `1.5px solid ${isFilterPanelOpen || onlyFavorites || onlyNew ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: isFilterPanelOpen || onlyFavorites || onlyNew ? 'var(--color-primary-light)' : 'white',
              color: isFilterPanelOpen || onlyFavorites || onlyNew ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card)',
              transition: 'all 0.15s ease',
            }}
          >
            <SlidersHorizontal size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Category Pills (Horizontal Scroll) */}
        <div style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 4,
          margin: '0 -20px -4px',
          paddingLeft: 20,
          paddingRight: 20,
          scrollbarWidth: 'none',
        }} className="no-scrollbar">
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
                  background: isSelected ? 'var(--color-primary)' : 'white',
                  color: isSelected ? 'white' : 'var(--color-text-secondary)',
                  border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: 10,
                  padding: '7px 13px',
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  boxShadow: isSelected ? 'var(--shadow-hero)' : 'var(--shadow-card)',
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

      {/* ── Advanced Filter & Sort Tray ── */}
      {isFilterPanelOpen && (
        <div 
          className="animate-fade-in"
          style={{
            background: 'white',
            borderBottom: '1px solid var(--color-border)',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            boxShadow: '0 8px 24px oklch(0 0 0 / 0.05)',
          }}
        >
          {/* Sort row */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
              <ArrowUpDown size={12} /> Urutkan Berdasarkan
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  style={{
                    background: sortBy === opt.id ? 'var(--color-primary-light)' : 'white',
                    color: sortBy === opt.id ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                    border: sortBy === opt.id ? '1px solid oklch(0.85 0.1 80)' : '1px solid var(--color-border)',
                    borderRadius: 8,
                    padding: '5px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick toggle options */}
          <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--color-border-light)', paddingTop: 12 }}>
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                background: onlyFavorites ? 'oklch(0.96 0.04 25)' : 'white',
                color: onlyFavorites ? 'var(--color-error)' : 'var(--color-text-secondary)',
                border: onlyFavorites ? '1px solid oklch(0.85 0.1 25)' : '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Heart size={13} fill={onlyFavorites ? 'var(--color-error)' : 'none'} />
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
                background: onlyNew ? 'var(--color-success-light)' : 'white',
                color: onlyNew ? 'var(--color-success)' : 'var(--color-text-secondary)',
                border: onlyNew ? '1px solid oklch(0.85 0.1 145)' : '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Sparkles size={13} />
              Menu Baru
            </button>
          </div>
        </div>
      )}

      {/* ── Main Menu List ── */}
      <main style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                className={`card animate-fade-in-up ${staggerDelayClass}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                  opacity: item.tersedia ? 1 : 0.6,
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

                {/* 3. Tag Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {item.tags.map((tag) => (
                    <span key={tag} className="tag-chip">
                      #{tag}
                    </span>
                  ))}
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

      {/* Floating Bottom Nav */}
      <Navbar />
    </div>
  );
}
