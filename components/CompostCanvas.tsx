import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CompostCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null); // ボタン用のRefを追加
  const navigate = useNavigate();
  
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
    const button = buttonRef.current;
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
      { xRatio: 0.05, yRatio: 0.05, w: 60, h: 60, zoom: 2 },
      { xRatio: 0.85, yRatio: 0.1, w: 50, h: 50, zoom: 4 },
      { xRatio: 0.1, yRatio: 0.7, w: 65, h: 65, zoom: 8 }
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
        // 文字サイズを一回り小さく (8px - 16px)
        const size = 8 + Math.random() * 8;
        ctx.font = `${size}px "Press Start 2P", cursive`;
        return {
          text: word,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: size,
          width: ctx.measureText(word).width,
          history: []
        };
      });
    };

    const updateMousePos = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      mouse.x = (clientX - rect.left) * scaleX;
      mouse.y = (clientY - rect.top) * scaleY;
      mouse.active = true;
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateMousePos(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // ボタン上での操作の場合も座標更新を行うが、デフォルト動作（クリックなど）は妨げないようにする
      // ただし、Canvasのスクロール防止などはCanvas側のリスナーで行う
      if (e.touches.length > 0) {
        updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const handleTouchEnd = () => {
      mouse.active = false;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (imageLoaded) {
        ctx.globalAlpha = 1.0; 
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      }

      particles.forEach(p => {
        if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = 70;

            if (dist < minDist) {
            const force = (minDist - dist) / minDist;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 1.2;
            p.vy += Math.sin(angle) * force * 1.2;
            }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97; 
        p.vy *= 0.97;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.4) {
            p.vx += (Math.random() - 0.5) * 0.4;
            p.vy += (Math.random() - 0.5) * 0.4;
        }

        p.history.push({ x: p.x, y: p.y });
        if (p.history.length > 8) {
            p.history.shift();
        }

        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -1; }

        ctx.font = `${p.size}px "Press Start 2P", cursive`;

        p.history.forEach((pos, index) => {
            const alpha = (index / p.history.length) * 0.3;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowBlur = 0;
            ctx.fillText(p.text, pos.x, pos.y);
        });

        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 2;
        ctx.fillText(p.text, p.x, p.y);
        ctx.shadowBlur = 0;
      });

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
          ctx.font = '6px "Press Start 2P", cursive';
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
    
    // Canvasイベント
    canvas.addEventListener('touchstart', handleTouchMove, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    // ボタンにも同様のイベントリスナーを追加して、タッチ座標をCanvasに反映させる
    if (button) {
      button.addEventListener('touchstart', handleTouchMove, { passive: true }); // passive trueでクリック動作を阻害しない
      button.addEventListener('touchmove', handleTouchMove, { passive: true });
      // touchendはボタン本来の動作（onClick遷移）に任せるため、ここではmouse.active=falseにしない（一瞬で消えるのを防ぐため）
      // あるいは遷移するので気にしなくて良い
    }
    
    if (bgImage.complete) {
        imageLoaded = true;
        handleResize();
    }
    
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchstart', handleTouchMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      
      if (button) {
        button.removeEventListener('touchstart', handleTouchMove);
        button.removeEventListener('touchmove', handleTouchMove);
      }
      
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-paper-white dark:bg-ink-black transition-colors duration-500">
      <canvas ref={canvasRef} className="block w-full h-auto cursor-none" />
      
      {/* Pixel Button */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <button
          ref={buttonRef} // Refを割り当て
          onClick={() => navigate('/underground')}
          className="font-pixel-jp text-[8px] bg-black/30 text-white px-3 py-1 border border-white/50 hover:bg-white/20 hover:border-white transition-all duration-200 shadow-lg tracking-widest cursor-pointer backdrop-blur-[2px]"
        >
          地下に降りる
        </button>
      </div>

      <div className="absolute bottom-4 right-4 text-[8px] font-pixel text-white/50 pointer-events-none select-none tracking-tighter">
        Wait for decomposition...
      </div>
    </div>
  );
};

export default CompostCanvas;