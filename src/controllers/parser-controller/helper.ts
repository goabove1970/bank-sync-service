export function parseNumber(line: string): number | undefined {
  try {
    const number = Number.parseFloat(line);
    return number;
  } catch (error) {
    console.log(JSON.stringify(error, null, 4));
  }
  return undefined;
}

export function parseAmount(line: string): number | undefined {
  return parseNumber(line);
}

export function parseBalance(line: string): number | undefined {
  return parseNumber(line);
}
