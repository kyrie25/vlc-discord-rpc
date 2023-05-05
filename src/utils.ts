export const seasonRegex = /(?:- ?)?(?:s|season )(\d+)/gi;

export const episodeRegex = /(?:- ?)?(?:e|episode )?(\d+)( [\w'"\- ]+)?$/gi;

// Function to generate a random password
export function randomPass() {
  return Math.random().toString(36).slice(-8);
}

export function processTitle(title: string) {
  return title
    .replace(/ *[\(\[][\w~+\- ]+[\)\]] */g, "") // Remove anything in parentheses or brackets
    .replace(/[\(\[]?\d+p[\)\]]?/, "") // Remove the resolution
    .replace(/\.\w+$/, "") // Remove the file extension
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/ +/g, " ") // Replace multiple spaces with one
    .replace(/v\d+$/gi, "") // Remove the version number
    .trim();
}

export function processPresence(presence: Record<string, any>) {
  Object.entries(presence).forEach(([key, value]) => {
    if (!value && value !== false) delete presence[key];
  });
  return presence;
}

export function isMatchingTitle(title: string, search: string) {
  if (!title || !search) return false;

  title = title.toLowerCase();
  search = search.toLowerCase();

  return title.includes(search) || search.includes(title);
}
