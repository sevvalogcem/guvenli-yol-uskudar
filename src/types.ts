export interface LocationData {
  id: string; // Unique generated ID
  name: string; // Mekan Adı
  address: string; // Adres
  safetyScore: number; // Güvenlik Puanı (calculated or parsed)
  lightingStatus: string; // Aydınlatma Durumu (İyi, Orta, Kötü vs)
  hasCamera: boolean; // Kamera Varlığı
  comments: string; // Kullanıcı Yorumları
  lat?: number;
  lng?: number;
  categoryName?: string; // Sütunlardan okunan orijinal kategori ismi
  facilityType?: 'polis' | 'itfaiye' | 'benzinlik' | 'saglik' | 'market' | 'food' | 'standart';
  imageUrl?: string; // Mekan Görseli
}
