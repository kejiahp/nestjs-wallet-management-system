export class Utilities {
  public static daysToSeconds(days: number) {
    return days * 24 * 60 * 60;
  }

  public static generateRandomNumber(length: number): string {
    let randomNumber = '';
    for (let i = 0; i < length; i++) {
      const digit = Math.floor(Math.random() * 10);
      randomNumber += digit.toString();
    }
    return randomNumber;
  }
}
