const bannedTerms = ["how to build a bomb", "racial supremacy", "child abuse"];

export function validateTopic(topic: string): string | null {
  const normalized = topic.trim();
  if (!normalized) return "Please enter a topic first.";
  if (normalized.length < 3) return "Try a more specific topic, for example “TypeScript generics”.";
  if (["stuff", "things", "everything"].includes(normalized.toLowerCase())) {
    return "Try a more specific topic so the course can be genuinely useful.";
  }
  if (normalized.split(" ").length <= 1 && normalized.length < 6) {
    return "Could you make the topic slightly more specific?";
  }
  if (bannedTerms.some((term) => normalized.toLowerCase().includes(term))) {
    return "That topic is not supported. Please try a different learning topic.";
  }
  return null;
}
