// Jeu de vraies pages de documents (scans de bulletins) servant d'aperçu réaliste
// pour les kinds « doc » à la place du skeleton. Piochées de façon déterministe
// par pièce + page (voir PdfDoc) pour rester stables entre deux rendus.
import d1 from '../../assets/doc-samples/doc-1.png';
import d2 from '../../assets/doc-samples/doc-2.png';
import d3 from '../../assets/doc-samples/doc-3.png';
import d4 from '../../assets/doc-samples/doc-4.png';
import d5 from '../../assets/doc-samples/doc-5.png';
import d6 from '../../assets/doc-samples/doc-6.png';
import d7 from '../../assets/doc-samples/doc-7.png';
import d8 from '../../assets/doc-samples/doc-8.png';

export const DOC_SAMPLE_IMAGES = [d1, d2, d3, d4, d5, d6, d7, d8];

// Hash déterministe (djb2 tronqué) : même clé → même page de départ.
export function docSampleIndex(key = '') {
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = ((h << 5) + h + key.charCodeAt(i)) >>> 0;
  return h % DOC_SAMPLE_IMAGES.length;
}
