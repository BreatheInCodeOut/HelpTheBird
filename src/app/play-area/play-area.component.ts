import { DOCUMENT } from '@angular/common';
import { ElementRef } from '@angular/core';
import { Inject } from '@angular/core';
import { HostListener } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { GameStatus, MovableItems, MoveDirection } from '../enums/game-codes';
import { MoveRestriction } from '../models/MoveRestriction';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-play-area',
  templateUrl: './play-area.component.html',
  styleUrls: ['./play-area.component.scss']
})
export class PlayAreaComponent implements OnInit {
  sniper: ElementRef;
  sniperRestriction: MoveRestriction;
  gameStatus: GameStatus = GameStatus.NOT_STARTED;
  
  currentLevel: number = 0;
  score: number = 0;

  bullets:number;bulletsLeft:number;
  maxLevelPredators:number = 0;
  reloadPredators:number = 0;
  arrPredators: number[];
  
  constructor(private gameService: GameService, private elementRef: ElementRef,
    private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) { }

  ngOnInit(): void {
    this.gameService.gameStatus.subscribe(
      status => { 
        this.gameStatus = status; 
        this.processStatus();
      }
    );
  }

  @HostListener('document:keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    if (this.gameStatus == GameStatus.STARTED)
    {
      let currentLeft = parseInt(this.sniper.nativeElement.style.left);        
      let currentTop = parseInt(this.sniper.nativeElement.style.top);  

      if(event.code === "ArrowLeft" && (currentLeft-this.sniperRestriction.moveBy) >= this.sniperRestriction.dimension.minLeft)
      {
        this.sniper.nativeElement.style.left = (currentLeft-this.sniperRestriction.moveBy) + "px";
      }
      else if(event.code === "ArrowRight" && (currentLeft+this.sniperRestriction.moveBy) <= this.sniperRestriction.dimension.maxLeft)
      {
        this.sniper.nativeElement.style.left = (currentLeft+this.sniperRestriction.moveBy) + "px";
      }
      else if(event.code === "ArrowUp" && (currentTop-this.sniperRestriction.moveBy) >= this.sniperRestriction.dimension.minTop)
      {
        this.sniper.nativeElement.style.top = (currentTop-this.sniperRestriction.moveBy) + "px";
      }
      else if(event.code === "ArrowDown" && (currentTop+this.sniperRestriction.moveBy) <= this.sniperRestriction.dimension.maxTop)
      {
        this.sniper.nativeElement.style.top = (currentTop+this.sniperRestriction.moveBy) + "px";
      }
      else if(event.code === "Enter" && this.bulletsLeft > 0)
      {
        document.getElementById("sniper").style.animation = "rotateSniper .25s linear";
        setTimeout(() => {
          document.getElementById("sniper").style.animation = "";
        }, 1000);
        this.bulletsLeft--;
        this.gameService.UpdateBullets(this.bulletsLeft);
        
        if(this.checkTargetLockedOrNot(document.getElementById("bird")))
        {
          this.gameService.UpdateGameStatus(GameStatus.GAME_OVER);
          this.resetPredators();
          this.showMessage("You shot the bird. Game Over");
        }

        for(var predator=1; predator <= this.maxLevelPredators; predator++)
        {
          if(this.checkTargetLockedOrNot(document.getElementById(MovableItems.SCORPION.toString() + this.currentLevel + "L" + predator)))
          {
            this.reloadPredators--;
            document.getElementById(MovableItems.SCORPION.toString() + this.currentLevel + "L" + predator).remove();
            this.arrPredators.push(predator);
            if(this.reloadPredators == 0) {
              this.reloadPredators++;
              setTimeout(() => {
                this.loadPredators(MovableItems.SCORPION);  
              }, 1500);
            }
          }
        }

        if(this.checkTargetLockedOrNot(document.getElementById(MovableItems.EAGLE.toString() + this.currentLevel + "L")))
        {
          document.getElementById(MovableItems.EAGLE.toString() + this.currentLevel + "L").remove();
        }
      }
    }
  }
  
  initializeGameParameters(){
    this.bullets = this.gameService.maximumBulletsPerLevel;
    this.sniper = new ElementRef(document.getElementById("sniper"));
    this.sniperRestriction = this.gameService.GetRestrictions(MovableItems.SNIPER);
    let birdRestriction = this.gameService.GetRestrictions(MovableItems.BIRD);
    var objBird = document.getElementById("bird");
    objBird.setAttribute("src", this.gameService.imagePath + birdRestriction.images[0]);
    objBird.style.transform = "rotate("+ birdRestriction.dimension.rotate + "deg)";
  }

