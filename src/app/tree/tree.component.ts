import { Component, ElementRef, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {
  nest: ElementRef;
  nests: string[] = ["sparrowNest", "nest", "nestEgg", "nestKids"];
  currentLevel: number;
  score: number = 0;level: number = 0;
  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.gameService.playerScore.subscribe(
      result => {this.growNest();}
    )
    this.gameService.currentLevel.subscribe(
      result => {
        this.hideNests();
        this.currentLevel = result;
        this.changeNest(this.currentLevel);
      }
    )
  }

  hideNests()
  {
    this.nests.forEach(n => {
      document.getElementById(n).style.display = "none";
      if(n == "sparrowNest") {
        document.getElementById(n).style.height = "0px";
      }
      else {
        document.getElementById(n).style.width = "0px";
      }
    });
  }

  changeNest(level: number)
  {
    this.level = level;
    this.score = 0;
    this.nest = new ElementRef(document.getElementById(this.nests[level-1]));
    this.nest.nativeElement.style.display = "inline";
  }

  growNest()
  {
    this.score = this.score + 20;

    if(this.level == 1) {
      this.nest.nativeElement.style.height = this.score + "px";
    }
    else {
      this.nest.nativeElement.style.width = this.score + "px";
    }
  }
}
