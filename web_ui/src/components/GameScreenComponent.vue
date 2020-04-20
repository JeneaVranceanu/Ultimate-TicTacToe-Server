<template>
  <div>
    <div id="game-screen" class="canvas_container">
      <canvas id="canvas" width="512" height="512" class="canvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">

import VueRouter from "vue-router";
import GameBoardController from "../typescript/game_board";
import { Turn } from "../typescript/socket_messages";
import { Shape } from "../typescript/game_board";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class GameScreenComponent extends Vue {
  @Prop() public playerShape!: Shape;

  private gameBoardController = new GameBoardController(this.playerShape)

  /**
   * Creates game board controller for the canvas element
   * where the game play is happening.
   *
   * @param isFirstPlayer boolean argument based on which playing shape is selected
   */
  private createGameBoardController(isFirstPlayer: boolean) {
    this.detachPreviousGameBoardController()
    this.gameBoardController = new GameBoardController(
      isFirstPlayer ? Shape.X : Shape.O
    )

    this.gameBoardController.setCellClickListener((cellOccupied: Turn) => {
      this.gameBoardController.enableGameBoard(false)
      this.onCellSelected(cellOccupied)
    })
  }

  private onCellSelected(cellOccupied: Turn) {
      window.alert(`Cell selected: ${JSON.stringify(cellOccupied)}`)
    // const message = JSON.stringify(
    //   new TurnEmitMessage(this.playerId, this.roomId!, cellOccupied)
    // )
    // this.socketConnectionManager.send(message)
  }

  /**
   * Detaches existing game board controller from UI.
   * Deletes reference to the game board controller.
   */
  private detachPreviousGameBoardController() {
    if (
      this.gameBoardController != null &&
      this.gameBoardController !== undefined
    ) {
      this.gameBoardController.detach()
    }

    delete this.gameBoardController
  }
}
</script>