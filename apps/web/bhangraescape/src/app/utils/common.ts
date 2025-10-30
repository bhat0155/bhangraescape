export function formatBytes(n: number) {
  if (!Number.isFinite(n)) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(1)} ${units[i]}`;
}

// helper function to grab file extension
export function getExt(name: string): string {
    const i = name.lastIndexOf(".");
    return i >= 0 ? name.slice(i+1).toLowerCase() : "";
}
