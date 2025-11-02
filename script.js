/* JavaScript dosyanızın güncellenmiş hali */

document.addEventListener('DOMContentLoaded', () => {
    const discordCard = document.getElementById('discord-card');
    const backgroundMusic = document.getElementById('background-music');
    const musicToggle = document.getElementById('music-toggle');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    const visitorCountTextElement = document.getElementById('visitor-count-text');

    // Müzik Kontrolleri
    let isMusicManuallyPaused = true; // Kullanıcı müziği bilerek kapattıysa
    
    // Tarayıcılar kısıtladığı için başlangıçta her zaman 0 ve duraklatılmış (muted)
    backgroundMusic.volume = 0;
    volumeSlider.value = 0;
    
    // İkonu güncelleyen yardımcı fonksiyon
    const updateVolumeIcon = (volume) => {
        if (volume > 0) {
            volumeIcon.textContent = '🔊'; // Sesli
            musicToggle.classList.remove('paused');
        } else {
            volumeIcon.textContent = '🔇'; // Sessiz
            musicToggle.classList.add('paused');
        }
    };
    
    updateVolumeIcon(backgroundMusic.volume); // Başlangıç ikonunu ayarla

    // Sesi açma/kapama fonksiyonu
    musicToggle.addEventListener('click', () => {
        if (isMusicManuallyPaused) {
            // Müzik kapalıysa, aç
            backgroundMusic.play().then(() => {
                isMusicManuallyPaused = false;
                // Eğer slider 0'da ise, sesi 0.5'e ayarla ve slider'ı güncelle
                if (volumeSlider.value == 0) {
                    backgroundMusic.volume = 0.5;
                    volumeSlider.value = 0.5;
                }
                updateVolumeIcon(backgroundMusic.volume);
            }).catch(error => {
                console.error("Oynatma hatası:", error);
                alert("Müzik otomatik olarak başlatılamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.");
            });
        } else {
            // Müzik açıksa, kapat
            backgroundMusic.pause();
            isMusicManuallyPaused = true;
            updateVolumeIcon(0); // İkonu susturulmuş yap
        }
    });

    // Ses seviyesi kontrolü
    volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        backgroundMusic.volume = volume;

        // Ses seviyesine göre ikon güncelleme
        updateVolumeIcon(volume);

        if (volume > 0) {
             // Slider 0'dan yukarı çekilirse, manuel duraklatma durumunu sıfırla ve oynatmayı dene
             isMusicManuallyPaused = false;
             if (backgroundMusic.paused) {
                 backgroundMusic.play().catch(error => {
                     console.error("Oynatma hatası:", error);
                 });
             }
        } else {
             // Ses 0'a inerse, manuel olarak duraklatılmış kabul et ve durdur
             backgroundMusic.pause();
             isMusicManuallyPaused = true;
        }
    });
    // --- Müzik Kontrolleri Sonu ---


    // Discord API'den verileri çekme ve kart güncelleme (Aynı kaldı)
    const DISCORD_ID = '1252284892457468026';
    const LANYARD_API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;

    const fetchDiscordStatus = () => {
        // ... (Bu kısım önceki düzeltme ile aynı kalır) ...
        discordCard.innerHTML = `<div class="loading"></div>`; 

        fetch(LANYARD_API_URL)
            .then(response => response.json())
            .then(data => {
                const user = data.data;

                if (!user || user.listening_to_spotify === undefined) {
                    throw new Error("Discord verileri alınamadı.");
                }

                // 1. Durum Rengi
                const status = user.discord_status || 'offline';
                let statusColor;
                switch (status) {
                    case 'online': statusColor = '#43B581'; break;
                    case 'idle': statusColor = '#FAA61A'; break;
                    case 'dnd': statusColor = '#F04747'; break;
                    default: statusColor = '#747F8D'; 
                }

                // 2. Aktivite
                let activityText = 'Şu anda bir aktivite yok...';
                let activityDotColor = 'transparent';
                let activityDotVisible = false;
                
                // Spotify'ı kontrol et 
                if (user.listening_to_spotify) {
                    activityText = `Dinliyor: <strong>${user.spotify.song}</strong> - ${user.spotify.artist}`;
                    activityDotColor = '#1DB954';
                    activityDotVisible = true;
                } 
                // Diğer aktiviteleri kontrol et
                else if (user.activities && user.activities.length > 0) {
                    const activity = user.activities.find(act => act.type === 0 || act.type === 1 || act.type === 4); 
                    
                    if (activity) {
                        activityDotVisible = true;
                        if (activity.type === 0) {
                            activityText = `Oynuyor: <strong>${activity.name}</strong>`;
                            activityDotColor = '#5865f2'; 
                        } else if (activity.type === 1) {
                            activityText = `Yayın yapıyor: <strong>${activity.name}</strong>`;
                            activityDotColor = '#9400D3';
                        } else if (activity.type === 4) {
                             activityText = `Durum: <strong>${activity.state || activity.name || 'Özel Durum'}</strong>`;
                             activityDotColor = '#747F8D';
                        }
                    }
                }

                // Avatar URL'sini ve Tag kontrolünü düzeltme
                const avatarUrl = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.discord_user.avatar}.png?size=1024`;
                const tag = user.discord_user.discriminator === '0' ? '' : `#${user.discord_user.discriminator}`;


                // 3. Kartı HTML ile güncelleme
                discordCard.innerHTML = `
                    <div class="discord-header">
                        <div style="position: relative;">
                            <img src="${avatarUrl}" alt="Avatar" class="discord-avatar">
                            <span class="status-dot" style="background-color: ${statusColor}; position: absolute; bottom: 0; right: 0;"></span>
                        </div>
                        
                        <div>
                            <span class="discord-username">${user.discord_user.global_name || user.discord_user.username}</span>
                            <span class="discord-tag">${tag}</span>
                        </div>
                    </div>

                    <div class="status-indicator-wrapper">
                        ${activityDotVisible ? `<span class="activity-dot" style="background-color: ${activityDotColor};"></span>` : ''}
                        <span class="discord-status">${activityText}</span>
                    </div>
                `;
                discordCard.classList.remove('loading');

            })
            .catch(error => {
                console.error("Discord verileri çekilirken hata oluştu:", error);
                discordCard.innerHTML = `<span style="color: #f04747; display: block; text-align: center; padding: 10px;">Discord verileri yüklenemedi. (API Hatası)</span>`;
                discordCard.classList.remove('loading');
            });
    };


    // Sayaç için CountAPI.xyz entegrasyonu (Aynı kaldı)
    const COUNT_API_NAMESPACE = 'https://bak1kara.github.io/bakikara/';
    const COUNT_API_KEY = 'bakikara';

    const fetchVisitorCount = () => {
        fetch(`https://api.countapi.xyz/hit/${COUNT_API_NAMESPACE}/${COUNT_API_KEY}`)
            .then(response => response.json())
            .then(data => {
                if (visitorCountTextElement) {
                    visitorCountTextElement.textContent = data.value.toLocaleString('tr-TR'); // Sayıyı formatla
                }
            })
            .catch(error => {
                console.error("Sayaç verileri çekilirken hata oluştu:", error);
                if (visitorCountTextElement) {
                    visitorCountTextElement.textContent = '???';
                }
            });
    };

    // İlk yüklemede Discord ve Sayaç verilerini çek
    fetchDiscordStatus();
    fetchVisitorCount();

    // Discord durumunu her 10 saniyede bir güncelle
    setInterval(fetchDiscordStatus, 10000); 
});
