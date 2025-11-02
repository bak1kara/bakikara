/* ==================================== */
/* SCRIPT.JS - ANA İŞLEVSELLİK */
/* ==================================== */

document.addEventListener('DOMContentLoaded', () => {
    const discordCard = document.getElementById('discord-card');
    const backgroundMusic = document.getElementById('background-music');
    const musicToggle = document.getElementById('music-toggle');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    // visitorCountTextElement artık Busuanzi ile kullanılmadığı için kaldırıldı.

    // Müzik Kontrolleri
    let isMusicManuallyPaused = false; 
    backgroundMusic.volume = 0.5; 
    volumeSlider.value = 0.5;
    
    const updateVolumeIcon = (volume, isMuted) => {
        if (isMuted || volume === 0) {
            volumeIcon.textContent = '🔇';
            musicToggle.classList.add('paused');
        } else if (volume < 0.5) {
            volumeIcon.textContent = '🔉';
            musicToggle.classList.remove('paused');
        } else {
            volumeIcon.textContent = '🔊';
            musicToggle.classList.remove('paused');
        }
    };
    
    updateVolumeIcon(backgroundMusic.volume, backgroundMusic.muted); 


    // Otomatik oynatma kısıtlamasını aşmak için kullanıcı etkileşimini dinle
    const handleFirstInteraction = () => {
         if (backgroundMusic.muted) {
            backgroundMusic.muted = false;
            volumeSlider.value = backgroundMusic.volume;
            updateVolumeIcon(backgroundMusic.volume, backgroundMusic.muted);
         }

         if (backgroundMusic.paused) {
             backgroundMusic.play().catch(error => {
                 console.error("Oynatma hatası:", error);
             });
         }

         document.removeEventListener('click', handleFirstInteraction);
         document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);


    // Sesi açma/kapama fonksiyonu
    musicToggle.addEventListener('click', () => {
        if (backgroundMusic.muted || backgroundMusic.volume === 0) {
            backgroundMusic.muted = false; 
            backgroundMusic.volume = 0.5;
            volumeSlider.value = 0.5; 
            backgroundMusic.play().catch(error => console.error("Oynatma hatası:", error));
            isMusicManuallyPaused = false;
        } else {
            backgroundMusic.volume = 0;
            volumeSlider.value = 0;
            backgroundMusic.pause();
            isMusicManuallyPaused = true;
        }
        updateVolumeIcon(backgroundMusic.volume, backgroundMusic.muted);
    });

    // Ses seviyesi kontrolü
    volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        backgroundMusic.volume = volume;
        
        if (volume > 0) {
             backgroundMusic.muted = false;
             if (backgroundMusic.paused && !isMusicManuallyPaused) {
                 backgroundMusic.play().catch(error => console.error("Oynatma hatası:", error));
             }
        } else {
             backgroundMusic.pause();
             isMusicManuallyPaused = true;
        }
        
        updateVolumeIcon(backgroundMusic.volume, backgroundMusic.muted);
    });

    // ====================================
    // DISCORD LANYARD API ENTEGRASYONU (Flickering düzeltildi)
    // ====================================
    const DISCORD_ID = '1252284892457468026'; 
    const LANYARD_API_URL = `https://api.lanyard.rest/v1/users/${DISCORD_ID}`;

    const fetchDiscordStatus = () => {
        // Flickering'i önlemek için: Kartı yumuşakça gizle
        discordCard.style.opacity = '0'; 

        // 500ms sonra (CSS transition süresi kadar) veriyi çekmeye başla
        setTimeout(() => {
            
            fetch(LANYARD_API_URL)
                .then(response => response.json())
                .then(data => {
                    const user = data.data;

                    if (!user || user.listening_to_spotify === undefined) {
                        throw new Error("Discord verileri alınamadı.");
                    }

                    const status = user.discord_status || 'offline';
                    let statusColor;
                    
                    switch (status) {
                        case 'online': statusColor = '#43B581'; break; 
                        case 'idle': statusColor = '#FAA61A'; break;
                        case 'dnd': statusColor = '#F04747'; break;
                        case 'invisible':
                        case 'offline':
                        default: statusColor = '#747F8D'; break;
                    }

                    let activityText = 'Şu anda bir aktivite yok...';
                    
                    if (user.listening_to_spotify) {
                        activityText = `Dinliyor: <strong>${user.spotify.song}</strong> - ${user.spotify.artist}`;
                    } 
                    else if (user.activities && user.activities.length > 0) {
                        const activity = user.activities.find(act => act.type === 0 || act.type === 1 || act.type === 4); 
                        
                        if (activity) {
                            if (activity.type === 0) {
                                activityText = `Oynuyor: <strong>${activity.name}</strong>`;
                            } else if (activity.type === 1) {
                                activityText = `Yayın yapıyor: <strong>${activity.name}</strong>`;
                            } else if (activity.type === 4) {
                                 activityText = `Durum: <strong>${activity.state || activity.name || 'Özel Durum'}</strong>`;
                            }
                        }
                    }
                    
                    
                    const avatarUrl = `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${user.discord_user.avatar}.png?size=1024`;
                    const tag = user.discord_user.discriminator === '0' ? '' : `#${user.discord_user.discriminator}`;
                    const displayName = user.discord_user.global_name || user.discord_user.username;


                    // İçeriği güncelle (Gizliyken yapıldığı için göz kırpma olmaz)
                    discordCard.innerHTML = `
                        <div class="discord-header">
                            <div style="position: relative;">
                                <img src="${avatarUrl}" alt="Avatar" class="discord-avatar">
                                <span class="status-dot" style="background-color: ${statusColor}; position: absolute; bottom: 0; right: 0;">
                                </span>
                            </div>
                            
                            <div class="username-and-tag">
                                <span class="discord-username">${displayName}</span>
                                <span class="discord-tag">${tag}</span>
                            </div>
                        </div>

                        <div class="status-indicator-wrapper">
                            <span class="discord-status">${activityText}</span>
                        </div>
                    `;
                    discordCard.classList.remove('loading');
                    
                    // Kartı tekrar göster (Yumuşak geçiş CSS tarafından sağlanacak)
                    discordCard.style.opacity = '1';

                })
                .catch(error => {
                    console.error("Discord verileri çekilirken hata oluştu:", error);
                    discordCard.innerHTML = `<span style="color: #f04747; display: block; text-align: center; padding: 10px;">Discord verileri yüklenemedi. (API Hatası)</span>`;
                    discordCard.classList.remove('loading');
                    
                    discordCard.style.opacity = '1';
                });
        }, 500); 
    };

    // ====================================
    // ZİYARETÇİ SAYACI (Eski API kodları kaldırıldı)
    // Busuanzi sayacı artık doğrudan HTML'den çalışır.
    // ====================================


    // İlk çalıştırma ve yenileme
    fetchDiscordStatus();
    // fetchVisitorCount() kaldırıldı
    setInterval(fetchDiscordStatus, 10000); 
});
