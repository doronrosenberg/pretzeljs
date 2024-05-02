export function generateId(): string {
  const dict = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  let id = "";
  for (let i = 0; i < 6; i++) {
    id += dict[Math.floor(Math.random() * dict.length)];
  }

  return id;
}
