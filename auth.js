// auth.js - FULL Yetkilendirme (Auth) ve UI Yönetimi

// Not: Bu dosyanın çalışması için 'createClient' fonksiyonunun
// (örneğin Supabase JS kütüphanesinden) ve diğer Auth form/UI elementlerinin
// HTML'de mevcut olması gerekir.

// --- KRİTİK SABİTLER (DEĞİŞMEYENLER) ---
const SUPABASE_URL = 'https://ywxhworspkocuzsygsgc.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eGh3b3JzcGtvY3V6c3lnc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzEzMTcsImV4cCI6MjA3ODAwNzMxN30.x7IMaG9C1bF8_RIbv50NfyeymsTu5cwsBRnQy9ZRa8Y'; 
const RENDER_API_URL = 'https://sosyalpro-api-1.onrender.com'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// =========================================================================
// UI YÖNETİMİ: Giriş Durumuna Göre Arayüzü Günceller
// =========================================================================

/**
 * Kullanıcı oturum durumuna göre navigasyon/header elementlerini günceller.
 * @param {Object} user - Supabase'den gelen kullanıcı nesnesi (varsa).
 */
function updateAuthStatus(user) {
    const authButtons = document.getElementById('auth-buttons'); // Giriş Yap/Kayıt Ol butonlarını içeren div
    const profileSection = document.getElementById('profile-section'); // Profil kartı ve Çıkış butonunu içeren div
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');

    if (user) {
        // Kullanıcı Giriş Yapmışsa (Oturum Açık)
        if (authButtons) authButtons.classList.add('hidden');
        if (profileSection) profileSection.classList.remove('hidden');
        
        // Kullanıcı adını/e-postasını gösterme
        if (profileName) profileName.textContent = user.user_metadata?.full_name || 'Kullanıcı';
        if (profileEmail) profileEmail.textContent = user.email;

    } else {
        // Kullanıcı Çıkış Yapmışsa (Oturum Kapalı)
        if (authButtons) authButtons.classList.remove('hidden');
        if (profileSection) profileSection.classList.add('hidden');
    }
}


// =========================================================================
// YETKİLENDİRME (AUTH) FONKSİYONLARI
// =========================================================================

/**
 * Yeni kullanıcı kaydı oluşturur.
 * @param {string} email - Kullanıcı e-posta adresi.
 * @param {string} password - Kullanıcı şifresi.
 */
async function handleSignUp(email, password, fullName) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName // Opsiyonel: Kullanıcı metadata'sına ad ekleme
                }
            }
        });

        if (error) throw error;

        // Kayıt başarılı. Supabase, doğrulama e-postası gönderir.
        console.log("Kayıt Başarılı:", data);
        alert("Kayıt başarılı! Lütfen e-postanızı kontrol ederek hesabınızı onaylayın.");
        return true;
    } catch (error) {
        console.error('Kayıt Hatası:', error.message);
        alert(`Kayıt sırasında bir hata oluştu: ${error.message}`);
        return false;
    }
}

/**
 * Kullanıcının giriş yapmasını sağlar.
 * @param {string} email - Kullanıcı e-posta adresi.
 * @param {string} password - Kullanıcı şifresi.
 */
async function handleSignIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) throw error;

        // Giriş başarılı. updateAuthStatus, onAuthStateChange listener'ı tarafından otomatik tetiklenecek.
        console.log("Giriş Başarılı:", data.user);
        alert("Giriş başarılı! Hoş geldiniz.");
        return true;
    } catch (error) {
        console.error('Giriş Hatası:', error.message);
        alert(`Giriş sırasında bir hata oluştu: ${error.message}`);
        return false;
    }
}

/**
 * Kullanıcının oturumunu sonlandırır.
 */
async function handleSignOut() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) throw error;

        // Çıkış başarılı. updateAuthStatus otomatik olarak tetiklenir.
        console.log("Çıkış Başarılı");
        alert("Başarıyla çıkış yapıldı.");
    } catch (error) {
        console.error('Çıkış Hatası:', error.message);
        alert(`Çıkış sırasında bir hata oluştu: ${error.message}`);
    }
}


// =========================================================================
// YORUM FONKSİYONLARI (Önceki versiyondan alınmıştır)
// =========================================================================

async function loadComments(pageSlug) {
    // ... API isteği yaparken pageSlug kullanılacak ...
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

async function sendComment(pageSlug, userId, userName, commentText) {
    // ... Yorum gönderme mantığı ...
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
    // 1. Sayfa yüklendiğinde mevcut oturumu kontrol et ve UI'ı güncelle
    const { data: { session } } = await supabase.auth.getSession();
    updateAuthStatus(session?.user);

    // 2. Auth durumundaki değişiklikleri (Giriş/Çıkış) sürekli dinle
    supabase.auth.onAuthStateChange((event, session) => {
        // Oturum değiştiğinde (SIGN_IN, SIGN_OUT, vb.) UI'ı otomatik güncelle
        updateAuthStatus(session?.user);

        // Örnek: Çıkış butonuna basıldığında oturum kapandığı için bu event tetiklenir.
        if (event === 'SIGNED_OUT') {
            // Çıkış yapıldığında ek işlemler (örn: formu temizleme)
            console.log('Kullanıcı oturumu kapattı.');
        }
    });

    // 3. Çıkış butonuna dinleyici ekleme (Bu butonun id'si 'sign-out-button' olmalıdır)
    const signOutButton = document.getElementById('sign-out-button');
    if (signOutButton) {
        signOutButton.addEventListener('click', handleSignOut);
    }
    
    // NOT: Giriş/Kayıt formlarının Event Listener'ları, form elementleri bu dosyada
    // tanımlı olmadığı için, HTML sayfasından veya ayrı bir form.js dosyasından çağrılmalıdır.
});
