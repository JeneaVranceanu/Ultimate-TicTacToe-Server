<template>
  <div>
    <NavBarComponent :navBarTitle="title"></NavBarComponent>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import NavBarComponent from "./components/NavBarComponent.vue";

@Component({
  components: {
    NavBarComponent
  }
})
export default class App extends Vue {
  title = "TicTacToe";
}
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
