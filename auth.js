// auth.js - FULL Yetkilendirme (Auth), UI ve Yorum Yönetimi

// NOT: Bu dosyanın çalışması için HTML dosyanızda <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// kütüphanesinin yüklenmiş olması gerekmektedir.

// --- KRİTİK SABİTLER (DEĞİŞMEYENLER) ---
const SUPABASE_URL = 'https://ywxhworspkocuzsygsgc.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eGh3b3JzcGtvY3V6c3lnc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzEzMTcsImV4cCI6MjA3ODAwNzMxN30.x7IMaG9C1bF8_RIbv50NfyeymsTu5cwsBRnQy9ZRa8Y'; 
const RENDER_API_URL = 'https://sosyalpro-api-1.onrender.com'; 

// Supabase istemcisini oluştur
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Form Durumu
let isSignUpMode = false; // Başlangıçta Giriş Yap modunda

// Global Alert Kutusu (sosyal.html'den gelir)
if (typeof showAlert !== 'function') {
    // showAlert HTML'de tanımlı değilse hata vermemek için bir fallback
    window.showAlert = (message, type = 'green') => {
        console.log(`[ALERT] ${type.toUpperCase()}: ${message}`);
    };
}


// =========================================================================
// UI YÖNETİMİ
// =========================================================================

/**
 * Kullanıcı oturum durumuna göre Navbar, Auth Formu ve Yorum Formunu günceller.
 * Bu fonksiyon, kullanıcının giriş yapıp yapmadığını kontrol eder
 * ve UI'da profil kartını gösterir veya gizler.
 * @param {object} session - Supabase oturum nesnesi.
 */
function updateUIForAuth(session) {
    const authButtons = document.getElementById('auth-buttons'); // Giriş/Kayıt butonu alanı (Oturum kapalıyken görünür)
    const profileArea = document.getElementById('profile-area'); // Profil kartı alanı (Oturum açıkken görünür)
    const authFormArea = document.getElementById('auth-form-area'); // Giriş/Kayıt formu alanı
    const commentInputArea = document.getElementById('comment-input-area'); // Yorum gönderme formu alanı
    const userInfo = document.getElementById('user-info'); // Kullanıcı adı gösterim alanı
    
    // Gerekli tüm elemanların var olduğundan emin olun
    if (!authButtons || !profileArea || !authFormArea || !commentInputArea || !userInfo) {
        console.error("KRİTİK HATA: UI elementlerinden biri veya birkaçı bulunamadı.");
        return; 
    }

    if (session?.user) {
        // ⭐ KULLANICI GİRİŞ YAPMIŞ DURUMU (PROFİL KARTI GÖRÜNÜR)
        const email = session.user.email;
        
        // Navbar Düzeltmeleri
        authButtons.classList.add('hidden'); // Giriş/Kayıt butonu gizlenir
        profileArea.classList.remove('hidden'); // Profil alanı GÖRÜNÜR olur

        // Kullanıcı Adını Göster: E-posta adının @'den önceki kısmını alır
        if (userInfo) userInfo.textContent = email ? email.split('@')[0] : 'Kullanıcı'; 

        // Form Düzeltmeleri (Yorum formunu açar)
        authFormArea.classList.add('hidden');
        commentInputArea.classList.remove('hidden');
        
    } else {
        // KULLANICI ÇIKIŞ YAPMIŞ DURUMU (PROFİL KARTI GİZLİ)
        
        // Navbar Düzeltmeleri
        authButtons.classList.remove('hidden'); // Giriş/Kayıt butonu GÖRÜNÜR olur
        profileArea.classList.add('hidden'); // Profil alanı gizlenir

        // Form Düzeltmeleri (Auth formunu açar)
        authFormArea.classList.remove('hidden');
        commentInputArea.classList.add('hidden');
        
        // Formu başlangıç moduna döndür
        setAuthMode(false);
    }
}

/**
 * Giriş Yap ve Kayıt Ol formu arasında geçiş yapar.
 * @param {boolean} isSignUp - Kayıt Ol modu ise true, Giriş Yap modu ise false.
 */
function setAuthMode(isSignUp) {
    isSignUpMode = isSignUp;
    const authTitle = document.getElementById('auth-title');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
    
    if (!authTitle || !authSubmitBtn || !toggleAuthModeBtn) {
        console.error("Auth UI elementleri bulunamadı. setAuthMode çalışamıyor.");
        return;
    }

    if (isSignUp) {
        authTitle.textContent = 'Yeni Hesap Oluştur';
        authSubmitBtn.textContent = 'Kayıt Ol';
        toggleAuthModeBtn.textContent = 'Giriş Yap';
    } else {
        authTitle.textContent = 'Giriş Yap';
        authSubmitBtn.textContent = 'Giriş Yap';
        toggleAuthModeBtn.textContent = 'Kayıt Ol';
    }
}


// =========================================================================
// YETKİLENDİRME (AUTH) İŞLEMLERİ
// =========================================================================

/** Kullanıcı girişini dener. */
async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        showAlert(`Giriş hatası: ${error.message}`, 'red');
        return false;
    }
    showAlert('Başarıyla giriş yaptınız!');
    return true;
}

/** Yeni kullanıcı kaydını dener. */
async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
        showAlert(`Kayıt hatası: ${error.message}`, 'red');
        return false;
    }
    
    // Kayıt başarılı olduğunda kullanıcıyı giriş yapma moduna döndür.
    showAlert('Kayıt başarılı! Lütfen giriş yapın.');
    setAuthMode(false); 
    return true;
}

