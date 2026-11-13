const letters: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
  ш: "sh", щ: "sht", ъ: "a", ь: "y", ю: "yu", я: "ya", ѝ: "i"
};

/** Bulgarian recipe filename convention. Keep punctuation so path validation can reject it. */
export function transliterateRecipeName(value: string): string {
  return Array.from(value.normalize("NFC").toLocaleLowerCase("bg-BG"), letter => letters[letter] ?? letter)
    .join("").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}
