import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { GameStatus, MovableItems } from "../enums/game-codes";
import { Dimension, MoveRestriction } from "../models/MoveRestriction";

@Injectable({
    providedIn: 'root'
})
export class GameService {
    currentGameStatus : GameStatus = GameStatus.NOT_STARTED;
    
    gameStatus = new Subject<GameStatus>();
    playerScore = new Subject<number>();
    currentLevel = new Subject<number>();
    bulletsRemaining = new Subject<number>();

    moveRestrictions: MoveRestriction[];
    
    imagePath = "../../assets/images/";
    levels:number = 4;
    maximumBulletsPerLevel = 8;
    maximumPredators: number = 3;
    levelUpScore = 5;

    constructor() {
        this.moveRestrictions = [
            new MoveRestriction(MovableItems.BIRD, new Dimension(120, 400, 45, 560, 0, 0, 30), 
                                12, 1, ['BirdD.png', 'BirdU.png']),
            new MoveRestriction(MovableItems.SCORPION, new Dimension(20, 580, 550, 550, 70, 40, 5), 
                                10, 1, ["ScorpionRight.png", "ScorpionLeft.png"]),
            new MoveRestriction(MovableItems.SNIPER, new Dimension(10, 580, 5, 520),
                                1, 30),
            new MoveRestriction(MovableItems.EAGLE, new Dimension(120, 530, 50, 520, 70, 55),
                                11, 1, ['Eagle.png']) ]; 
    }

    GetRestrictions(moveItem: MovableItems) {
        return this.moveRestrictions.find(f => f.item == moveItem);
    }

    UpdateGameStatus(status: GameStatus)
    {
        this.currentGameStatus = status;
        this.gameStatus.next(this.currentGameStatus);
    }

    UpdateScore(score: number)
    {
        this.playerScore.next(score);        
    }

    UpdateLevel(level:number)
    {
        this.currentLevel.next(level);
        if(level == 1) {
            this.moveRestrictions.forEach(m => { if(m.item == MovableItems.SCORPION){m.speed = 10} });
        }
        else {
            this.moveRestrictions.forEach(m => { if(m.item == MovableItems.SCORPION){m.speed = m.speed-1} });
        }
    }

    UpdateBullets(bullets:number)
    {
        this.bulletsRemaining.next(bullets);
    }

    GetPredators(level:number): number
    {
        let curPredators = 2;
    
        if(level >= 2){
            curPredators = curPredators + (level-1);
        }

        return curPredators;
    }
}