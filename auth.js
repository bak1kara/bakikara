// auth.js - FULL Yetkilendirme (Auth) ve UI Yönetimi

// NOT: Bu dosyanın çalışması için HTML dosyanızda <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// kütüphanesinin yüklenmiş olması gerekmektedir.

// --- KRİTİK SABİTLER (DEĞİŞMEYENLER) ---
const SUPABASE_URL = 'https://ywxhworspkocuzsygsgc.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eGh3b3JzcGtvY3V6c3lnc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzEzMTcsImV4cCI6MjA3ODAwNzMxN30.x7IMaG9C1bF8_RIbv50NfyeymsTu5cwsBRnQy9ZRa8Y'; 
const RENDER_API_URL = 'https://sosyalpro-api-1.onrender.com'; 

// Supabase istemcisini oluştur
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// =========================================================================
// UI YÖNETİMİ: Giriş Durumuna Göre Arayüzü Günceller
// =========================================================================

/**
 * Kullanıcı oturum durumuna göre navigasyon/header elementlerini ve yorum formunu günceller.
 * @param {Object} user - Supabase'den gelen kullanıcı nesnesi (varsa).
 */
function updateAuthStatus(user) {
    const authButtons = document.getElementById('auth-buttons');         // Giriş Yap/Kayıt Ol butonu div'i
    const profileArea = document.getElementById('profile-area');         // Profil/Çıkış butonu div'i
    const userInfo = document.getElementById('user-info');               // Kullanıcı adı/e-posta gösterim alanı

    // Yorum Bölümü UI Elementleri
    const authFormArea = document.getElementById('auth-form-area');      // Giriş/Kayıt formu div'i
    const commentInputArea = document.getElementById('comment-input-area'); // Yorum gönderme formu div'i

    if (user) {
        // --- Oturum Açık ---
        // 1. Header'ı Güncelle
        if (authButtons) authButtons.classList.add('hidden');
        if (profileArea) profileArea.classList.remove('hidden');
        
        // Kullanıcı adını göster (Metadata'dan veya e-postadan)
        const userName = user.user_metadata?.full_name || user.email.split('@')[0];
        if (userInfo) userInfo.textContent = `Hoş Geldiniz, ${userName}!`;

        // 2. Yorum Formunu Güncelle
        if (authFormArea) authFormArea.classList.add('hidden');
        if (commentInputArea) commentInputArea.classList.remove('hidden');

    } else {
        // --- Oturum Kapalı ---
        // 1. Header'ı Güncelle
        if (authButtons) authButtons.classList.remove('hidden');
        if (profileArea) profileArea.classList.add('hidden');
        
        // 2. Yorum Formunu Güncelle
        if (authFormArea) authFormArea.classList.remove('hidden');
        if (commentInputArea) commentInputArea.classList.add('hidden');
    }
}


// =========================================================================
// YETKİLENDİRME (AUTH) FONKSİYONLARI
// =========================================================================

/**
 * Kullanıcının giriş yapmasını veya kaydolmasını sağlar (Form tarafından çağrılır).
 * Bu, HTML'deki 'auth-form' submit olayında kullanılacaktır.
 */
async function handleAuthSubmit(e) {
    e.preventDefault();
    
    const isSignUp = document.getElementById('auth-title').textContent.includes('Kayıt Ol');
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    let result = false;

    if (isSignUp) {
        // Kayıt Olma İşlemi
        const fullName = email.split('@')[0]; // Basit bir full name ataması
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: { data: { full_name: fullName } }
        });

        if (error) {
            console.error('Kayıt Hatası:', error.message);
            showAlert(`Kayıt sırasında bir hata oluştu: ${error.message}`);
        } else {
            console.log("Kayıt Başarılı:", data);
            showAlert("Kayıt başarılı! Lütfen e-postanızı kontrol ederek hesabınızı onaylayın.");
            result = true;
        }

    } else {
        // Giriş Yapma İşlemi
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error('Giriş Hatası:', error.message);
            showAlert(`Giriş sırasında bir hata oluştu: ${error.message}`);
        } else {
            console.log("Giriş Başarılı:", data.user);
            showAlert("Giriş başarılı! Hoş geldiniz.");
            // onAuthStateChange event'i UI'ı güncelleyecektir.
            result = true;
        }
    }
    return result;
}


/**
 * Kullanıcının oturumunu sonlandırır.
 */
async function handleSignOut() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        console.log("Çıkış Başarılı");
        showAlert("Başarıyla çıkış yapıldı.");
    } catch (error) {
        console.error('Çıkış Hatası:', error.message);
        showAlert(`Çıkış sırasında bir hata oluştu: ${error.message}`);
    }
}


// =========================================================================
// YORUM FONKSİYONLARI
// =========================================================================

/**
 * Belirtilen sayfa için yorumları API üzerinden çeker.
 * @param {string} pageSlug - Yorumların çekileceği sayfanın slug'ı.
 * @returns {Promise<Array|null>} Yorum dizisi veya hata durumunda null.
 */
