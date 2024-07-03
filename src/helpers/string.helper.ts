export const getLastWord = (text: string): string => {
  const words = text.trim().split(/\s+/);
  const lastWord = words[words.length - 1];

  return lastWord;
}

export function removeExtraSpaces(str: string) {
  return str.replace(/\s+/g, ' ');
}