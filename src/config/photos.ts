/**
 * Photograph registry. Every photo is free to use under the Unsplash License and is served from
 * Unsplash's image CDN (src/lib/image-loader.ts sizes it per slot). Photographers are credited on /credits.
 * Rules (docs/BRAND.md): never caption a stock person as staff, a client or a testimonial.
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
  heroHome: { id: "CnlDqQ9UUMg", src: "https://images.unsplash.com/photo-1791472655850-8cc28a058d6f", width: 4000, height: 6000, alt: "A woman behind the counter of a small specialty shop, typing on a computer", color: "#404040", author: "GB The Green Brand", username: "gb_the_green_brand" },
  nextjs: { id: "-BPdQEf1dd4", src: "https://images.unsplash.com/photo-1770053506723-c96a4379873b", width: 6977, height: 4651, alt: "A desk with a monitor and plants beside a window", color: "#8c7359", author: "Olivier Amyot", username: "user90807060" },
  wordpress: { id: "FBSLWZ8LKq0", src: "https://images.unsplash.com/photo-1740602985572-65481ae087b2", width: 6192, height: 4128, alt: "A woman arranging flowers in a flower shop", color: "#e9e6e1", author: "Createasea", username: "createasea" },
  static: { id: "Yn8D5B8C-eY", src: "https://images.unsplash.com/photo-1603901622056-0a5bee231395", width: 7111, height: 4785, alt: "Architectural blueprints with drafting pencils, a metal ruler and a storage tube", color: "#737373", author: "Lucas Kepner", username: "lucaskphoto" },
  cobalt: { id: "KymCJNBsuPo", src: "https://images.unsplash.com/photo-1586270215082-01f5e16304d5", width: 5184, height: 3456, alt: "Blue glass bottles and a pitcher beside a white ceramic mug on a windowsill", color: "#dfe3ea", author: "Haley Owens", username: "haleyo" },
  tiles: { id: "-zoDZ5gr6rU", src: "https://images.unsplash.com/photo-1789654496055-db59d5df136f", width: 4893, height: 3300, alt: "Close-up of blue and white glazed tiles in a repeating floral pattern", color: "#c0c0c0", author: "Barney Goodman", username: "bgoodpic" },
  migration: { id: "j7vbBmTHmjY", src: "https://images.unsplash.com/photo-1730154838368-c37b1fdebcf6", width: 3091, height: 2048, alt: "A room filled with moving boxes and potted plants", color: "#c0a6a6", author: "Dina Badamshina", username: "dinaamazing" },
  support: { id: "uedVl7u1nw8", src: "https://images.unsplash.com/photo-1645821522734-26218af51a10", width: 5568, height: 3712, alt: "A person sitting at a table with a pen, notebook and laptop", color: "#d9d9d9", author: "Kelly Sikkema", username: "kellysikkema" },
  engineer: { id: "Bn4L8oSTIjc", src: "https://images.unsplash.com/photo-1756830231350-3b501f63c5c1", width: 6240, height: 4160, alt: "Hands typing on a laptop with code on the screen", color: "#8ca6c0", author: "Rahul Mishra", username: "rahuulmiishra" },
  signIn: { id: "aWBPQHfPwVM", src: "https://images.unsplash.com/photo-1758974643303-df01b895e6a7", width: 4160, height: 6240, alt: "A sunlit room with a desk, a chair and a laptop", color: "#e6e3de", author: "Aleksandra Dementeva", username: "alexphotogram" },
  about: { id: "ZSgWcW70cTs", src: "https://images.unsplash.com/photo-1595351298020-038700609878", width: 6240, height: 4160, alt: "A person shaping stoneware clay on a spinning pottery wheel, with tools in nearby bowls", color: "#e3dfd9", author: "Taylor Heery", username: "taylorheeryphoto" },
  contact: { id: "6AQB5XgIpxU", src: "https://images.unsplash.com/photo-1771153567964-4b781beb5bac", width: 3130, height: 2075, alt: "A man sketching in a notebook at an outdoor café table", color: "#597373", author: "Kristina Bekher", username: "ninjagexly" },
  blogRenewal: { id: "54bvLAWhWAM", src: "https://images.unsplash.com/photo-1746221331496-a87689fc8eb9", width: 6000, height: 4000, alt: "A calculator, papers and office supplies on a desk", color: "#d9d9d9", author: "maks_d", username: "maks_d" },
  blogNext: { id: "cckf4TsHAuw", src: "https://images.unsplash.com/photo-1499750310107-5fef28a66643", width: 6000, height: 4000, alt: "A laptop, a white ceramic coffee mug and a smartphone on a table", color: "#e8e6e3", author: "Andrew Neel", username: "andrewtneel" },
  blogWordpress: { id: "X_7Qb2Tg_6g", src: "https://images.unsplash.com/photo-1642751652611-bb9a7cad58a3", width: 5486, height: 3657, alt: "A woman arranging flowers in a vase on a table", color: "#26260c", author: "Oxana Melis", username: "oksdesign" },
} as const satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof photos;

/** Link to the photographer's profile with the attribution parameters Unsplash asks for. */
export function photographerUrl(photo: Photo): string {
  return `https://unsplash.com/@${photo.username}?utm_source=zaffre&utm_medium=referral`;
}

export function photoPageUrl(photo: Photo): string {
  return `https://unsplash.com/photos/${photo.id}?utm_source=zaffre&utm_medium=referral`;
}
