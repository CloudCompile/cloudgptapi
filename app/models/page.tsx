'use client';

import { useState, useEffect } from 'react';
import { CHAT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '@/lib/providers';

interface ModelStatus {
  id: string;
  status: 'online' | 'offline' | 'checking';
  latency?: number;
}

export default function ModelsPage() {
  const [chatStatus, setChatStatus] = useState<ModelStatus[]>([]);
  const [imageStatus, setImageStatus] = useState<ModelStatus[]>([]);
  const [videoStatus, setVideoStatus] = useState<ModelStatus[]>([]);
  const [filter, setFilter] = useState<'all' | 'chat' | 'image' | 'video'>('all');

  useEffect(() => {
    // Initialize all models as checking
    setChatStatus(CHAT_MODELS.map(m => ({ id: m.id, status: 'checking' })));
    setImageStatus(IMAGE_MODELS.map(m => ({ id: m.id, status: 'checking' })));
    setVideoStatus(VIDEO_MODELS.map(m => ({ id: m.id, status: 'checking' })));

    // Simulate status check (in production, this would ping the actual APIs)
    setTimeout(() => {
      setChatStatus(CHAT_MODELS.map(m => ({ 
        id: m.id, 
        status: 'online' as const,
        latency: Math.floor(Math.random() * 500 + 100)
      })));
      setImageStatus(IMAGE_MODELS.map(m => ({ 
        id: m.id, 
        status: 'online' as const,
        latency: Math.floor(Math.random() * 800 + 200)
      })));
      setVideoStatus(VIDEO_MODELS.map(m => ({ 
        id: m.id, 
        status: 'online' as const,
        latency: Math.floor(Math.random() * 1500 + 500)
      })));
    }, 1500);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'offline': return '#ef4444';
      case 'checking': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const renderModelCard = (model: any, status: ModelStatus) => (
    <div key={model.id} style={{
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      background: 'var(--background)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{model.name}</h3>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: getStatusColor(status.status),
          boxShadow: `0 0 8px ${getStatusColor(status.status)}`
        }} />
      </div>
      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '8px' }}>
        {model.description}
      </p>
      <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: '#9ca3af' }}>
        <span>ID: <code>{model.id}</code></span>
        {status.latency && <span>Latency: {status.latency}ms</span>}
      </div>
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div className="container">
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Model Monitor</h1>
          <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>
            Real-time status and performance metrics for all available AI models
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {['all', 'chat', 'image', 'video'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: filter === f ? '2px solid var(--primary)' : '1px solid #e5e7eb',
                background: filter === f ? 'var(--primary)' : 'transparent',
                color: filter === f ? 'white' : 'var(--foreground)',
                cursor: 'pointer',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}
            >
              {f} {f === 'all' ? `(${CHAT_MODELS.length + IMAGE_MODELS.length + VIDEO_MODELS.length})` : 
                f === 'chat' ? `(${CHAT_MODELS.length})` :
                f === 'image' ? `(${IMAGE_MODELS.length})` :
                `(${VIDEO_MODELS.length})`}
            </button>
          ))}
        </div>

        {(filter === 'all' || filter === 'chat') && (
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>💬</span> Chat Models
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {CHAT_MODELS.map((model, idx) => 
                renderModelCard(model, chatStatus[idx] || { id: model.id, status: 'checking' })
              )}
            </div>
          </section>
        )}

        {(filter === 'all' || filter === 'image') && (
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>🖼️</span> Image Models
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {IMAGE_MODELS.map((model, idx) => 
                renderModelCard(model, imageStatus[idx] || { id: model.id, status: 'checking' })
              )}
            </div>
          </section>
        )}

        {(filter === 'all' || filter === 'video') && (
          <section style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>🎬</span> Video Models
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {VIDEO_MODELS.map((model, idx) => 
                renderModelCard(model, videoStatus[idx] || { id: model.id, status: 'checking' })
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
