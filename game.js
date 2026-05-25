/* ==========================================================================
   AURA SHIELD - ANA OYUN MOTORU VE ÇARPIŞMA SİSTEMİ (game.js)
   ========================================================================== */

const GameEngine = {
    canvas: null,
    ctx: null,
    player: null,
    chunks: null,
    
    // Oyun Durum Kontrolleri (State)
    isPlaying: false,
    score: 0,
    difficultyMultiplier: 0,
    gameTime: 0,
    
    // 1. OYUN MOTORUNU HAZIRLAMA (INITIALIZATION)
    init() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        // Sınıfları bağla
        this.player = new window.Player(this.canvas, this.ctx);
        this.chunks = new window.ChunksEngine(this.canvas, this.ctx);
        
        this.setupMenuControls();
    },
    
    // 2. SİNEMATİK BİTTİĞİNDE INTRO'DAN VERİ TRANSFERİ
    setupMenuState(introCore, introShield) {
        // Sinematikteki son pozisyonları ana oyuna pürüzsüzce aktar
        this.player.core.x = introCore.x;
        this.player.core.y = introCore.y;
        this.player.shield.x = introShield.x;
        this.player.shield.targetX = introShield.x;
        
        // Arka planda pürüzsüz menü akışını başlat
        this.isMenuMenuLoopActive = true;
        this.menuLoop();
    },
    
    // 3. MENÜDEKİ "OYNA" DOKUNUŞUNU YAKALAMA
    setupMenuControls() {
        const mainMenu = document.getElementById('main-menu');
        
        // Menü katmanına tıklandığında dükkan veya profil açık değilse oyunu başlat
        mainMenu.addEventListener('touchstart', (e) => {
            // Eğer dükkan veya profil butonlarına basılmadıysa oyunu başlat
            if (e.target.closest('.nav-button') || e.target.closest('.close-button')) return;
            
            if (!this.isPlaying) {
                mainMenu.classList.add('hidden'); // Menüyü gizle
                document.getElementById('game-hud').classList.remove('hidden'); // HUD'ı aç
                this.startGame();
            }
        });
    },
    
    // 4. OYUNU RESMİ OLARAK BAŞLATMA
    startGame() {
        this.isPlaying = true;
        this.score = 0;
        this.difficultyMultiplier = 0;
        this.gameTime = Date.now();
        
        // Dükkandaki zırh geliştirmesine göre oyuncunun canını belirle (0 seviye = 1 can, 1 seviye = 2 can...)
        this.playerLives = 1 + window.GameState.upgrades.shieldArmor;
        
        this.chunks.clearAll();
        
        // HUD ilk değerleri yazdır
        document.getElementById('hud-lives').textContent = "❤️ ".repeat(this.playerLives);
        
        this.gameLoop();
    },
    
    // 5. ANA OYUN DÖNGÜSÜ (60 FPS GAME LOOP)
    gameLoop() {
        if (!this.isPlaying) return;
        
        const now = Date.now();
        const elapsed = now - this.gameTime;
        
        // Zaman geçtikçe zorluk çarpanını artır (Her 10 saniyede bir hız artar)
        this.difficultyMultiplier = elapsed / 10000;
        this.score = Math.floor(elapsed / 100); // Skor metre bazlı artıyor
        
        // Temizleme ve Güncelleme
        this.ctx.fillStyle = '#020205';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Motorları İleri Al
        this.player.update();
        this.chunks.spawn(now);
        this.chunks.update(this.difficultyMultiplier);
        
        // Çarpışmaları Denetle (En Kritik Bölüm)
        this.checkCollisions();
        
        // Çizimleri Yap
        this.chunks.draw();
        this.player.draw();
        
        // HUD Bilgilerini Güncelle
        document.getElementById('hud-score').textContent = this.score + "m";
        document.getElementById('hud-stardust').textContent = "✨ " + window.GameState.stardust;
        
        requestAnimationFrame(() => this.gameLoop());
    },
    
    // 6. MENÜ ARKA PLAN AKIŞ DÖNGÜSÜ (OYUN BAŞLAMADAN ÖNCEKİ SÜZÜLME)
    menuLoop() {
        if (this.isPlaying) return;
        
        this.ctx.fillStyle = '#020205';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Menüdeyken kalkan parmağı takip etmez, ortada hafifçe salınır
        this.player.shield.targetX = this.canvas.width / 2 + Math.sin(Date.now() / 1000) * 30;
        this.player.update();
        this.player.draw();
        
        requestAnimationFrame(() => this.menuLoop());
    },
    
    // 7. SİBER ÇARPIŞMA MATEMATİKSEL DENETİMİ (COLLISION DETECTION)
    checkCollisions() {
        // --- A) ENGELLER (MAYINLAR) İLE ÇARPIŞMA ---
        let obstacles = this.chunks.obstacles;
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            
            // 1. Durum: Mayın Kalkana Çarptı mı? (SAVUNMA BAŞARILI)
            // Kalkanın kavisli dairesel alanına göre mesafe kontrolü
            let distToShield = Math.hypot(obs.x - this.player.shield.x, obs.y - this.player.shield.y);
            if (distToShield < this.player.shield.radius + obs.radius && obs.y < this.player.shield.y + 10) {
                // Engel yok edildi, oyuncu can kurtardı!
                obstacles.splice(i, 1);
                if (navigator.vibrate) navigator.vibrate(20); // Hafif tık geri bildirimi
                continue;
            }
            
            // 2. Durum: Mayın Korunmasız Çekirdeğe Çarptı mı? (HASAR ALINDI)
            let distToCore = Math.hypot(obs.x - this.player.core.x, obs.y - this.player.core.y);
            if (distToCore < this.player.core.radius + obs.radius) {
                obstacles.splice(i, 1); // Mayını patlat
                this.playerLives--;
                
                // Ekranı sars ve güçlü titret
                if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
                
                // Can göstergesini güncelle
                document.getElementById('hud-lives').textContent = "❤️ ".repeat(this.playerLives);
                
                if (this.playerLives <= 0) {
                    this.gameOver();
                }
                continue;
            }
        }
        
        // --- B) KOZMİK IŞILTILAR (PARALAR) İLE ÇARPIŞMA ---
        let stardusts = this.chunks.stardusts;
        for (let i = stardusts.length - 1; i >= 0; i--) {
            let gold = stardusts[i];
            
            // Paraları Kalkanla yakalıyoruz!
            let distToShield = Math.hypot(gold.x - this.player.shield.x, gold.y - this.player.shield.y);
            if (distToShield < this.player.shield.radius + gold.radius && gold.y < this.player.shield.y + 20) {
                stardusts.splice(i, 1);
                window.GameState.stardust += 1; // Cüzdana 1 Işıltı ekle
                if (navigator.vibrate) navigator.vibrate(10); // Çok hafif para toplama tıkı
            }
        }
    },
    
    // 8. OYUN BİTTİ (GAME OVER) EKOSİSTEMİ
    gameOver() {
        this.isPlaying = false;
        
        // En yüksek skoru kontrol et ve güncelle
        if (this.score > window.GameState.highScore) {
            window.GameState.highScore = this.score;
        }
        
        // HUD'ı gizle, Ana Menüyü tekrar getir
        document.getElementById('game-hud').classList.add('hidden');
        const mainMenu = document.getElementById('main-menu');
        mainMenu.classList.remove('hidden');
        
        // UI dosyasındaki dükkan/skor yazılarını son paralara göre tazele
        if (window.updateUiDisplays) {
            window.updateUiDisplays();
        }
        
        // Menü arka plan salınımını yeniden canlandır
        this.setupMenuState(this.player.core, this.player.shield);
    }
};

// Global erişime aç ve sayfa hazır olduğunda motoru ateşle
window.GameEngine = GameEngine;
window.addEventListener('DOMContentLoaded', () => {
    GameEngine.init();
});
