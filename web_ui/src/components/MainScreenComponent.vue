<template>
  <div>
    <button id="close" class="action-button btn btn-primary" type="button">Close</button>
    <button id="create-button" class="action-button btn btn-primary" type="button">Create Room</button>
    <button
      id="connect-to-button"
      class="action-button btn btn-primary"
      type="button"
    >Connect to Room</button>
    <textarea id="chat" name="chat"></textarea>
  </div>
</template>

<script lang="ts">
import { Vue } from "vue-property-decorator";
import MainScreen from ".././typescript/index";
//import RoomList from ".././components/RoomList.vue";

export default Vue.extend({
  components: {
    //RoomList
  },
  data() {
    return {
      title: "matt"
    };
  },
  mounted() {
    new MainScreen();
  },
  methods: {
    buttonClicked() {
      this.router.push("/asd");
    }
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>