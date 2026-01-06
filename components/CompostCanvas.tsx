import React, { useRef, useEffect, useState } from 'react';

const CompostCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 浮遊する言葉たち
  const words = [
    "decay", "decompost", "soil", "silence",
    "meaning deliberately unrecovered", "Unfinished", 
    "Fragment", "Wander", "Phenomenon", "Haptic texture", 
    "Fermentation", "Mycelium", "permanent", 
    "Subtle oscillation", "Absurdity"
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // ピクセル操作のために willReadFrequently を true にする
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // 画像描画時の補間を無効化（ドット感を出すため）
    ctx.imageSmoothingEnabled = false;

    let animationFrameId: number;
    let particles: Array<{
      text: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      width: number;
      history: Array<{x: number, y: number}>;
    }> = [];

    // マウス位置
    let mouse = { x: canvas.width / 2, y: canvas.height / 2, active: false };

    // 拡大フレームの設定
    const frames = [
      { xRatio: 0.05, yRatio: 0.05, w: 120, h: 120, zoom: 2 },
      { xRatio: 0.85, yRatio: 0.1, w: 100, h: 100, zoom: 4 },
      { xRatio: 0.1, yRatio: 0.7, w: 140, h: 140, zoom: 8 }
    ];

    // 画像の読み込み
    const bgImage = new Image();
    bgImage.src = '/at-an-arbor/images/compost-bg.jpeg'; 
    
    let imageLoaded = false;

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      canvas.width = width;
      
      const ratio = 1620 / 1080;
      canvas.height = width / ratio;
      
      ctx.imageSmoothingEnabled = false;
      
      initParticles();
    };

    bgImage.onload = () => {
      imageLoaded = true;
      handleResize();
    };

    const initParticles = () => {
      particles = words.map(word => {
        // 文字サイズを一回り大きく (12px - 24px)
        const size = 12 + Math.random() * 12;
        ctx.font = `${size}px "Press Start 2P", cursive`;
        return {
          text: word,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          // 初期速度を上げる
          vx: (Math.random() - 0.5) * 2.0, 
          vy: (Math.random() - 0.5) * 2.0,
          size: size,
          width: ctx.measureText(word).width,
          history: []
        };
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      mouse.x = (e.clientX - rect.left) * scaleX;
      mouse.y = (e.clientY - rect.top) * scaleY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 背景描画
      if (imageLoaded) {
        ctx.globalAlpha = 1.0; 
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      }

      // パーティクルの更新と描画
      particles.forEach(p => {
        // マウス反発ロジック - 少し強めに
        if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = 100;

            if (dist < minDist) {
            const force = (minDist - dist) / minDist;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 1.5;
            p.vy += Math.sin(angle) * force * 1.5;
            }
        }

        // 位置更新
        p.x += p.vx;
        p.y += p.vy;
        
        // 摩擦 (少し強めて速度管理)
        p.vx *= 0.97; 
        p.vy *= 0.97;

        // ランダムな推進力を強めてキビキビ動かす
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.5) {
            p.vx += (Math.random() - 0.5) * 0.5;
            p.vy += (Math.random() - 0.5) * 0.5;
        }

        // 履歴の更新
        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > 8) {
            p.history.shift();
        }

        // バウンド
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -1; }

        ctx.font = `${p.size}px "Press Start 2P", cursive`;

        // 残像の描画
        p.history.forEach((pos, index) => {
            const alpha = (index / p.history.length) * 0.3;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowBlur = 0;
            ctx.fillText(p.text, pos.x, pos.y);
        });

        // 本体の描画
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 2;
        ctx.fillText(p.text, p.x, p.y);
        ctx.shadowBlur = 0;
      });

      // ズームフレーム
      if (imageLoaded && mouse.active) {
        frames.forEach(frame => {
          const fx = frame.xRatio * canvas.width;
          const fy = frame.yRatio * canvas.height;
          
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(fx + frame.w / 2, fy + frame.h / 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          const sw = frame.w / frame.zoom;
          const sh = frame.h / frame.zoom;
          
          const imgScaleX = bgImage.naturalWidth / canvas.width;
          const imgScaleY = bgImage.naturalHeight / canvas.height;
          
          const sourceX = Math.max(0, Math.min(bgImage.naturalWidth - sw, mouse.x * imgScaleX - sw / 2));
          const sourceY = Math.max(0, Math.min(bgImage.naturalHeight - sh, mouse.y * imgScaleY - sh / 2));

          ctx.fillStyle = '#000';
          ctx.fillRect(fx, fy, frame.w, frame.h);

          ctx.drawImage(
            bgImage,
            sourceX, sourceY, sw, sh,
            fx, fy, frame.w, frame.h
          );

          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.strokeRect(fx, fy, frame.w, frame.h);
          
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '8px "Press Start 2P", cursive';
          ctx.fillText(`x${frame.zoom}`, fx + 4, fy + frame.h - 4);
        });
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(mouse.x - 4, mouse.y - 4, 8, 8);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    if (bgImage.complete) {
        imageLoaded = true;
        handleResize();
    }
    
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-paper-white dark:bg-ink-black transition-colors duration-500">
      <canvas ref={canvasRef} className="block w-full h-auto cursor-none" />
      <div className="absolute bottom-4 right-4 text-[8px] font-pixel text-white/50 pointer-events-none select-none tracking-tighter">
        Wait for decomposition...
      </div>
    </div>
  );
};

export default CompostCanvas;
