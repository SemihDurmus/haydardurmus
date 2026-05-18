import type { TranslatedText } from '@shared/types';

export interface BiographyEntry {
  year: number;
  title: TranslatedText;
  description: TranslatedText;
}

export interface ArtistBiography {
  name: string;
  born: number;
  nationality: TranslatedText;
  livesAndWorks: TranslatedText;
  shortBio: TranslatedText;
  fullBio: TranslatedText;
  timeline: BiographyEntry[];
}

export const artistBiography: ArtistBiography = {
  name: 'Haydar Durmuş',
  born: 1975,
  nationality: { en: 'Turkish', tr: 'Türk' },
  livesAndWorks: { en: 'Istanbul, Turkey', tr: 'İstanbul, Türkiye' },
  shortBio: {
    en: 'Haydar Durmuş is a contemporary artist whose work explores the intersection of form, light, and memory. Working primarily in oil on canvas and linen, his paintings are characterized by a quiet intensity that invites prolonged looking.',
    tr: 'Haydar Durmuş, çalışmaları form, ışık ve belleğin kesişimini araştıran çağdaş bir sanatçıdır. Ağırlıklı olarak tuval ve keten üzerine yağlıboya çalışan sanatçının resimleri, uzun süre bakmayı davet eden sessiz bir yoğunlukla karakterize edilir.',
  },
  fullBio: {
    en: 'Haydar Durmuş was born in 1975 in Turkey. He studied at the Mimar Sinan Fine Arts University in Istanbul, where he developed his distinctive approach to abstraction. His work is held in numerous private and public collections in Turkey and Europe.\n\nOver three decades of practice, Durmuş has developed a visual language that navigates between figuration and abstraction, using paint as both subject and material. His large-scale canvases are built up through multiple layers, with each session adding depth and nuance to the overall composition.\n\nHis work has been shown in solo and group exhibitions in Istanbul, Berlin, Paris, and New York.',
    tr: 'Haydar Durmuş, 1975 yılında Türkiye\'de doğdu. İstanbul Mimar Sinan Güzel Sanatlar Üniversitesi\'nde eğitim gördü ve burada soyutlamaya olan özgün yaklaşımını geliştirdi. Eserleri, Türkiye ve Avrupa\'daki çok sayıda özel ve kamu koleksiyonunda yer almaktadır.\n\nOtuz yılı aşkın pratiğinde Durmuş, figürasyon ve soyutlama arasında seyreden; boyayı hem konu hem de malzeme olarak kullanan bir görsel dil geliştirmiştir. Büyük ölçekli tuvalleri birden fazla katman üzerine inşa edilmekte, her seans genel kompozisyona derinlik ve nüans katmaktadır.\n\nEserleri İstanbul, Berlin, Paris ve New York\'ta gerçekleştirilen solo ve grup sergilerde yer almıştır.',
  },
  timeline: [
    {
      year: 2023,
      title: { en: 'Morning Light — Solo Exhibition', tr: 'Sabah Işığı — Kişisel Sergi' },
      description: { en: 'Solo exhibition at Galeri X, Istanbul.', tr: 'Galeri X, İstanbul\'da kişisel sergi.' },
    },
    {
      year: 2022,
      title: { en: 'Threshold — Solo Exhibition', tr: 'Eşik — Kişisel Sergi' },
      description: { en: 'Solo exhibition at Galeri Apel, Istanbul.', tr: 'Galeri Apel, İstanbul\'da kişisel sergi.' },
    },
    {
      year: 2019,
      title: { en: 'Group Exhibition — Berlin', tr: 'Grup Sergisi — Berlin' },
      description: {
        en: 'Participated in a group exhibition at Galerie Y, Berlin.',
        tr: 'Berlin\'de Galerie Y\'de bir grup sergisine katıldı.',
      },
    },
    {
      year: 2014,
      title: { en: 'Origin — Solo Exhibition', tr: 'Köken — Kişisel Sergi' },
      description: { en: 'Solo exhibition at Galerie Z, Berlin.', tr: 'Berlin\'de Galerie Z\'de kişisel sergi.' },
    },
  ],
};
