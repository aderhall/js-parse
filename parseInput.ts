export interface Length {
    length: number,
}

export interface Slice<I> {
    slice: (start?: number, end?: number) => I,
}
