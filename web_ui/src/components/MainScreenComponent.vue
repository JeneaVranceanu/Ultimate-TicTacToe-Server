<template>
  <div id="main-screen" class="container">
    <div class="row">
      <button
      id="close"
      class="action-button btn btn-primary"
      type="button"
      @click="leaveRoom"
    >Leave Room</button>
    <button
      id="create-button"
      class="action-button btn btn-primary"
      type="button"
      @click="createRoom"
    >Create Room</button>
    <button
      id="connect-to-button"
      class="action-button btn btn-primary"
      type="button"
      @click="connectToSelectedRoom"
    >Connect to Room</button>
    </div>
    <div class="row">
    <textarea id="chat" name="chat"></textarea>
    </div>
    <div class="row">
    <RoomList></RoomList>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import MainScreen from ".././typescript/index";
import RoomList from "../components/RoomList.vue";
import router from "../../src/router";
import App from "../App.vue";
import GameVuexStore from "../../src/vuex_store";

@Component({
  components: {
    RoomList
  }
})

export default class MainScreenComponent extends Vue {
  name = "";

  leaveRoom(): void {
    GameVuexStore.commit('increment')
    // window.alert(`And so I left ${GameVuexStore.state.count}`);
  }

  createRoom(): void {
    GameVuexStore.commit('increment')
    // window.alert(`And so I created ${GameVuexStore.state.count}`);
  }

  connectToSelectedRoom(): void {
    GameVuexStore.commit('increment')
    // window.alert(`And so I connected ${GameVuexStore.state.count}`);
  }

  enter(): void {
    window.alert(`Register: ${this.name}`);
  }
}
</script>