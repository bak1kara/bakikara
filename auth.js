// auth.js - Modüler ve Sayfa Bağımsız Sürüm

// Not: Bu dosyanın çalışması için 'createClient' fonksiyonunun
// (örneğin Supabase JS kütüphanesinden) başka bir yerden yüklenmesi gerekir.

// --- KRİTİK SABİTLER (DEĞİŞMEYENLER) ---
const SUPABASE_URL = 'https://ywxhworspkocuzsygsgc.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3eGh3b3JzcGtvY3V6c3lnc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MzEzMTcsImV4cCI6MjA3ODAwNzMxN30.x7IMaG9C1bF8_RIbv50NfyeymsTu5cwsBRnQy9ZRa8Y'; 
const RENDER_API_URL = 'https://sosyalpro-api-1.onrender.com'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


/**
 * Belirtilen sayfa için yorumları API üzerinden çeker.
 * @param {string} pageSlug - Yorumların çekileceği sayfanın slug'ı (örneğin: 'fiyatlar-sayfasi').
 * @returns {Promise<Array|null>} Yorum dizisi veya hata durumunda null.
 */
async function loadComments(pageSlug) {
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

// --- Diğer Yetkilendirme (Auth) Fonksiyonları Buraya Gelecektir ---
// updateAuthStatus, handleSignUp, handleSignIn gibi Supabase ile ilgili 
// genel işlevler bu dosyada kalmalıdır.


// NOT: Sayfaya özel olan YORUM GÖNDERME FORMU Event Listener'ı, 
// 'window.CURRENT_PAGE_SLUG' bağımlılığını ortadan kaldırmak için bu dosyadan kaldırılmıştır.
// Bu listener, pageSlug değerini bildiğiniz HTML dosyasındaki <script> bloğuna taşınmalıdır.