/** Form gönderimini işler (Giriş veya Kayıt). */
async function handleAuthFormSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    if (!email || password.length < 6) {
        showAlert('E-posta ve en az 6 karakterli şifre girin.', 'red');
        return;
    }
    
    if (isSignUpMode) {
        await signUp(email, password);
    } else {
        await signIn(email, password);
    }
}

/** Kullanıcının oturumunu sonlandırır. */
async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        showAlert(`Çıkış hatası: ${error.message}`, 'red');
    } else {
        showAlert('Başarıyla çıkış yaptınız.');
        updateUIForAuth(null); // UI'ı oturum kapalı duruma getir
    }
}


// =========================================================================
// YORUM İŞLEMLERİ
// =========================================================================

/**
 * Yeni gönderilen yorumu yorum listesine ekler (Geçici Simülasyon).
 */
function renderNewComment(comment) {
    const list = document.getElementById('comments-list');
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) loadingMessage.remove(); 

    const newCommentDiv = document.createElement('div');
    newCommentDiv.className = 'p-5 primary-light rounded-xl border border-slate-700 section-animate';
    newCommentDiv.innerHTML = `
        <p class="text-sm font-semibold text-green-400">${comment.user_name} <span class="text-gray-500 ml-2 font-normal text-xs"> (Şimdi)</span></p>
        <p class="text-gray-300 mt-1">${comment.content}</p>
    `;
    
    list.prepend(newCommentDiv);
}

/** Yorum gönderme simülasyonu */
async function sendComment(pageSlug, userId, userName, content) {
    try {
        // Bu kısım normalde Render API'sine POST atar. Şimdi sadece UI güncellemesi yapıyoruz.
        renderNewComment({
            user_name: userName,
            content: content,
            created_at: new Date().toISOString()
        });
        
        showAlert('Yorumunuz başarıyla gönderildi!', 'green');
        return true; 
    } catch (error) {
        showAlert(`Yorum gönderme hatası: ${error.message}`, 'red');
        return false;
    }
}

// =========================================================================
// ANA İŞLEVLER (DOM YÜKLENDİĞİNDE ÇALIŞIR)
// =========================================================================

document.addEventListener('DOMContentLoaded', async () => {

    // A. Oturum Kontrolü ve UI Güncellemesi
    const { data: { session } } = await supabase.auth.getSession();
    updateUIForAuth(session);
    
    // B. Oturum Değişikliklerini Dinleme
    supabase.auth.onAuthStateChange((event, session) => {
        updateUIForAuth(session);
        // Oturum açılıp kapanınca formu temizle
        const authForm = document.getElementById('auth-form');
        if (authForm) authForm.reset();
    });

    // C. Auth Formu Listener'ları
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', handleAuthFormSubmit);
    }
    
    // D. Giriş/Kayıt Modu Değiştirme
    const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
    if (toggleAuthModeBtn) {
        toggleAuthModeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // isSignUpMode'un tersine ayarlar
            setAuthMode(!isSignUpMode);
            // Mod değişince formu temizle
            if (authForm) authForm.reset(); 
        });
    }

    // E. Çıkış Yap Butonu Listener'ı (Navbar)
    const logoutCta = document.getElementById('logout-button');
    if (logoutCta) {
        logoutCta.addEventListener('click', signOut);
    }
    
    // F. Yorum Gönderme Formu Listener'ı
    const commentForm = document.getElementById('yorum-gonder-formu');
    if (commentForm && window.CURRENT_PAGE_SLUG) { 
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const commentText = document.getElementById('comment-content').value;
            if (!commentText.trim()) {
                 showAlert('Lütfen yorumunuzu yazın.', 'red');
                 return;
            }
            
            const { data: { user } } = await supabase.auth.getSession();
            
            if (!user) {
                showAlert('Yorum göndermek için lütfen önce giriş yapın.', 'red');
                return;
            }
            
            const userId = user.id;
            // Kullanıcı adını, e-posta isminden alıyoruz
            const userName = user.user_metadata?.full_name || user.email.split('@')[0];

            const result = await sendComment(window.CURRENT_PAGE_SLUG, userId, userName, commentText);
            
            if (result) {
                // Başarılıysa form temizlenir (sendComment içinde zaten showAlert çalıştı)
                commentForm.reset();
            }
        });
    }
    
    // G. Yorumları Yükleme Simülasyonu
    const commentsList = document.getElementById('comments-list');
    if (commentsList) {
        // Geçici olarak statik yorumları yükle
        setTimeout(() => {
             const loadingMessage = document.getElementById('loading-message');
             if (loadingMessage) loadingMessage.remove(); 
             
             commentsList.innerHTML = `
                <div class="p-5 primary-light rounded-xl border border-slate-700 section-animate">
                    <p class="text-sm font-semibold text-green-400">Ahmet Yılmaz <span class="text-gray-500 ml-2 font-normal text-xs"> (1 gün önce)</span></p>
                    <p class="text-gray-300 mt-1">Hizmet kalitesi gerçekten harika! Destek ekibi çok hızlı. 5 yıldız.</p>
                </div>
                <div class="p-5 primary-light rounded-xl border border-slate-700 section-animate" style="animation-delay: 0.1s;">
                    <p class="text-sm font-semibold text-green-400">Gizem Demir <span class="text-gray-500 ml-2 font-normal text-xs"> (3 gün önce)</span></p>
                    <p class="text-gray-300 mt-1">Fiyatlar piyasaya göre çok uygun. Instagram takipçileri anında yüklendi. Teşekkürler!</p>
                </div>
             `;
        }, 1000);
    }
});
