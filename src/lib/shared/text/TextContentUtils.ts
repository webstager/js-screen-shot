export const isTextContentEmpty = (text: string | null | undefined) => {
  if (text == null) return true;
  return text.trim().length === 0;
};