  processStatus()
  {
    if(this.gameStatus == GameStatus.STARTED){
      this.initializeGameParameters();
      this.startGame();
    }
  }

  startGame()
  {
    this.bulletsLeft = this.bullets;
    this.currentLevel = 1;
    this.score = 0;
    this.gameService.UpdateLevel(this.currentLevel);
    this.gameService.UpdateScore(this.score);
    this.gameService.UpdateBullets(this.bulletsLeft);
    this.showMessage("Game Started");
    this.resetPredators();
    let birdRestriction = this.gameService.GetRestrictions(MovableItems.BIRD);
    var objMove = document.getElementById("bird");
    objMove.style.left = birdRestriction.dimension.minLeft + "px";
    objMove.style.top = birdRestriction.dimension.minTop + "px";
    this.moveObject(objMove.id, MovableItems.BIRD, MoveDirection.TOP_TO_BOTTOM, 
                    birdRestriction.speed);
  }

  loadPredators(itemType: MovableItems)
  {
    if(this.gameStatus == GameStatus.STARTED) {
      let restriction = this.gameService.GetRestrictions(itemType);
      let itemId: string = itemType.toString() + this.currentLevel + "L"
      
      var imgPredator = this.document.createElement('img');

      let top = restriction.dimension.maxTop;
      let left;let direction;

      if(itemType == MovableItems.SCORPION) {
        direction = MoveDirection.LEFT_TO_RIGHT;
        left = restriction.dimension.minLeft;
        itemId = itemId + this.arrPredators.pop();
      }
      else if(itemType == MovableItems.EAGLE) {
        direction = MoveDirection.BOTTOM_TO_TOP;
        left = restriction.dimension.maxLeft;
      }

      imgPredator.id = itemId;
      imgPredator.style.position = "absolute";
      imgPredator.style.top = top + 'px';
      imgPredator.style.left = left + 'px';
      imgPredator.style.width = restriction.dimension.width + 'px';
      imgPredator.style.height = restriction.dimension.height + 'px';
      imgPredator.style.transform = "rotate("+ restriction.dimension.rotate + "deg)";
      imgPredator.src = this.gameService.imagePath + restriction.images[0];
      this.renderer.appendChild(this.elementRef.nativeElement, imgPredator);   
      this.moveObject(itemId, itemType, direction, restriction.speed);
    }  
  }

  resetPredators()
  {
    let level = (this.gameStatus == GameStatus.GAME_OVER)? this.currentLevel: this.currentLevel-1;
    this.clearPredators(level);
    this.reloadPredators = 1;
    this.maxLevelPredators = this.gameService.GetPredators(this.currentLevel);            
    this.arrPredators = new Array();
    for(var idx = 1; idx <= this.maxLevelPredators; idx++) {
      this.arrPredators.push(idx);
    }
    this.loadPredators(MovableItems.SCORPION);
  }

  clearPredators(level: number) 
  {
    for(var remove=1; remove <= this.maxLevelPredators; remove++)
    {
      if(document.getElementById(MovableItems.SCORPION.toString() + level + "L" + remove))
      {
        document.getElementById(MovableItems.SCORPION.toString() + level + "L" + remove).remove();     
      }
    }
    if(document.getElementById(MovableItems.EAGLE + level + "L"))
    {
      document.getElementById(MovableItems.EAGLE.toString() + level + "L").remove();     
    }
  }

  flipImage(objImage: HTMLElement, restriction: MoveRestriction, itemType: MovableItems)
  {
    objImage.setAttribute("src", this.gameService.imagePath + 
                                restriction.images.find(
                                f => 
                                f!= objImage.getAttribute("src").replace(this.gameService.imagePath, "")));
    if(itemType == MovableItems.SCORPION)
    objImage.style.transform = "rotate("+ restriction.dimension.rotate * -1 + "deg)";
  }

