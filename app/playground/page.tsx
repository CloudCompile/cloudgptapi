'use client';

import { useState } from 'react';
import { CHAT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '@/lib/providers';

type Mode = 'chat' | 'image' | 'video';

export default function PlaygroundPage() {
  const [mode, setMode] = useState<Mode>('chat');
  const [selectedModel, setSelectedModel] = useState(CHAT_MODELS[0].id);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setOutput('');
    setImageUrl('');
    setVideoUrl('');
    setMessages([]);
    if (newMode === 'chat') setSelectedModel(CHAT_MODELS[0].id);
    if (newMode === 'image') setSelectedModel(IMAGE_MODELS[0].id);
    if (newMode === 'video') setSelectedModel(VIDEO_MODELS[0].id);
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setOutput('');

    try {
      if (mode === 'chat') {
        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            messages: newMessages
          })
        });

        const data = await response.json();
        const assistantMessage = data.choices?.[0]?.message?.content || 'No response';
        setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
        setInput('');
      } else if (mode === 'image') {
        setOutput('Generating image...');
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            prompt: input
          })
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setImageUrl(url);
          setOutput('Image generated successfully!');
        } else {
          setOutput('Failed to generate image');
        }
      } else if (mode === 'video') {
        setOutput('Generating video... This may take a while.');
        const response = await fetch('/api/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            prompt: input
          })
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setOutput('Video generated successfully!');
        } else {
          setOutput('Failed to generate video');
        }
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>AI Playground</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '32px' }}>
          Test and experiment with different AI models in real-time
        </p>

        {/* Mode Selection */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {(['chat', 'image', 'video'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: mode === m ? '2px solid var(--primary)' : '1px solid #e5e7eb',
                background: mode === m ? 'var(--primary)' : 'transparent',
                color: mode === m ? 'white' : 'var(--foreground)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'capitalize'
              }}
            >
              {m === 'chat' ? '💬' : m === 'image' ? '🖼️' : '🎬'} {m}
            </button>
          ))}
        </div>

        {/* Model Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Select Model:
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '1rem',
              background: 'var(--background)',
              color: 'var(--foreground)'
            }}
          >
            {(mode === 'chat' ? CHAT_MODELS : mode === 'image' ? IMAGE_MODELS : VIDEO_MODELS).map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} - {model.description}
              </option>
            ))}
          </select>
        </div>

        {/* Chat Messages */}
        {mode === 'chat' && messages.length > 0 && (
          <div style={{
            marginBottom: '24px',
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                marginBottom: '16px',
                padding: '12px',
                borderRadius: '8px',
                background: msg.role === 'user' ? '#e0f2fe' : '#f3f4f6'
              }}>
                <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong>
                <p style={{ marginTop: '4px' }}>{msg.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            {mode === 'chat' ? 'Your Message:' : 'Prompt:'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'chat' ? 'Type your message...' : 'Describe what you want to generate...'}
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              background: 'var(--background)',
              color: 'var(--foreground)'
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            border: 'none',
            background: loading ? '#9ca3af' : 'var(--primary)',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '24px'
          }}
        >
          {loading ? 'Processing...' : mode === 'chat' ? 'Send Message' : 'Generate'}
        </button>

        {/* Output */}
        {output && (
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            background: '#f3f4f6',
            marginBottom: '24px'
          }}>
            <p>{output}</p>
          </div>
        )}

        {/* Image Output */}
        {imageUrl && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Generated Image:</h3>
            <img 
              src={imageUrl} 
              alt="Generated" 
              style={{ 
                maxWidth: '100%', 
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }} 
            />
          </div>
        )}

        {/* Video Output */}
        {videoUrl && (
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '12px' }}>Generated Video:</h3>
            <video 
              src={videoUrl} 
              controls 
              style={{ 
                maxWidth: '100%', 
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
