// ** Ayarlar **
const DISCORD_USER_ID = '1252284892457468026'; // KENDİ DISCORD ID'NİZİ BURAYA YAZMALISINIZ
const LANYARD_API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;
const cardElement = document.getElementById('discord-card');

// 1. MÜZİK KONTROLÜ (YENİ VE SEVİYELİ)
const music = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');

// Başlangıç ayarları: Ses kapalı (0)
music.volume = 0; 
volumeSlider.value = 0;

// Ses seviyesi değişince müzik sesini ayarla
volumeSlider.addEventListener('input', () => {
    music.volume = volumeSlider.value;
    updateVolumeIcon(music.volume);
    
    // Ses açılırsa "paused" sınıfını kaldır, tam kapanırsa ekle
    if (music.volume > 0) {
        musicToggle.classList.remove('paused');
    } else {
        musicToggle.classList.add('paused');
    }
});

// Ses seviyesine göre emojiyi güncelleyen fonksiyon
function updateVolumeIcon(volume) {
    const vol = parseFloat(volume);
    if (vol === 0) {
        volumeIcon.textContent = '🔇'; // Sessiz
    } else if (vol <= 0.4) {
        volumeIcon.textContent = '🔈'; // Düşük
    } else if (vol <= 0.7) {
        volumeIcon.textContent = '🔉'; // Orta
    } else {
        volumeIcon.textContent = '🔊'; // Yüksek
    }
}


// Mute/Unmute düğmesine basıldığında
musicToggle.addEventListener('click', () => {
    if (music.volume > 0 || !music.paused) {
        // Şu an ses açıksa veya çalıyorsa, kapat
        music.volume = 0;
        volumeSlider.value = 0;
        music.pause(); // Müzik durdurulur
        musicToggle.classList.add('paused');
    } else {
        // Şu an kapalıysa, sesi varsayılan olarak 0.5'e aç ve oynat
        music.volume = 0.5; 
        volumeSlider.value = 0.5;
        music.play();
        musicToggle.classList.remove('paused');
    }
    updateVolumeIcon(music.volume);
});

// Kullanıcının ilk etkileşimini yakalama (Tarayıcı kısıtlamaları için)
function handleFirstInteraction() {
    document.body.removeEventListener('click', handleFirstInteraction);
    
    // Sadece play'i deneriz, ses seviyesi 0'da kalır
    music.play().catch(e => {
        console.error("Müzik çalma engellendi, manuel başlatılması gerekiyor.");
    });
}

document.body.addEventListener('click', handleFirstInteraction, { once: true });


// 2. DİSCORD VERİ ÇEKME VE GÜNCELLEME
async function fetchDiscordData() {
    try {
        const response = await fetch(LANYARD_API_URL);
        const data = await response.json();

        if (data.success && data.data) {
            const user = data.data;
            updateDiscordCard(user);
        } else {
            showOfflineState();
        }
    } catch (error) {
        console.error("Lanyard API hatası:", error);
        showOfflineState();
    }
    
    // Her 10 saniyede bir verileri güncelle
    setTimeout(fetchDiscordData, 10000); 
}

function updateDiscordCard(user) {
    let activityText = 'Şu an Boşta...';
    // Discord CDN'den yüksek çözünürlüklü avatar çekme
    let avatarUrl = `https://cdn.discordapp.com/avatars/${user.discord_user.id}/${user.discord_user.avatar}.png?size=256`;
    
    // Aktivite kontrolü (Oynadığı oyun, dinlediği müzik vb.)
    if (user.activities && user.activities.length > 0) {
        const activity = user.activities.find(act => act.type === 0 || act.type === 2); 
        if (activity) {
            activityText = `Şu an ${activity.name}`;
            if (activity.details) {
                 activityText += `: ${activity.details}`;
            }
        }
    }
    
    // Kartın HTML içeriğini oluştur
    cardElement.innerHTML = `
        <div class="discord-header">
            <img src="${avatarUrl}" alt="${user.discord_user.username}" class="discord-avatar">
            <div>
                <span class="discord-username">${user.discord_user.username}</span>
                <span class="discord-tag">#${user.discord_user.discriminator}</span>
            </div>
        </div>
        <div class="discord-status">
            Durum: <strong>${user.discord_status === 'online' ? 'Çevrimiçi' : user.discord_status === 'idle' ? 'Boşta' : 'Çevrimdışı'}</strong>
        </div>
        <div class="discord-status">
            Aktivite: <strong>${activityText}</strong>
        </div>
    `;

    cardElement.style.display = 'block';
    cardElement.classList.add('active'); // CSS animasyonunu tetikle
}

function showOfflineState() {
     cardElement.innerHTML = `
        <div class="discord-header">
            <img src="avatar_placeholder.png" alt="Çevrimdışı" class="discord-avatar">
            <span class="discord-username">Veri Çekilemiyor</span>
        </div>
        <div class="discord-status">
            Durum: <strong>Çevrimdışı</strong>
        </div>
        <div class="discord-status">
            Aktivite: <strong>Lütfen Discord ID'nizi ve Lanyard servisini kontrol edin.</strong>
        </div>
    `;
    cardElement.style.display = 'block';
    cardElement.classList.add('active');
}

// Uygulamayı Başlat
document.addEventListener('DOMContentLoaded', fetchDiscordData);
