import { format, parseISO, isValid } from "date-fns";

export const formatDate = (
  date: string | Date | null | undefined,
  formatString: string
): string => {
  try {
    if (!date) {
      return "No date";
    }

    let dateValue: Date;

    if (typeof date === "string") {
      // Try to parse ISO string
      dateValue = parseISO(date);
    } else {
      // Handle Date object
      dateValue = date;
    }

    // Validate the date
    if (!isValid(dateValue)) {
      return "Invalid date";
    }

    return format(dateValue, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};
