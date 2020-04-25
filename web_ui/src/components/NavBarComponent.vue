<template>
  <nav class="navbar navbar-default navbar-pf" role="navigation">
    <div class="navbar-header" v-on:click="onClick">
      <h1 id="name-label"></h1>
      <a class="navbar-brand header">
        <h1>
          <strong>{{ this.title }}</strong>
        </h1>
      </a>
      <button id="menu-button" class="btn btn-primary" type="button">Back</button>
    </div>
  </nav>
</template>


<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import router from '../router';
import GameVuexStore from "../../src/vuex_store";

@Component
export default class NavBarComponent extends Vue {
  @Prop() public navBarTitle!: string;

  get title() {
    return `${this.navBarTitle} ${GameVuexStore.state.count}`;
  }

  // Component methods can be declared as instance methods
  onClick(): void {
    if (window.history.length > 1) {
      this.$router.back()
    } else if (this.$router.currentRoute.path != "/") {
      this.$router.replace("/")
    }
  }
}
</script>