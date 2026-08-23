function loadsOk(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Whether a painting's (guessed) image URL actually resolves — mirrors the
 * .jpg → .JPG retry PaintingImage does before giving up, so this agrees with
 * what a visitor would actually see rendered.
 */
export async function paintingHasImage(src: string | undefined): Promise<boolean> {
  if (!src) return false;
  if (await loadsOk(src)) return true;
  return src.endsWith('.jpg') ? loadsOk(`${src.slice(0, -4)}.JPG`) : false;
}
