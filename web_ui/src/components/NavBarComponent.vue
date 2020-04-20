<template>
  <nav class="navbar navbar-default navbar-pf" role="navigation">
    <div class="navbar-header" v-on:click="onClick">
      <h1 id="name-label"></h1>
      <a class="navbar-brand header">
        <h1>
          <strong>{{ this.navBarTitle }}</strong>
        </h1>
      </a>
      <button id="menu-button" class="btn btn-primary" type="button">Back</button>
    </div>
  </nav>
</template>


<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class NavBarComponent extends Vue {
  @Prop() public navBarTitle!: string;

  get title() {
    return this.navBarTitle;
    // && this.navBarTitle.length > 0
    //   ? this.navBarTitle
    //   : "Default title";
  }

  // Component methods can be declared as instance methods
  onClick(): void {
    window.alert("Alert triggered");
  }
}
</script>
