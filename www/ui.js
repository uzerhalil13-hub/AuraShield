/* ==========================================================================
   AURA SHIELD - KULLANICI ARAYÜZÜ VE EKONOMİ MOTORU (ui.js)
   ========================================================================= */

// 1. KÜRESEL OYUN EKONOMİSİ VE KULLANICI VERİLERİ
window.GameState = {
    stardust: 150,       // Başlangıç parası (Test için 150 ✨ verildi)
    highScore: 0,        // En yüksek skor (metre)
    
    // Kalıcı Yetenek Seviyeleri (Maksimum Seviye 3)
    upgrades: {
        shieldArmor: 0   // Seviye 0: Zırh yok, Seviye 1: 1 Can, Seviye 2: 2 Can...
    },
    
    // Satın Alınan ve Stoklanan Aktif Güçlendirmeler (Adet)
    powerups: {
        freeze: 0,       // Kozmik Donma stoğu
        magnet: 0,       // Işıltı Girdabı stoğu
        supernova: 0     // Süper Nova stoğu
    }
};

// Ekonomik Fiyat Ayarları
const SHOP_CONFIG = {
    shieldArmor: { baseCost: 100, multiplier: 3 }, // 100 -> 300 -> 900
    freeze: { cost: 30 },
    magnet: { cost: 30 },
    supernova: { cost: 50 }
};

// 2. HTML ELEMENTLERİNİN SEÇİLMESİ
const UI = {
    // Menüler ve Paneller
    mainMenu: document.getElementById('main-menu'),
    profilePanel: document.getElementById('profile-panel'),
    shopPanel: document.getElementById('shop-panel'),
    gameHud: document.getElementById('game-hud'),
    
    // Tetikleyici Butonlar
    btnProfile: document.getElementById('btn-profile'),
    btnShop: document.getElementById('btn-shop'),
    closeProfile: document.getElementById('close-profile'),
    closeShop: document.getElementById('close-shop'),
    
    // Değer Göstergeleri
    stardustDisplays: document.querySelectorAll('.stardust-amount'),
    menuHighScore: document.getElementById('menu-high-score-val'),
    highScoreTag: document.getElementById('high-score-tag'),
    
    // Dükkan İçi Satın Alma Butonları ve Fiyat Etiketleri
    btnUpgradeArmor: document.querySelector('#upgrade-shield-armor .buy-button'),
    costUpgradeArmor: document.querySelector('#upgrade-shield-armor .item-cost'),
    btnBuyFreeze: document.querySelector('#powerup-freeze .buy-button'),
    btnBuyMagnet: document.querySelector('#powerup-magnet .buy-button'),
    btnBuySupernova: document.querySelector('#powerup-supernova .buy-button'),
    
    // HUD (Oyun İçi) Elementleri
    hudScore: document.getElementById('hud-score'),
    hudStardust: document.getElementById('hud-stardust'),
    hudLives: document.getElementById('hud-lives'),
    btnUseFreeze: document.getElementById('use-freeze'),
    btnUseMagnet: document.getElementById('use-magnet'),
    btnUseSupernova: document.getElementById('use-supernova')
};

// 3. ARAYÜZ GÜNCELLEME FONKSİYONLARI (RENDER UI)
function updateUiDisplays() {
    // Tüm panellerdeki Işıltı (Para) miktarlarını güncelle
    UI.stardustDisplays.forEach(el => el.textContent = window.GameState.stardust);
    
    // En yüksek skoru ekrana yaz
    UI.menuHighScore.textContent = window.GameState.highScore;
    
    // Kalkan Zırhı fiyatını ve buton yazısını seviyeye göre hesapla
    const currentArmorLvl = window.GameState.upgrades.shieldArmor;
    const nextArmorCost = SHOP_CONFIG.shieldArmor.baseCost * Math.pow(SHOP_CONFIG.shieldArmor.multiplier, currentArmorLvl);
    
    if (UI.costUpgradeArmor) {
        UI.costUpgradeArmor.textContent = nextArmorCost;
    }
    
    if (UI.btnUpgradeArmor) {
        if (currentArmorLvl >= 3) {
            UI.btnUpgradeArmor.textContent = "MAX SEVİYE";
            UI.btnUpgradeArmor.style.background = "#444";
            UI.btnUpgradeArmor.style.color = "#888";
        } else {
            UI.btnUpgradeArmor.innerHTML = `Geliştir (<span class="item-cost">${nextArmorCost}</span>)`;
        }
    }
    
    // HUD üzerindeki stok sayılarını ve yetenek butonlarını güncelle
    updateHudPowerupCounts();
}

