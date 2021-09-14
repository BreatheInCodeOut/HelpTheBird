import { Component, OnInit } from '@angular/core';
import { GameStatus } from '../enums/game-codes';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-score-card',
  templateUrl: './score-card.component.html',
  styleUrls: ['./score-card.component.scss']
})
export class ScoreCardComponent implements OnInit {
  score: number = 0;
  level: number = 1;
  totalLevels: number = 0;
  showStart: boolean = true;
  showTryAgain: boolean = false;
  arrBullets: string[] = [];
  gameStatus: string;
  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.totalLevels = this.gameService.levels;
    this.gameService.gameStatus.subscribe(
      result => {
        this.gameStatus = this.gameService.currentGameStatus.toString();
        if(result == GameStatus.GAME_OVER || result == GameStatus.WON)
        {
          this.showTryAgain = true;
          if(result == GameStatus.WON) {
            this.level++;
          }
        }
      }
    );
    this.gameService.playerScore.subscribe(
      result => {this.score = result;}
    )
    this.gameService.currentLevel.subscribe(
      result => {this.level = result;}
    )
    this.gameService.bulletsRemaining.subscribe(
      result => {this.arrBullets = new Array(result);}
    )
  }

  OnStart()
  {
    this.gameService.UpdateGameStatus(GameStatus.STARTED);
    this.showStart = false;
    this.showTryAgain = false;
  }
}