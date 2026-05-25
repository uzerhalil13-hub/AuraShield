/* ==========================================================================
   AURA SHIELD - ENGEL VE KOZMİK IŞILTI MOTORU (chunks.js)
   ========================================================================== */

class ChunksEngine {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        
        this.obstacles = []; // Ekrandaki tehlikeli engeller
        this.stardusts = []; // Ekrandaki toplanabilir paralar
        
        // Zorluk ve Hız Ayarları
        this.baseSpeed = 3;   // Başlangıç aşağı akış hızı
        this.gameSpeed = 3;   // Anlık oyun hızı (Zamanla artacak)
        
        // Zamanlayıcılar (Milisaniye cinsinden)
        this.lastObstacleSpawn = 0;
        this.obstacleSpawnInterval = 1500; // Her 1.5 saniyede bir engel gelsin
        
        this.lastStardustSpawn = 0;
        this.stardustSpawnInterval = 800;   // Her 0.8 saniyede bir para gelsin
    }

    // 1. YENİ NESNE ÜRETİMİ (SPAWNING)
    spawn(currentTime) {
        // A) Engel Üretimi
        if (currentTime - this.lastObstacleSpawn > this.obstacleSpawnInterval) {
            this.obstacles.push({
                x: Math.random() * (this.canvas.width - 40) + 20,
                y: -30,
                radius: 12 + Math.random() * 8, // Rastgele boyutlarda mayınlar
                pulse: 0,
                speedOffset: Math.random() * 1 // Her engelin hızı hafif farklı olsun
            });
            this.lastObstacleSpawn = currentTime;
        }

        // B) Kozmik Işıltı (Para) Üretimi
        if (currentTime - this.lastStardustSpawn > this.stardustSpawnInterval) {
            this.stardusts.push({
                x: Math.random() * (this.canvas.width - 30) + 15,
                y: -20,
                radius: 6,
                pulse: 0
            });
            this.lastStardustSpawn = currentTime;
        }
    }

    // 2. POZİSYON GÜNCELLEME VE EKRANDAN ÇIKANLARI TEMİZLEME
    update(difficultyMultiplier) {
        // Zamanla oyunu hızlandır (Zorluk çarpanına göre)
        this.gameSpeed = this.baseSpeed + difficultyMultiplier;

        // A) Engelleri Aşağı Kaydır
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let obs = this.obstacles[i];
            obs.y += this.gameSpeed + obs.speedOffset;

            // Ekranın altından çıkan engelleri sil
            if (obs.y > this.canvas.height + 30) {
                this.obstacles.splice(i, 1);
            }
        }

        // B) Paraları Aşağı Kaydır
        for (let i = this.stardusts.length - 1; i >= 0; i--) {
            let gold = this.stardusts[i];
            gold.y += this.gameSpeed;

            // Ekranın altından çıkan paraları sil
            if (gold.y > this.canvas.height + 20) {
                this.stardusts.splice(i, 1);
            }
        }
    }

    // 3. GÖRSEL ÇİZİMLER (RENDER CHUNKS)
    draw() {
        // A) SİBER ENGELLERİ ÇİZ (Parıldayan Siber Kırmızı Mayınlar)
        this.obstacles.forEach(obs => {
            obs.pulse += 0.1;
            let currentRadius = obs.radius + Math.sin(obs.pulse) * 2;

            this.ctx.beginPath();
            this.ctx.arc(obs.x, obs.y, currentRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ff0055'; // Siber Kırmızı
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = '#ff0055';
            this.ctx.fill();
            this.ctx.shadowBlur = 0;

            // Mayının içine küçük siber detay (Tehlike işareti gibi)
            this.ctx.beginPath();
            this.ctx.arc(obs.x, obs.y, currentRadius * 0.4, 0, Math.PI * 2);
            this.ctx.fillStyle = '#05050a';
            this.ctx.fill();
        });

        // B) KOZMİK IŞILTILARI ÇİZ (Neon Sarısı Yıldız Tozları)
        this.stardusts.forEach(gold => {
            gold.pulse += 0.05;
            let glowSize = gold.radius + Math.sin(gold.pulse) * 1.5;

            this.ctx.beginPath();
            this.ctx.arc(gold.x, gold.y, glowSize, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffcc00'; // Altın Neon Sarısı
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#ffcc00';
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // Parlama noktası
            this.ctx.beginPath();
            this.ctx.arc(gold.x - 1, gold.y - 1, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fill();
        });
    }

    // 4. OYUN SIFIRLANDIĞINDA EKRANI TEMİZLEME FONKSİYONU
    clearAll() {
        this.obstacles = [];
        this.stardusts = [];
    }
}

// Global erişim sağla
window.ChunksEngine = ChunksEngine;
