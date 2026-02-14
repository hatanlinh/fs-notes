function padZero(num: number, length: number = 2): string {
  return num.toString().padStart(length, "0");
}

export function generateDefaultFileName(): string {
  const now = new Date();

  const day = padZero(now.getDate());
  const month = padZero(now.getMonth() + 1);
  const year = now.getFullYear();

  const hours = padZero(now.getHours());
  const minutes = padZero(now.getMinutes());
  const seconds = padZero(now.getSeconds());

  return `notes_${day}${month}${year}_${hours}${minutes}${seconds}.txt`;
}
