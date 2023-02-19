export class BaseRepo<T> {
    // expose all as public for convenience
    dbList: T[];

    constructor() {
        this.dbList = new Array<T>();
    }

    clear = (): void => {
        this.dbList = [];
    };

    count = (): number => {
        return this.dbList.length;
    };

    update = (index: number, item: T): T => {
        this.dbList[index] = item;
        return item;
    };

    add = (item: T): T => {
        this.dbList.push(item);
        return item;
    };

    get = (index: number): T => {
        return this.dbList[index];
    };

    getList = (): T[] => {
        return this.dbList;
    };

    first = (): T => {
        return this.dbList[0];
    };

    last = (): T => {
        return this.dbList[this.dbList.length - 1];
    };

    delete = (index: number): T[] => {
        return this.dbList.splice(index, 1);
    };
}
