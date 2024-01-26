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

  public static generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  public static intToFloat(num: number, decPlaces: number) {
    return num.toFixed(decPlaces);
  }

  public static generateRandomAlphanumeric(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }

    return result;
  }

  public static generateReference(): string {
    const randomPart = this.generateRandomAlphanumeric(15);
    const formattedCode = `REF_${randomPart}`;

    return formattedCode;
  }

  public static koboToNaira(amount: number): number {
    return amount / 100;
  }
}
