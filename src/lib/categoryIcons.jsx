import {
  Tag, Sparkles, Star, Heart, Eye, Palette, Pencil,
  Droplets, Droplet, FlaskConical, Layers, Smile, Sun, Moon,
  Zap, Shield, Feather, Gem, Crown, Wand2, Package, Gift,
  Flower2, Leaf, Flame, Rainbow, PaintBucket, Paintbrush, Scissors, Shapes, Cherry, Sprout,
} from "lucide-react";

export const AVAILABLE_ICONS = {
  Tag, Sparkles, Star, Heart, Eye, Palette, Pencil,
  Droplets, Droplet, FlaskConical, Layers, Smile, Sun, Moon,
  Zap, Shield, Feather, Gem, Crown, Wand2, Package, Gift,
  Flower2, Leaf, Flame, Rainbow, PaintBucket, Paintbrush, Scissors, Shapes, Cherry, Sprout,
};

export const DEFAULT_ICON_NAME = "Tag";

export function getCategoryIcon(name) {
  return AVAILABLE_ICONS[name] || Tag;
}
