import { MovableItems } from "../enums/game-codes";

export class MoveRestriction{
    public item: MovableItems;
    public dimension: Dimension;
    public speed: number;
    public moveBy: number = 1;
    public images: string[];


    constructor(item: MovableItems, 
                dimension: Dimension,
                speed: number, moveBy: number = 1,
                images: string[] = [""])
    {
        this.item = item;
        this.dimension = dimension;
        this.speed = speed;
        this.moveBy = moveBy;
        this.images = images;
    }
}

export class Dimension{
    public minLeft: number;
    public maxLeft: number;
    public minTop: number;
    public maxTop: number;
    public width: number;
    public height: number; 
    public rotate: number;  

    constructor(
        minLeft: number, maxLeft: number,
        minTop: number, maxTop: number,
        width: number = 0, height: number = 0, rotate: number = 0
    ) {
        this.minLeft = minLeft;
        this.maxLeft = maxLeft;
        this.minTop = minTop;
        this.maxTop = maxTop;
        this.width = width;
        this.height = height;
        this.rotate = rotate;
    }
}