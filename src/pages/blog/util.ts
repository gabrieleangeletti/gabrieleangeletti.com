import { interpolateRainbow } from "d3-scale-chromatic";
import { rgb } from "d3-color";

export const getTagColor = (tag: string) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }

  const normalizedHash = (hash & 0x7fffffff) / 0x7fffffff;
  const backgroundColor = interpolateRainbow(normalizedHash);

  const color = rgb(backgroundColor);
  const luminance = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
  const textColor = luminance > 0.5 ? "black" : "white";

  return { backgroundColor, textColor };
};
