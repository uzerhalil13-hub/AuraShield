/* ==========================================================================
   AURA SHIELD - OYUNCU KONTROLÜ VE ESNEK ENERJİ BAĞI FİZİĞİ (player.js)
   ========================================================================== */

class Player {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        // 1. KALKAN (SHIELD) ÖZELLİKLERİ
        this.shield = {
            x: canvas.width / 2,
            y: canvas.height * 0.3, // Ekranın %30 yukarısında sabit dikey konum
            width: 70,
            height: 8,
            radius: 45, // Kavisli kalkanın dairesel yarıçapı
            targetX: canvas.width / 2
        };
        
        // 2. ÇEKİRDEK (CORE) ÖZELLİKLERİ
        this.core = {
            x: canvas.width / 2,
            y: canvas.height * 0.6,
            vx: 0, // Yatay hız (Velocity X)
            vy: 0, // Dikey hız (Velocity Y)
            radius: 12,
            mass: 1, // Esneklik hesaplamaları için kütle
            pulse: 0
        };
        
        // 3. ESNEK BAĞ (SPRING JOINT) AYARLARI
        this.spring = {
            restLength: 120, // İpin normal (gerilmemiş) uzunluğu (120 piksel)
            k: 0.05,        // Yay sabitliği (Ne kadar sert/esnek olacağı)
            damping: 0.92   // Sürtünme/Yavaşlama (Sürekli deliler gibi sallanmasın diye)
        };
        
        this.gravity = 0.2; // Çekirdeği aşağı çeken hafif yerçekimi
        this.isDragging = false;
        
        this.initTouchControls();
    }

    // 4. MOBİL DOKUNMATİK (TOUCH) SİSTEMİ
    initTouchControls() {
        // Parmağı ekrana ilk bastığında
        this.canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            
            // Oyuncu kalkanın yakınlarına dokunduysa kontrolü ele al
            if (Math.abs(touchY - this.shield.y) < 60) {
                this.isDragging = true;
                this.shield.targetX = touchX;
            }
        });

        // Parmağı ekranda sürüklediğinde
        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault(); // Sayfa kaymasını engelle
            
            const touch = e.touches[0];
            // Kalkanın ekrandan dışarı taşmasını engelle (Sınırlandırma)
            this.shield.targetX = Math.max(this.shield.width / 2, Math.min(this.canvas.width - this.shield.width / 2, touch.clientX));
        });

        // Parmağı ekrandan çektiğinde
        this.canvas.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    // 5. FİZİK MOTORU GÜNCELLEME (HOOKES LAW & VERLET INTEGRATION)
    update() {
        // Kalkan parmağı yumuşakça takip etsin (Lerp)
        this.shield.x += (this.shield.targetX - this.shield.x) * 0.25;
        
        // --- ESNEK BAĞ MATEMATİĞİ (Hooke Yasası) ---
        // Kalkan ve Çekirdek arasındaki mesafe vektörleri
        let dx = this.core.x - this.shield.x;
        let dy = this.core.y - this.shield.y;
        let currentLength = Math.hypot(dx, dy);
        
        if (currentLength === 0) currentLength = 0.001; // Sıfıra bölünme hatasını engelle
        
        // İpin gerilme miktarı
        let extension = currentLength - this.spring.restLength;
        
        // Yay kuvveti hesaplaması (F = -k * x)
        let forceMagnitude = this.spring.k * extension;
        
        // Kuvvet yönleri (Normalleştirilmiş vektörler)
        let fx = (dx / currentLength) * forceMagnitude;
        let fy = (dy / currentLength) * forceMagnitude;
        
        // Kuvvetleri çekirdeğin hızına uygula
        this.core.vx -= fx / this.core.mass;
        this.core.vy -= fy / this.core.mass;
        
        // Ekstra Çevre Koşulları (Yerçekimi ve Sürtünme)
        this.core.vy += this.gravity;
        this.core.vx *= this.spring.damping;
        this.core.vy *= this.spring.damping;
        
        // Hızı konuma ekle (Çekirdeği hareket ettir)
        this.core.x += this.core.vx;
        this.core.y += this.core.vy;
    }

    // 6. GÖRSEL ÇİZİM (RENDER)
    draw() {
        // A) ESNEK NEON ENERJİ BAĞI ÇİZİMİ
        this.ctx.beginPath();
        this.ctx.moveTo(this.shield.x, this.shield.y);
        this.ctx.lineTo(this.core.x, this.core.y);
        
        // İp uzadıkça şeffaflaşsın ve rengi kızıllaşsın (Gerilim Hissiyatı)
        let strain = Math.hypot(this.core.x - this.shield.x, this.core.y - this.shield.y) / this.spring.restLength;
        let glowColor = strain > 1.3 ? '#ff0055' : '#00ffcc';
        
        this.ctx.strokeStyle = glowColor;
        this.ctx.lineWidth = 3;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = glowColor;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0; // Gölgeyi sıfırla ki diğer çizimler parlamasın
        
        // B) KALKAN (SHIELD) ÇİZİMİ
        this.ctx.beginPath();
        // Üste bakan kavisli siber yay çizimi
        this.ctx.arc(this.shield.x, this.shield.y + 25, this.shield.radius, Math.PI * 1.3, Math.PI * 1.7, false);
        this.ctx.lineWidth = 6;
        this.ctx.strokeStyle = '#00ffcc';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00ffcc';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        
        // C) PARLAYAN KOZMİK ÇEKİRDEK (CORE) ÇİZİMİ
        this.core.pulse += 0.08;
        let currentRadius = this.core.radius + Math.sin(this.core.pulse) * 1.5;
        
        this.ctx.beginPath();
        this.ctx.arc(this.core.x, this.core.y, currentRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#00ffff';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Çekirdeğin içine küçük siber beyaz nokta (Parıltı efekti)
        this.ctx.beginPath();
        this.ctx.arc(this.core.x - 3, this.core.y - 3, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
    }
}

// Global olarak erişilebilir yapalım ki game.js bu sınıfı çağırabilsin
window.Player = Player;