function updateHudPowerupCounts() {
    // Stokta güçlendirme varsa butonları görünür yap, yoksa gizle
    manageSkillButton(UI.btnUseFreeze, window.GameState.powerups.freeze);
    manageSkillButton(UI.btnUseMagnet, window.GameState.powerups.magnet);
    manageSkillButton(UI.btnUseSupernova, window.GameState.powerups.supernova);
}

function manageSkillButton(buttonElement, count) {
    if (!buttonElement) return;
    if (count > 0) {
        buttonElement.classList.remove('hidden');
        const countBadge = buttonElement.querySelector('.count');
        if (countBadge) countBadge.textContent = count;
    } else {
        buttonElement.classList.add('hidden');
    }
}

// 4. PANEL AÇMA / KAPAMA MANTIĞI (PANEL CONTROLS)
if (UI.btnProfile) {
    UI.btnProfile.addEventListener('click', () => {
        UI.profilePanel.classList.remove('hidden');
        updateUiDisplays();
    });
}

if (UI.closeProfile) {
    UI.closeProfile.addEventListener('click', () => {
        UI.profilePanel.classList.add('hidden');
    });
}

if (UI.btnShop) {
    UI.btnShop.addEventListener('click', () => {
        UI.shopPanel.classList.remove('hidden');
        updateUiDisplays();
    });
}

if (UI.closeShop) {
    UI.closeShop.addEventListener('click', () => {
        UI.shopPanel.classList.add('hidden');
    });
}

// 5. SATIN ALMA VE EKONOMİ MANTIĞI (SHOP LOGIC)

// Kalıcı Kalkan Geliştirmesi Tıklama Dinleyicisi
if (UI.btnUpgradeArmor) {
    UI.btnUpgradeArmor.addEventListener('click', () => {
        const currentLvl = window.GameState.upgrades.shieldArmor;
        if (currentLvl >= 3) return; // 3 can sınırını aşamaz
        
        const cost = SHOP_CONFIG.shieldArmor.baseCost * Math.pow(SHOP_CONFIG.shieldArmor.multiplier, currentLvl);
        
        if (window.GameState.stardust >= cost) {
            window.GameState.stardust -= cost;
            window.GameState.upgrades.shieldArmor += 1;
            
            // Telefon Titreşimi (Haptic Feedback Altyapısı)
            if (navigator.vibrate) navigator.vibrate(50);
            
            updateUiDisplays();
        } else {
            alert("Yetersiz Kozmik Işıltı! ✨");
        }
    });
}

// Tek Kullanımlık Güçlendirme Satın Alma Fonksiyonu
function buyPowerup(type, cost) {
    if (window.GameState.stardust >= cost) {
        window.GameState.stardust -= cost;
        window.GameState.powerups[type] += 1;
        
        if (navigator.vibrate) navigator.vibrate(30);
        
        updateUiDisplays();
    } else {
        alert("Yetersiz Kozmik Işıltı! ✨");
    }
}

if (UI.btnBuyFreeze) UI.btnBuyFreeze.addEventListener('click', () => buyPowerup('freeze', SHOP_CONFIG.freeze.cost));
if (UI.btnBuyMagnet) UI.btnBuyMagnet.addEventListener('click', () => buyPowerup('magnet', SHOP_CONFIG.magnet.cost));
if (UI.btnBuySupernova) UI.btnBuySupernova.addEventListener('click', () => buyPowerup('supernova', SHOP_CONFIG.supernova.cost));

// 6. DOSYA İLK AÇILDIĞINDA EKRANI GÜNCELLE
updateUiDisplays();
