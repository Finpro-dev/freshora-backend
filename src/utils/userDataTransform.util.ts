export const generateFullName = (
  firstName: string = "",
  lastName: string = "",
): string => {
  const mergedName = `${firstName.trim()} ${lastName.trim()}`.trim();

  return mergedName
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
