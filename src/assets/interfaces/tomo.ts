//x and y are position coordinates, xV and yV are velocity, and xLoc and yLoc are the coordinates of the current destination when moving towards a specific spot
export interface tomo {
    x: number;
    y: number;
    xV: number;
    yV: number;
    planTimer: number;
    interruptible: boolean;
    xLoc?: number;
    yLoc?: number;
    color: string;
    houseColor: string;
    inHouse: boolean;
}