async function loadComments(pageSlug) {
    // API isteği yaparken pageSlug kullanılacak
    try {
        const response = await fetch(`${RENDER_API_URL}/api/comments/${pageSlug}`);
        if (!response.ok) {
            console.error(`Hata: ${response.status} - Yorumlar yüklenemedi.`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('API isteği sırasında hata:', error);
        return null;
    }
}

/**
 * Yeni bir yorumu API'ye gönderir.
 * @param {string} pageSlug - Yorumun ait olduğu sayfanın slug'ı.
 * @param {string} userId - Yorumu yapan kullanıcının ID'si.
 * @param {string} userName - Yorumu yapan kullanıcının adı.
 * @param {string} commentText - Yorum metni.
 * @returns {Promise<Object|null>} Gönderilen yorum nesnesi veya hata durumunda null.
 */
async function sendComment(pageSlug, userId, userName, commentText) {
    try {
        const response = await fetch(`${RENDER_API_URL}/api/comments/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                page_slug: pageSlug,
                user_id: userId,
                user_name: userName,
                comment_text: commentText
            })
        });

        if (!response.ok) {
            console.error(`Hata: ${response.status} - Yorum gönderme başarısız.`);
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('Yorum gönderilirken API hatası:', error);
        return null;
    }
}


// =========================================================================
// İLK BAŞLATMA VE OTURUM DİNLEME
// =========================================================================

document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. Oturum Kontrolü ve UI Güncellemesi ---
    const { data: { session } } = await supabase.auth.getSession();
    updateAuthStatus(session?.user);

    // --- 2. Auth Durumu Dinleme ---
    supabase.auth.onAuthStateChange((event, session) => {
        // Oturum değiştiğinde (Giriş/Çıkış) UI'ı otomatik güncelle
        updateAuthStatus(session?.user);
        
        // Eğer yorum bölümü varsa, yorumları tekrar yükle
        if (window.CURRENT_PAGE_SLUG) {
            // Yorumları yeniden yükleme fonksiyonu burada çağrılmalıdır.
            // loadComments(window.CURRENT_PAGE_SLUG); 
        }
    });

    // --- 3. Event Listener'lar ---

    // A. Çıkış Butonu
    const signOutButton = document.getElementById('logout-button'); // HTML'deki ID'ye göre düzeltildi
    if (signOutButton) {
        signOutButton.addEventListener('click', handleSignOut);
    }
    
    // B. Giriş/Kayıt Formu Listener'ı
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }
    
    // C. Giriş/Kayıt Modu Değiştirme Butonu
    const toggleAuthModeButton = document.getElementById('toggle-auth-mode');
    const authTitle = document.getElementById('auth-title');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    if (toggleAuthModeButton && authTitle && authSubmitBtn) {
        toggleAuthModeButton.addEventListener('click', () => {
            if (authTitle.textContent.includes('Giriş Yap')) {
                authTitle.textContent = 'Yeni Hesap Oluştur (Kayıt Ol)';
                authSubmitBtn.textContent = 'Kayıt Ol';
                toggleAuthModeButton.textContent = 'Zaten Hesabım Var (Giriş Yap)';
            } else {
                authTitle.textContent = 'Giriş Yap veya Kayıt Ol';
                authSubmitBtn.textContent = 'Giriş Yap';
                toggleAuthModeButton.textContent = 'Kayıt Ol';
            }
        });
    }

    // D. Yorum Gönderme Formu Listener'ı
    const commentForm = document.getElementById('yorum-gonder-formu');
    if (commentForm && window.CURRENT_PAGE_SLUG) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const commentText = document.getElementById('comment-content').value;
            const { data: { user } } = await supabase.auth.getSession();
            
            if (!user) {
                showAlert('Yorum göndermek için lütfen önce giriş yapın.', 'red');
                return;
            }
            
            const userId = user.id;
            const userName = user.user_metadata?.full_name || user.email.split('@')[0];

            const result = await sendComment(window.CURRENT_PAGE_SLUG, userId, userName, commentText);
            
            if (result) {
                showAlert('Yorumunuz başarıyla gönderildi!');
                commentForm.reset();
                // Yorumlar listesini güncelle (Bu fonksiyon HTML'inizde görünmüyorsa yorum listesi güncellenmeyecektir)
                // loadComments(window.CURRENT_PAGE_SLUG);
            }
        });
    }
    
    // E. Sayfa Yüklendiğinde Yorumları Çekme
    if (window.CURRENT_PAGE_SLUG) {
        // loadComments(window.CURRENT_PAGE_SLUG);
        // NOT: Yorum listesini HTML'de nasıl göstereceğiniz (renderComments) 
        // fonksiyonu tanımlanmadığı için bu satır şimdilik yorum satırı olarak bırakılmıştır.
    }
});
