export class RandomUtils{
    public static randomInt(bottom, top):number {
        return Math.floor( Math.random() * ( 1 + top - bottom ) ) + bottom;
    }
}