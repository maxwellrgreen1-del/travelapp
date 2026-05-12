/** Human-readable action line for each inbox `type` (matches product copy). */
export function notificationActionLine(type: string): string {
  switch (type) {
    case "like":
      return "liked your trip";
    case "comment":
      return "commented on your trip";
    case "follow":
      return "started following you";
    default:
      return "sent you an update";
  }
}