  moveObject(itemId: string, itemType: MovableItems, moveTowards: MoveDirection,
            speed: number, moveSide: number = 0)
  {
    let restriction = this.gameService.GetRestrictions(itemType);
    var objMove = document.getElementById(itemId);
    if(this.gameStatus != GameStatus.STARTED || !objMove ||
      this.checkCrash(objMove, itemType, restriction)) {
      return;
    }
    this.checkTargetLockedOrNot(objMove);
    objMove = new ElementRef(objMove).nativeElement;

    let isReturn: boolean = (itemType == MovableItems.BIRD ||
                             itemType == MovableItems.SCORPION)?true:false;

    let curTop = parseInt(objMove.style.top);  
    let curLeft = parseInt(objMove.style.left);

    if(moveTowards == MoveDirection.LEFT_TO_RIGHT) {
      this.moveLeft(objMove, itemType, moveTowards,
        speed, curLeft, restriction, isReturn);    
    }
    else if (moveTowards == MoveDirection.RIGHT_TO_LEFT) {
      this.moveRight(objMove, itemType, moveTowards,
        speed, curLeft, restriction, isReturn);
    }
    else if (moveTowards == MoveDirection.TOP_TO_BOTTOM) {
      this.moveDown(objMove, itemType, moveTowards,
        speed, curLeft, curTop, restriction, isReturn, 
        moveSide);
    }
    else if (moveTowards == MoveDirection.BOTTOM_TO_TOP) {
      this.moveUp(objMove, itemType, moveTowards,
        speed, curLeft, curTop, restriction, isReturn, 
        moveSide);
    }
  }

  checkTargetLockedOrNot(objMove: HTMLElement) : boolean
  {
    if(!objMove) { return false; }
    objMove.style.border = "0px";
    var objSniper = new ElementRef(document.getElementById("sniper")).nativeElement.getBoundingClientRect();
    var objPredator = new ElementRef(objMove).nativeElement.getBoundingClientRect();
    
    if(parseInt(objSniper.top.toString()) < parseInt(objPredator.top.toString()) &&
      parseInt(objSniper.bottom.toString()) > parseInt(objPredator.bottom.toString()) &&
      parseInt(objSniper.left.toString()) < parseInt(objPredator.left.toString()) &&
      parseInt(objSniper.right.toString()) > parseInt(objPredator.right.toString()))
    {
      objMove.style.border = "2px groove red";
      return true;
    }
    return false;
  }
  
  checkCrash(objMove: HTMLElement, itemType: MovableItems, restriction: MoveRestriction)
  {
    if(itemType == MovableItems.EAGLE || itemType == MovableItems.BIRD) {
      return false;
    }

    var objBird = new ElementRef(document.getElementById("bird")).nativeElement.getBoundingClientRect();
    var objPredator = new ElementRef(objMove).nativeElement.getBoundingClientRect();
    
    if(parseInt(objPredator.top.toString()) <= parseInt(objBird.top.toString()) && 
      (parseInt(objPredator.left.toString()) <= parseInt(objBird.left.toString()) &&
       parseInt(objPredator.right.toString())-8 > parseInt(objBird.left.toString())
       || (parseInt(objPredator.left.toString()) < parseInt(objBird.right.toString())-8 &&
       parseInt(objPredator.right.toString()) >= parseInt(objBird.right.toString())))
    )
    { 
      this.showMessage("Game Over");
      this.gameService.UpdateGameStatus(GameStatus.GAME_OVER);
      this.resetPredators();
      return true;
    }
    return false;
  }

  moveLeft(objMove: HTMLElement, itemType: MovableItems, moveTowards: MoveDirection,
          speed: number, curLeft: number, restriction: MoveRestriction, isReturn: boolean)
  {

    if ((curLeft + restriction.moveBy) < restriction.dimension.maxLeft ) {
        objMove.style.left = (curLeft + restriction.moveBy) + "px";
    }
    else if (isReturn)
    {
      if(itemType == MovableItems.SCORPION && 
        this.reloadPredators < this.maxLevelPredators) {
          this.reloadPredators++;
          speed = restriction.speed;
          setTimeout(() => {
            this.loadPredators(itemType);  
          }, 500);
      }
      moveTowards = MoveDirection.RIGHT_TO_LEFT;
      this.flipImage(objMove, restriction, itemType);
    }

    setTimeout(() => {
      this.moveObject(objMove.id, itemType, moveTowards, speed);  
    }, speed);

  }

