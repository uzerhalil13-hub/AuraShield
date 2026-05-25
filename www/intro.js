/* ==========================================================================
   AURA SHIELD - 15 SANİYELİK SİNEMATİK GEÇİŞ MOTORU (intro.js)
   ========================================================================== */

const IntroEngine = {
    canvas: null,
    ctx: null,
    animationFrameId: null,
    startTime: null,
    duration: 15000, // 15 Saniye (Milisaniye cinsinden)
    
    // Sinematik Elementleri
    core: { x: 0, y: 0, radius: 12, targetX: 0, pulse: 0 },
    shield: { x: 0, y: -50, width: 60, height: 8, targetY: 0 },
    meteors: [],
    particles: [],
    
    // 1. SİNEMATİĞİ BAŞLATMA FONKSİYONU
    init() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        // Ekran boyutlarını tam ayarla
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Başlangıç Pozisyonları
        this.core.x = this.canvas.width / 2;
        this.core.y = this.canvas.height + 50; // Ekranın altından giriş yapacak
        this.core.targetX = this.core.x;
        this.shield.x = this.canvas.width / 2;
        this.shield.targetY = this.canvas.height * 0.3; // Ekranın %30 yukarısında duracak
        
        this.startTime = Date.now();
        
        // 3 saniye sonra Splash ekranını kapat ve animasyonu başlat
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            if (splash) splash.classList.add('hidden');
            this.loop();
        }, 3000);
    },
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    // 2. SİNEMATİK ELEMENT ÜRETİCİLERİ
    spawnMeteor() {
        if (Math.random() < 0.15 && this.meteors.length < 20) {
            this.meteors.push({
                x: Math.random() * this.canvas.width,
                y: -20,
                speed: 4 + Math.random() * 6,
                radius: 5 + Math.random() * 10,
                color: Math.random() < 0.5 ? '#ff0055' : '#ff5500'
            });
        }
    },
    
    spawnParticles(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                alpha: 1,
                color: color
            });
        }
    },
    
    // 3. ANA OYNATICI DÖNGÜ (ANIMATION LOOP)
    loop() {
        const elapsed = Date.now() - this.startTime;
        
        // Temizleme
        this.ctx.fillStyle = 'rgba(5, 5, 10, 0.2)'; // Neon iz bırakması için hafif şeffaf siyah
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Kozmik toz bulutu/yıldız arka planı çizimi
        this.drawStars();
        
        // Zaman dilimlerine göre sinematik yönetimi
        if (elapsed < 12000) {
            // SAHNE 1: Çekirdek fırtınadan kaçıyor (0 - 12 saniye)
            this.runSceneOne(elapsed);
        } else if (elapsed < 15000) {
            // SAHNE 2: Kalkan iniyor ve enerji bağı kuruluyor (12 - 15 saniye)
            this.runSceneTwo(elapsed);
        } else {
            // SİNEMATİK BİTTİ -> ANA MENÜYÜ AÇ
            this.endIntro();
            return;
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.loop());
    },
    
    // 4. SAHNE 1: KAÇIŞ VE KAOS
    runSceneOne(elapsed) {
        this.spawnMeteor();
        
        // Çekirdeği ekrana sok ve rastgele hedeflere yumuşakça koştur (Yapay Zeka Kaçışı)
        if (this.core.y > this.canvas.height * 0.7) {
            this.core.y -= 2; // Aşağıdan yukarı pürüzsüz giriş
        }
        
        if (Math.random() < 0.03) {
            this.core.targetX = this.canvas.width * 0.2 + Math.random() * (this.canvas.width * 0.6);
        }
        this.core.x += (this.core.targetX - this.core.x) * 0.08; // Yumuşak takip (Lerp)
        
        this.updateAndDrawMeteors();
        this.updateAndDrawParticles();
        this.drawCore();
    },
    
    // 5. SAHNE 2: KALKANIN İNİŞİ VE BAĞLANMA (THE BOND)
    runSceneTwo(elapsed) {
        // Meteor fırtınası duruluyor, kalanları temizle
        this.updateAndDrawMeteors();
        this.updateAndDrawParticles();
        
        // Çekirdek ekranın ortasında sabitleniyor
        const targetCoreX = this.canvas.width / 2;
        const targetCoreY = this.canvas.height * 0.65;
        this.core.x += (targetCoreX - this.core.x) * 0.1;
        this.core.y += (targetCoreY - this.core.y) * 0.1;
        this.drawCore();
        
        // Kalkan yukarıdan sahneye süzülüyor
        if (this.shield.y < this.shield.targetY) {
            this.shield.y += 3;
        }
        this.drawShield();
        
        // Enerji ipini (Bağı) neon ışık saçarak bağla
        if (this.shield.y >= this.shield.targetY - 10) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(0, 255, 204, ' + Math.random() + ')'; // Parazitli neon ip
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00ffcc';
            this.ctx.moveTo(this.shield.x, this.shield.y);
            this.ctx.lineTo(this.core.x, this.core.y);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0; // Gölgeyi sıfırla
        }
    },
    
    // 6. GÖRSEL ÇİZİM AMANATLARİ (RENDER HELPERS)
    drawCore() {
        this.core.pulse += 0.1;
        const currentRadius = this.core.radius + Math.sin(this.core.pulse) * 2;
        
        this.ctx.beginPath();
        this.ctx.arc(this.core.x, this.core.y, currentRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#00ffff';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    },
    
    drawShield() {
        this.ctx.beginPath();
        // Hafif kavisli şık bir kalkan görünümü
        this.ctx.arc(this.shield.x, this.shield.y - 10, 40, 0, Math.PI, false);
        this.ctx.lineWidth = 6;
        this.ctx.strokeStyle = '#00ffcc';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00ffcc';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    },
    
    updateAndDrawMeteors() {
        for (let i = this.meteors.length - 1; i >= 0; i--) {
            let m = this.meteors[i];
            m.y += m.speed;
            
            // Meteor arkası neon kuyruk izi
            this.ctx.beginPath();
            this.ctx.moveTo(m.x, m.y);
            this.ctx.lineTo(m.x, m.y - m.radius * 2);
            this.ctx.strokeStyle = m.color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Meteor gövdesi
            this.ctx.beginPath();
            this.ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = m.color;
            this.ctx.fill();
            
            // Çekirdeğe çok yakın geçerse "Kıl Payı Kaçış" partikülü saç (Görsel şov)
            let dist = Math.hypot(m.x - this.core.x, m.y - this.core.y);
            if (dist < 40 && dist > 15) {
                this.spawnParticles(m.x, m.y, '#ffffff');
            }
            
            // Ekrandan çıkanları temizle
            if (m.y > this.canvas.height + 20) {
                this.meteors.splice(i, 1);
            }
        }
    },
    
    updateAndDrawParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.02;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            this.ctx.fill();
            
            if (p.alpha <= 0) this.particles.splice(i, 1);
        }
    },
    
    drawStars() {
        // Sabit kozmik toz efekti (Çok hafif noktalar)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 5; i++) {
            let rx = Math.random() * this.canvas.width;
            let ry = Math.random() * this.canvas.height;
            this.ctx.fillRect(rx, ry, 1, 1);
        }
    },
    
    // 7. SİNEMATİK BİTİŞİ VE MENÜNÜN AÇILIŞI
    endIntro() {
        cancelAnimationFrame(this.animationFrameId);
        
        // Kamera Sarsıntısı (Screen Shake Efekti Altyapısı)
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        // Ana Menüyü pürüzsüzce görünür yap
        const mainMenu = document.getElementById('main-menu');
        if (mainMenu) mainMenu.classList.remove('hidden');
        
        // Ana oyun motoruna sinematiğin bittiğini haber ver
        if (window.GameEngine && window.GameEngine.setupMenuState) {
            window.GameEngine.setupMenuState(this.core, this.shield);
        }
    }
};

// Sayfa yüklendiğinde sinematik sistemini hazırla
window.addEventListener('DOMContentLoaded', () => {
    IntroEngine.init();
});
