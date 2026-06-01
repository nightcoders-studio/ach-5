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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '0 16px' }}>
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

                {/* 3. Tag Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {item.tags.map((tag) => (
                    <span 
                      key={tag} 
                      style={{
                        background: '#F5F5F0',
                        borderRadius: '999px',
                        padding: '4px 10px',
                        fontSize: '11px',
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
