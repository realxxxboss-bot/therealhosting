/**
 * Photograph registry. Every photo is free to use under the Unsplash License and is served from
 * Unsplash's image CDN (src/lib/image-loader.ts sizes it per slot). Photographers are credited on /credits.
 * Rules (docs/BRAND.md): every photo shows web work, the people we host for, or our own product.
 * Never caption a stock person as staff, a client or a testimonial.
 */
export interface Photo {
  /** Unsplash photo id, used for the credit link. */
  id: string;
  /** CDN base URL without query parameters. */
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Dominant colour, shown in the frame while the image loads. */
  color: string;
  author: string;
  username: string;
}

export const photos = {
  heroHome: { id: "kk4J92iaSBk", src: "https://images.unsplash.com/photo-1753164597612-5e71b83fda91", width: 3800, height: 2138, alt: "The owner of a small tailoring business working on a laptop while talking on the phone", color: "#c0c0c0", author: "Vitaly Gariev", username: "silverkblack" },
  nextjs: { id: "f77Bh3inUpE", src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c", width: 5184, height: 3456, alt: "A laptop showing JavaScript code in an editor", color: "#0c2640", author: "Arnold Francisca", username: "clark_fransa" },
  wordpress: { id: "-q_lg2uUTjk", src: "https://images.unsplash.com/photo-1625297673326-14790108da55", width: 7829, height: 5222, alt: "A person writing a new WordPress post on a laptop", color: "#f3f3f3", author: "Justin Morgan", username: "justin_morgan" },
  static: { id: "3bOgxLET16w", src: "https://images.unsplash.com/photo-1702047143580-0f349be86369", width: 6000, height: 4000, alt: "A designer working on web graphics on a laptop", color: "#d98c26", author: "Creatopy", username: "creatopy" },
  tiles: { id: "-zoDZ5gr6rU", src: "https://images.unsplash.com/photo-1789654496055-db59d5df136f", width: 4893, height: 3300, alt: "Close-up of blue and white glazed tiles in a repeating floral pattern", color: "#c0c0c0", author: "Barney Goodman", username: "bgoodpic" },
  migration: { id: "j7vbBmTHmjY", src: "https://images.unsplash.com/photo-1730154838368-c37b1fdebcf6", width: 3091, height: 2048, alt: "A room filled with moving boxes and potted plants", color: "#c0a6a6", author: "Dina Badamshina", username: "dinaamazing" },
  support: { id: "Be5aVKFv9ho", src: "https://images.unsplash.com/photo-1616587226960-4a03badbe8bf", width: 7750, height: 5169, alt: "A person in an office talking on a video call at a laptop", color: "#c0d9d9", author: "LinkedIn Sales Solutions", username: "linkedinsalesnavigator" },
  features: { id: "xcgh5_-QIXc", src: "https://images.unsplash.com/photo-1543269866-487350d6fa5e", width: 5472, height: 3648, alt: "A person working on a laptop in a bright room", color: "#8c8c8c", author: "Brooke Cagle", username: "brookecagle" },
  engineer: { id: "Bn4L8oSTIjc", src: "https://images.unsplash.com/photo-1756830231350-3b501f63c5c1", width: 6240, height: 4160, alt: "Hands typing on a laptop with code on the screen", color: "#8ca6c0", author: "Rahul Mishra", username: "rahuulmiishra" },
  signIn: { id: "aWBPQHfPwVM", src: "https://images.unsplash.com/photo-1758974643303-df01b895e6a7", width: 4160, height: 6240, alt: "A sunlit room with a desk, a chair and a laptop", color: "#e6e3de", author: "Aleksandra Dementeva", username: "alexphotogram" },
  about: { id: "smgTvepind4", src: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b", width: 5184, height: 3888, alt: "A laptop on a desk showing a video call with several people, next to a cup of coffee", color: "#262626", author: "Chris Montgomery", username: "cwmonty" },
  blogRenewal: { id: "54bvLAWhWAM", src: "https://images.unsplash.com/photo-1746221331496-a87689fc8eb9", width: 6000, height: 4000, alt: "A calculator, papers and office supplies on a desk", color: "#d9d9d9", author: "maks_d", username: "maks_d" },
  blogNext: { id: "FBNxmwEVpAc", src: "https://images.unsplash.com/photo-1555066931-bf19f8fd1085", width: 5156, height: 3437, alt: "A laptop showing code on a desk", color: "#597373", author: "Arnold Francisca", username: "clark_fransa" },
  blogWordpress: { id: "aafOjsh-9jU", src: "https://images.unsplash.com/photo-1546795729-f3a5d42087f5", width: 7952, height: 5304, alt: "A person working on a laptop at a table", color: "#c0c0a6", author: "Etienne Boulanger", username: "etienneblg" },
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

/** Link to the photographer's profile with the attribution parameters Unsplash asks for. */
export function photographerUrl(photo: Photo): string {
  return `https://unsplash.com/@${photo.username}?utm_source=zaffre&utm_medium=referral`;
}

export function photoPageUrl(photo: Photo): string {
  return `https://unsplash.com/photos/${photo.id}?utm_source=zaffre&utm_medium=referral`;
}
