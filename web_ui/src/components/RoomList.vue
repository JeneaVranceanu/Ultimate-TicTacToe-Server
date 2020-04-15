<template>
  <div class="RoomList">
    <ul>
      <li v-for="room in roomList" v-bind:key="room.roomId">{{room.roomId}} {{room.roomName}} {{room.playersCount}}/2</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Room } from "../typescript/socket_messages";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RoomList extends Vue {
  roomList!: Room[];
  /**
   * updateRoomsList
   */
  public updateRoomsList(rooms: Room[]) {
    this.roomList = rooms
  }
}
</script>