export const getDirImages = (globEager: Record<string, any>): string[] => {
  return Object.values(globEager).map(image => image.default)
}