  moveRight(objMove: HTMLElement, itemType: MovableItems, moveTowards: MoveDirection,
    speed: number, curLeft: number, restriction: MoveRestriction, isReturn: boolean) 
  {
      
    if ((curLeft - restriction.moveBy) > restriction.dimension.minLeft) {
      objMove.style.left = (curLeft - restriction.moveBy) + "px"; 
    }
    else if (isReturn)
    {
      moveTowards = MoveDirection.LEFT_TO_RIGHT;        
      this.flipImage(objMove, restriction, itemType);
    }    

    setTimeout(() => {
      this.moveObject(objMove.id, itemType, moveTowards, speed);  
    }, speed);

  }

  moveUp(objMove: HTMLElement, itemType: MovableItems, moveTowards: MoveDirection,
    speed: number, curLeft:number, curTop: number, restriction: MoveRestriction, isReturn: boolean, 
    moveSide: number) 
  {

    if (moveSide > 3 && (curLeft - restriction.moveBy) > restriction.dimension.minLeft) {
      if(itemType == MovableItems.EAGLE) {
        objMove.style.left = (curLeft - restriction.moveBy) + "px"; 
      }
      else {
        objMove.style.left = (curLeft - restriction.moveBy) + "px"; 
      }
    }

    if ((curTop - restriction.moveBy) > restriction.dimension.minTop) {
      objMove.style.top = (curTop - restriction.moveBy) + "px";
      moveSide++;
    }
    else if(isReturn)
    {
      if(itemType == MovableItems.BIRD) {
        this.updateScoreAndLevel();
      }
      moveTowards = MoveDirection.TOP_TO_BOTTOM;
      this.flipImage(objMove, restriction, itemType);
    }
    else if(itemType == MovableItems.EAGLE && (curLeft - restriction.moveBy) <= restriction.dimension.minLeft) {
      this.showMessage("Game Over");
      this.gameService.UpdateGameStatus(GameStatus.GAME_OVER);
      this.resetPredators();
    }
    else {
      moveSide++;
    }
    
    if(moveSide > 6) moveSide = 0;

    setTimeout(() => {
      this.moveObject(objMove.id, itemType, moveTowards, speed, moveSide);  
    }, speed);
  }

  moveDown(objMove: HTMLElement, itemType: MovableItems, moveTowards: MoveDirection,
    speed: number, curLeft:number, curTop: number, restriction: MoveRestriction, isReturn: boolean, 
    moveSide: number) {
      
    if (moveSide > 3 && (curLeft + restriction.moveBy) < restriction.dimension.maxLeft) {
      objMove.style.left = (curLeft + restriction.moveBy) + "px"; 
    }
    
    if ((curTop + restriction.moveBy) < restriction.dimension.maxTop) {
      objMove.style.top = (curTop + restriction.moveBy) + "px"; 
      moveSide++;
    }
    else if(isReturn)
    {
      moveTowards = MoveDirection.BOTTOM_TO_TOP;
      this.flipImage(objMove, restriction, itemType);
      if(this.currentLevel > 1 &&
        this.score + 3 >= this.currentLevel * this.gameService.levelUpScore && 
        this.score + 1 < this.currentLevel * this.gameService.levelUpScore) {
        this.loadPredators(MovableItems.EAGLE); }
    }

    if(moveSide > 6) moveSide = 0;
    
    setTimeout(() => {
      this.moveObject(objMove.id, itemType, moveTowards, speed, moveSide);  
    }, speed);

  }

  updateScoreAndLevel()
  {
    this.score++;
    this.gameService.UpdateScore(this.score);
    if (this.score == this.currentLevel * this.gameService.levelUpScore) {
     setTimeout(() => {
       this.newLevel();
     }, 2000); 
    }
  }

  newLevel()
  {
    if(this.currentLevel < this.gameService.levels) {
      this.currentLevel++;
      this.showMessage("Level Up");
      this.gameService.UpdateLevel(this.currentLevel);
      this.resetPredators(); 
      this.bulletsLeft = this.bullets + this.bulletsLeft;
      this.gameService.UpdateBullets(this.bulletsLeft);
    }
    else {
      this.showMessage("Bravo!!! You Won the Game!!!");
      this.gameService.UpdateGameStatus(GameStatus.WON);
    }
  }

  showMessage(message: string){
    document.getElementById("message").innerText = message;
    setTimeout(() => {
      document.getElementById("message").innerText = "";
    }, 2000);
  }
}