export function lastElementOf<T>(list: T[]): T | undefined {
    if (list.length === 0) {
        return undefined;
    }
    return list[list.length - 1];
}